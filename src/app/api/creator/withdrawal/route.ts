import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const creatorId = cookie.match(/(?:^|;\s*)creator_id=([^;]+)/)?.[1];
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount_kobo, bank_name, bank_code, account_number, account_name, phone, bvn } =
    await req.json();

  if (!amount_kobo || !bank_name || !account_number || !account_name || !phone) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const db = getServiceClient();
  const { error } = await db.from("withdrawal_request").insert({
    creator_id: creatorId,
    amount_kobo,
    bank_name,
    bank_code: bank_code ?? null,
    account_number,
    account_name,
    phone,
    bvn: bvn ?? null,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
