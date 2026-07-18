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
    .select("email, name, phone")
    .eq("id", order.customer_id)
    .single();

  // Fulfillments + emails (run async but after DB writes)
  const productIds = (items ?? []).map((i: { product_id: string }) => i.product_id);
  const { data: products } = await db
    .from("product")
    .select("id, name, external_url, delivery_type, file_ref, meta_pixel_id, meta_capi_token, webhook_url")
    .in("id", productIds);

  const fulfillments = (products ?? []).map((p: { id: string; delivery_type: string; external_url: string | null; file_ref: string | null }) => ({
    order_id: order.id,
    product_id: p.id,
    access_type: p.delivery_type,
    external_ref: p.delivery_type === "magic_link" ? (p.external_url ?? "") : (p.file_ref ?? ""),
    status: "granted",
  }));

  if (fulfillments.length) await db.from("fulfillment").insert(fulfillments);

  // CAPI + email + marketing webhooks (fire and forget)
  const attribution = order.attribution as Record<string, string | null>;
  const primaryProduct = (products ?? [])[0] as {
    id: string; name: string; delivery_type: string; external_url: string | null; file_ref: string | null;
    meta_pixel_id?: string | null; meta_capi_token?: string | null; webhook_url?: string | null;
  } | undefined;

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
      pixelId: primaryProduct?.meta_pixel_id,
      accessToken: primaryProduct?.meta_capi_token,
    }),
    // Fire email marketing webhook for each product that has one
    ...(products ?? []).map(async (p: { id: string; name: string; delivery_type: string; external_url: string | null; file_ref: string | null; webhook_url?: string | null }) => {
      if (p.webhook_url && customer?.email) {
        fetch(p.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "purchase",
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            product_id: p.id,
            product_name: p.name,
            amount_kobo: order.total_kobo,
            currency: order.currency,
            order_ref: reference,
          }),
        }).catch(() => {});
      }
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

  // Affiliate commission
  const affiliateRef = (attribution as Record<string, string | null>)?.affiliate_ref;
  if (affiliateRef && (products ?? []).length > 0) {
    try {
      const { data: affiliate } = await db
        .from("affiliate")
        .select("id, balance_kobo, total_earned_kobo")
        .eq("username", affiliateRef.toLowerCase())
        .single();

      if (affiliate) {
        // Get commission rate: product-level override or platform default
        const firstProduct = (products ?? [])[0] as { id: string; affiliate_commission_rate?: number | null };
        let commissionRate = 10.0;
        if (firstProduct?.affiliate_commission_rate != null) {
          commissionRate = firstProduct.affiliate_commission_rate;
        } else {
          const { data: config } = await db.from("affiliate_config").select("commission_rate").eq("id", 1).single();
          if (config) commissionRate = config.commission_rate;
        }

        const commissionKobo = Math.round(order.total_kobo * commissionRate / 100);

        await db.from("affiliate_commission").insert({
          affiliate_id: affiliate.id,
          order_id: order.id,
          product_id: firstProduct.id,
          amount_kobo: commissionKobo,
          status: "pending",
        });

        await db.from("affiliate").update({
          balance_kobo: affiliate.balance_kobo + commissionKobo,
          total_earned_kobo: affiliate.total_earned_kobo + commissionKobo,
        }).eq("id", affiliate.id);
      }
    } catch { /* don't fail webhook for affiliate errors */ }
  }

  return NextResponse.json({ received: true });
}
