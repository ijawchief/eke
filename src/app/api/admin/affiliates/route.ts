import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const db = getServiceClient();

  const { data: affiliates } = await db
    .from("affiliate")
    .select("id, name, email, username, balance_kobo, total_earned_kobo, status, status_note, created_at")
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

  const result = affiliates.map((a: { id: string; name: string; email: string; username: string; balance_kobo: number; total_earned_kobo: number; status: string; status_note: string | null; created_at: string }) => {
    const myPayouts = (payouts ?? []).filter((p: { affiliate_id: string }) => p.affiliate_id === a.id);
    const myCommissions = (commissions ?? []).filter((c: { affiliate_id: string }) => c.affiliate_id === a.id);
    const pending_kobo = myCommissions.filter((c: { status: string }) => c.status === "pending").reduce((s: number, c: { amount_kobo: number }) => s + c.amount_kobo, 0);
    const paid_kobo = myCommissions.filter((c: { status: string }) => c.status === "paid").reduce((s: number, c: { amount_kobo: number }) => s + c.amount_kobo, 0);
    return { ...a, payouts: myPayouts, pending_kobo, paid_kobo };
  });

  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getServiceClient();
  await db.from("affiliate").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  // Ban / restrict / unban
  if (body.type === "status") {
    const { id, status, status_note } = body;
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
    const db = getServiceClient();
    const { error } = await db.from("affiliate").update({ status, status_note: status_note ?? null }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  // Affiliate account edit
  if (body.type === "affiliate") {
    const { id, name, email, username, password } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const db = getServiceClient();
    const updates: Record<string, unknown> = {};
    if (name)     updates.name     = name;
    if (email)    updates.email    = email.toLowerCase().trim();
    if (username) updates.username = username.toLowerCase();
    if (password) {
      const crypto = await import("crypto");
      updates.password_hash = crypto.createHash("sha256").update(password).digest("hex");
    }
    const { error } = await db.from("affiliate").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const { id, status, note } = body;
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
