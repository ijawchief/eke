import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { getServiceClient } from "@/lib/supabase";
import { sendCapiPurchase } from "@/lib/capi";
import { sendDeliveryEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  if (payload.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const data = payload.data;
  const reference = data.reference;
  const db = getServiceClient();

  // Idempotency check
  const { data: order } = await db
    .from("order")
    .select("id, status, total_kobo, currency, event_id, attribution, customer_id, paystack_reference")
    .eq("paystack_reference", reference)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status === "paid") return NextResponse.json({ received: true });

  // Mark paid
  await db
    .from("order")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      paystack_authorization: data.authorization?.authorization_code ?? null,
    })
    .eq("id", order.id);

  // Insert transaction
  await db.from("transaction").insert({
    order_id: order.id,
    paystack_reference: reference,
    amount_kobo: data.amount,
    status: "success",
    channel: data.channel,
    raw: data,
  });

  // Ledger: sale credit
  await db.from("ledger_entry").insert({
    order_id: order.id,
    entry_type: "sale",
    direction: "credit",
    amount_kobo: data.amount,
    currency: order.currency,
    reference,
  });

  // Get order items to create fulfillments
  const { data: items } = await db
    .from("order_item")
    .select("product_id, kind")
    .eq("order_id", order.id);

  // Get customer
  const { data: customer } = await db
    .from("customer")
    .select("email, phone")
    .eq("id", order.customer_id)
    .single();

  // Fulfillments + emails (run async but after DB writes)
  const productIds = (items ?? []).map((i: { product_id: string }) => i.product_id);
  const { data: products } = await db
    .from("product")
    .select("id, name, external_url, delivery_type, file_ref")
    .in("id", productIds);

  const fulfillments = (products ?? []).map((p: { id: string; delivery_type: string; external_url: string | null; file_ref: string | null }) => ({
    order_id: order.id,
    product_id: p.id,
    access_type: p.delivery_type,
    external_ref: p.delivery_type === "magic_link" ? (p.external_url ?? "") : (p.file_ref ?? ""),
    status: "granted",
  }));

  if (fulfillments.length) await db.from("fulfillment").insert(fulfillments);

  // CAPI + email (fire and forget — errors must not affect 200 response)
  const attribution = order.attribution as Record<string, string | null>;
  Promise.allSettled([
    sendCapiPurchase({
      eventId: order.event_id,
      email: customer?.email ?? "",
      phone: customer?.phone ?? null,
      valueKobo: order.total_kobo,
      currency: order.currency,
      fbp: attribution?.fbp ?? undefined,
      fbc: attribution?.fbc ?? undefined,
      sourceUrl: attribution?.landing_url ?? undefined,
    }),
    ...(products ?? []).map(async (p: { id: string; name: string; delivery_type: string; external_url: string | null; file_ref: string | null }) => {
      if (customer?.email) {
        await sendDeliveryEmail({
          to: customer.email,
          productName: p.name,
          accessLink: p.delivery_type === "magic_link" ? (p.external_url ?? "") : (p.file_ref ?? ""),
          orderRef: reference,
        });
      }
    }),
  ]);

  return NextResponse.json({ received: true });
}
