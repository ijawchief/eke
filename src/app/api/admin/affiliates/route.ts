import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const db = getServiceClient();

  const { data: affiliates } = await db
    .from("affiliate")
    .select("id, name, email, username, balance_kobo, total_earned_kobo, created_at")
    .order("created_at", { ascending: false });

  if (!affiliates?.length) return NextResponse.json([]);

  const affiliateIds = affiliates.map((a: { id: string }) => a.id);

  const [{ data: payouts }, { data: commissions }] = await Promise.all([
    db.from("affiliate_payout")
      .select("id, affiliate_id, amount_kobo, status, bank_name, account_number, account_name, note, created_at")
      .in("affiliate_id", affiliateIds)
      .order("created_at", { ascending: false }),
    db.from("affiliate_commission")
      .select("affiliate_id, amount_kobo, status")
      .in("affiliate_id", affiliateIds),
  ]);

  const result = affiliates.map((a: { id: string; name: string; email: string; username: string; balance_kobo: number; total_earned_kobo: number; created_at: string }) => {
    const myPayouts = (payouts ?? []).filter((p: { affiliate_id: string }) => p.affiliate_id === a.id);
    const myCommissions = (commissions ?? []).filter((c: { affiliate_id: string }) => c.affiliate_id === a.id);
    const pending_kobo = myCommissions.filter((c: { status: string }) => c.status === "pending").reduce((s: number, c: { amount_kobo: number }) => s + c.amount_kobo, 0);
    const paid_kobo = myCommissions.filter((c: { status: string }) => c.status === "paid").reduce((s: number, c: { amount_kobo: number }) => s + c.amount_kobo, 0);
    return { ...a, payouts: myPayouts, pending_kobo, paid_kobo };
  });

  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  const { id, status, note } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

  const db = getServiceClient();

  const { data: payout } = await db
    .from("affiliate_payout")
    .select("affiliate_id, amount_kobo, status")
    .eq("id", id)
    .single();

  if (!payout) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.from("affiliate_payout").update({ status, note: note ?? null }).eq("id", id);

  // If rejecting, restore balance
  if (status === "rejected" && payout.status === "pending") {
    const { data: affiliate } = await db.from("affiliate").select("balance_kobo").eq("id", payout.affiliate_id).single();
    if (affiliate) {
      await db.from("affiliate").update({ balance_kobo: affiliate.balance_kobo + payout.amount_kobo }).eq("id", payout.affiliate_id);
    }
  }

  // If paid, mark related commissions as paid
  if (status === "paid") {
    await db.from("affiliate_commission")
      .update({ status: "paid" })
      .eq("affiliate_id", payout.affiliate_id)
      .eq("status", "approved");
  }

  return NextResponse.json({ ok: true });
}
