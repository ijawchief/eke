import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { initializeTransaction } from "@/lib/paystack";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { product_id, email, name, phone, bump_product_id, attribution } = body;
  const country = req.headers.get("x-vercel-ip-country") ?? null;
  const city = req.headers.get("x-vercel-ip-city") ?? null;

  if (!product_id || !email) {
    return NextResponse.json({ error: "product_id and email are required" }, { status: 400 });
  }

  const db = getServiceClient();

  // Validate product (server-side price, never trust client)
  const { data: product, error: productErr } = await db
    .from("product")
    .select("id, price_kobo, currency, active, name, creator_id")
    .eq("id", product_id)
    .eq("active", true)
    .single();

  if (productErr || !product) {
    return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 });
  }

  let bumpProduct = null;
  if (bump_product_id) {
    const { data } = await db
      .from("product")
      .select("id, price_kobo, active")
      .eq("id", bump_product_id)
      .eq("active", true)
      .single();
    bumpProduct = data;
  }

  const subtotal = product.price_kobo + (bumpProduct?.price_kobo ?? 0);
  const total = subtotal;

  // Upsert customer
  const { data: customer, error: custErr } = await db
    .from("customer")
    .upsert({ email: email.toLowerCase().trim(), name: name || null, phone: phone || null }, { onConflict: "email" })
    .select("id")
    .single();

  if (custErr || !customer) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }

  const eventId = randomUUID();
  const paystackReference = `eke_${randomUUID().replace(/-/g, "")}`;

  // Create pending order
  const { data: order, error: orderErr } = await db
    .from("order")
    .insert({
      customer_id: customer.id,
      status: "pending",
      subtotal_kobo: subtotal,
      total_kobo: total,
      currency: product.currency,
      paystack_reference: paystackReference,
      attribution: attribution ?? {},
      event_id: eventId,
      country,
      city,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  // Create order items
  const items = [
    { order_id: order.id, product_id: product.id, kind: "main", price_kobo: product.price_kobo, creator_id: product.creator_id ?? null },
  ];
  if (bumpProduct) {
    const { data: bumpFull } = await db.from("product").select("creator_id").eq("id", bumpProduct.id).single();
    items.push({ order_id: order.id, product_id: bumpProduct.id, kind: "bump", price_kobo: bumpProduct.price_kobo, creator_id: bumpFull?.creator_id ?? null });
  }

  await db.from("order_item").insert(items);

  // Initialize Paystack
  try {
    const ps = await initializeTransaction({
      email: email.toLowerCase().trim(),
      amount: total,
      reference: paystackReference,
      metadata: { order_id: order.id, custom_fields: [{ display_name: "Order ID", variable_name: "order_id", value: order.id }] },
    });

    return NextResponse.json({
      access_code: ps.access_code,
      authorization_url: ps.authorization_url,
      order_id: order.id,
      event_id: eventId,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
