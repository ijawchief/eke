import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getAffiliateId } from "@/lib/affiliateAuth";

export async function POST(req: NextRequest) {
  const affiliateId = getAffiliateId(req);
  if (!affiliateId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount_kobo, bank_name, bank_code, account_number, account_name } = await req.json();

  if (!amount_kobo || amount_kobo <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const db = getServiceClient();

  const { data: affiliate } = await db
    .from("affiliate")
    .select("balance_kobo")
    .eq("id", affiliateId)
    .single();

  if (!affiliate) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (amount_kobo > affiliate.balance_kobo) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  await db.from("affiliate_payout").insert({
    affiliate_id: affiliateId,
    amount_kobo,
    bank_name,
    bank_code,
    account_number,
    account_name,
    status: "pending",
  });

  await db.from("affiliate").update({ balance_kobo: affiliate.balance_kobo - amount_kobo }).eq("id", affiliateId);

  return NextResponse.json({ ok: true });
}
