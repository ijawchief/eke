import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { getServiceClient } from "@/lib/supabase";

async function getProductAccess(db: ReturnType<typeof getServiceClient>, orderId: string) {
  const { data: items } = await db
    .from("order_item")
    .select("product_id")
    .eq("order_id", orderId);

  if (!items?.length) return [];

  const { data: products } = await db
    .from("product")
    .select("id, name, delivery_type, external_url, file_ref")
    .in("id", items.map((i: { product_id: string }) => i.product_id));

  return (products ?? []).map((p: { id: string; name: string; delivery_type: string; external_url: string | null; file_ref: string | null }) => ({
    name: p.name,
    access_link: p.delivery_type === "magic_link" ? (p.external_url ?? "") : (p.file_ref ?? ""),
  })).filter((p: { access_link: string }) => p.access_link);
}

export async function POST(req: NextRequest) {
  const { reference } = await req.json();
  if (!reference) return NextResponse.json({ error: "reference required" }, { status: 400 });

  const db = getServiceClient();
  let { data: order } = await db
    .from("order")
    .select("id, status, event_id, paystack_reference")
    .eq("paystack_reference", reference)
    .single();

  if (!order) {
    const { data: byId } = await db
      .from("order")
      .select("id, status, event_id, paystack_reference")
      .eq("id", reference)
      .single();
    order = byId;
  }

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.status === "paid") {
    const products = await getProductAccess(db, order.id);
    return NextResponse.json({ status: "paid", order_id: order.id, event_id: order.event_id, products });
  }

  try {
    const tx = await verifyTransaction(order.paystack_reference);
    const products = tx.status === "success" ? await getProductAccess(db, order.id) : [];
    return NextResponse.json({ status: tx.status, order_id: order.id, event_id: order.event_id, products });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
