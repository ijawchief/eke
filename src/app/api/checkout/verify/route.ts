import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { reference } = await req.json();
  if (!reference) return NextResponse.json({ error: "reference required" }, { status: 400 });

  const db = getServiceClient();
  const { data: order } = await db
    .from("order")
    .select("id, status, event_id")
    .eq("paystack_reference", reference)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.status === "paid") {
    return NextResponse.json({ status: "paid", order_id: order.id, event_id: order.event_id });
  }

  try {
    const tx = await verifyTransaction(reference);
    return NextResponse.json({ status: tx.status, order_id: order.id, event_id: order.event_id });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
