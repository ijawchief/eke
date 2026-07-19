import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { verifyTransaction } from "@/lib/paystack";
import { sendDeliveryEmail, sendSaleNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const adminToken = req.cookies.get("admin_token")?.value
    ?? req.headers.get("cookie")?.match(/admin_token=([^;]+)/)?.[1];
  if (!adminToken || decodeURIComponent(adminToken) !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { order_id } = await req.json();
  const db = getServiceClient();

  const { data: order } = await db
    .from("order")
    .select("id, status, total_kobo, currency, event_id, attribution, customer_id, paystack_reference")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status === "paid") return NextResponse.json({ message: "Already paid" });

  // Verify with Paystack
  const ps = await verifyTransaction(order.paystack_reference);
  if (ps.status !== "success") {
    return NextResponse.json({ error: `Paystack status: ${ps.status}` }, { status: 400 });
  }

  // Mark paid
  await db.from("order").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", order.id);

  await db.from("transaction").insert({
    order_id: order.id,
    paystack_reference: order.paystack_reference,
    amount_kobo: ps.amount,
    status: "success",
    channel: ps.channel,
    raw: ps,
  });

  await db.from("ledger_entry").insert({
    order_id: order.id,
    entry_type: "sale",
    direction: "credit",
    amount_kobo: ps.amount,
    currency: order.currency,
    reference: order.paystack_reference,
  });

  const { data: items } = await db.from("order_item").select("product_id, kind").eq("order_id", order.id);
  const { data: customer } = await db.from("customer").select("email, name, phone").eq("id", order.customer_id).single();
  const productIds = (items ?? []).map((i: { product_id: string }) => i.product_id);

  const { data: products } = await db
    .from("product")
    .select("id, name, external_url, delivery_type, file_ref, creator_id, webhook_url")
    .in("id", productIds);

  const fulfillments = (products ?? []).map((p: { id: string; delivery_type: string; external_url: string | null; file_ref: string | null }) => ({
    order_id: order.id,
    product_id: p.id,
    access_type: p.delivery_type,
    external_ref: p.delivery_type === "magic_link" ? (p.external_url ?? "") : (p.file_ref ?? ""),
    status: "granted",
  }));
  if (fulfillments.length) await db.from("fulfillment").insert(fulfillments);

  const creatorIds = [...new Set((products ?? []).map((p: { creator_id?: string | null }) => p.creator_id).filter(Boolean))] as string[];
  const { data: creators } = creatorIds.length
    ? await db.from("creator").select("id, email").in("id", creatorIds)
    : { data: [] };
  const creatorEmailMap = Object.fromEntries((creators ?? []).map((c: { id: string; email: string }) => [c.id, c.email]));

  await Promise.allSettled([
    ...(products ?? []).map(async (p: { id: string; name: string; delivery_type: string; external_url: string | null; file_ref: string | null }) => {
      if (customer?.email) {
        await sendDeliveryEmail({
          to: customer.email,
          productName: p.name,
          accessLink: p.delivery_type === "magic_link" ? (p.external_url ?? "") : (p.file_ref ?? ""),
          orderRef: order.paystack_reference,
          buyerName: customer.name ?? null,
          amountKobo: order.total_kobo,
        });
      }
    }),
    ...(products ?? []).map(async (p: { id: string; name: string; creator_id?: string | null }) => {
      const creatorEmail = p.creator_id ? creatorEmailMap[p.creator_id] : null;
      if (creatorEmail && customer?.email) {
        await sendSaleNotification({
          to: creatorEmail,
          productName: p.name,
          buyerName: customer.name ?? null,
          buyerEmail: customer.email,
          amountKobo: order.total_kobo,
          orderRef: order.paystack_reference,
        });
      }
    }),
  ]);

  return NextResponse.json({ ok: true, message: "Order fulfilled and emails sent" });
}
