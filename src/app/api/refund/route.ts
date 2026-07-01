import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// Admin-triggered manual refund
export async function POST(req: NextRequest) {
  // Require an admin secret header to protect this endpoint
  const adminToken = req.headers.get("x-admin-token");
  if (adminToken !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { order_id, reason, revoke_access } = await req.json();
  if (!order_id) return NextResponse.json({ error: "order_id required" }, { status: 400 });

  const db = getServiceClient();

  const { data: order } = await db
    .from("order")
    .select("id, status, total_kobo, currency, paystack_reference")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status === "refunded") return NextResponse.json({ error: "Already refunded" }, { status: 409 });

  // Mark refunded
  await db.from("order").update({ status: "refunded" }).eq("id", order_id);

  // Append ledger entry
  await db.from("ledger_entry").insert({
    order_id,
    entry_type: "refund",
    direction: "debit",
    amount_kobo: order.total_kobo,
    currency: order.currency,
    reference: order.paystack_reference,
    metadata: { reason: reason ?? "manual refund" },
  });

  if (revoke_access) {
    await db
      .from("fulfillment")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("order_id", order_id);
  }

  return NextResponse.json({ success: true });
}
