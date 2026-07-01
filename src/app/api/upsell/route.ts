import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { chargeAuthorization } from "@/lib/paystack";
import { sendCapiPurchase } from "@/lib/capi";
import { sendDeliveryEmail } from "@/lib/email";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { order_id, upsell_product_id } = await req.json();
  if (!order_id || !upsell_product_id) {
    return NextResponse.json({ error: "order_id and upsell_product_id required" }, { status: 400 });
  }

  const db = getServiceClient();

  const { data: order } = await db
    .from("order")
    .select("id, customer_id, paystack_authorization, currency, attribution, event_id")
    .eq("id", order_id)
    .eq("status", "paid")
    .single();

  if (!order || !order.paystack_authorization) {
    return NextResponse.json({ error: "Order not found or no saved authorization" }, { status: 404 });
  }

  const { data: product } = await db
    .from("product")
    .select("id, name, price_kobo, external_url, delivery_type, file_ref, active")
    .eq("id", upsell_product_id)
    .eq("active", true)
    .single();

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const { data: customer } = await db
    .from("customer")
    .select("email, phone")
    .eq("id", order.customer_id)
    .single();

  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const newReference = `eke_us_${randomUUID().replace(/-/g, "")}`;
  const newEventId = randomUUID();

  // Charge via saved authorization
  let chargeData;
  try {
    chargeData = await chargeAuthorization({
      authorization_code: order.paystack_authorization,
      email: customer.email,
      amount: product.price_kobo,
      reference: newReference,
      metadata: { order_id, upsell: true },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }

  if (chargeData.status !== "success") {
    return NextResponse.json({ error: "Charge failed", detail: chargeData.gateway_response }, { status: 402 });
  }

  // New order item
  await db.from("order_item").insert({
    order_id,
    product_id: product.id,
    kind: "upsell",
    price_kobo: product.price_kobo,
  });

  // Transaction
  await db.from("transaction").insert({
    order_id,
    paystack_reference: newReference,
    amount_kobo: product.price_kobo,
    status: "success",
    channel: chargeData.channel,
    raw: chargeData,
  });

  // Ledger
  await db.from("ledger_entry").insert({
    order_id,
    entry_type: "sale",
    direction: "credit",
    amount_kobo: product.price_kobo,
    currency: order.currency,
    reference: newReference,
  });

  // Fulfillment
  await db.from("fulfillment").insert({
    order_id,
    product_id: product.id,
    access_type: product.delivery_type,
    external_ref: product.delivery_type === "magic_link" ? (product.external_url ?? "") : (product.file_ref ?? ""),
    status: "granted",
  });

  const attribution = order.attribution as Record<string, string | null>;
  Promise.allSettled([
    sendCapiPurchase({
      eventId: newEventId,
      email: customer.email,
      phone: customer.phone ?? null,
      valueKobo: product.price_kobo,
      currency: order.currency,
      fbp: attribution?.fbp ?? undefined,
      fbc: attribution?.fbc ?? undefined,
    }),
    sendDeliveryEmail({
      to: customer.email,
      productName: product.name,
      accessLink: product.delivery_type === "magic_link" ? (product.external_url ?? "") : (product.file_ref ?? ""),
      orderRef: newReference,
    }),
  ]);

  return NextResponse.json({ success: true, event_id: newEventId });
}
