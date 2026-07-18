import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const creatorId = cookie.match(/(?:^|;\s*)creator_id=([^;]+)/)?.[1];
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phone, bvn, bank_name, bank_code, account_number, account_name } = await req.json();

  if (!phone || !bank_name || !bank_code || !account_number || !account_name) {
    return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
  }

  const db = getServiceClient();

  // Confirm email is verified
  const { data: creator } = await db
    .from("creator")
    .select("email_verified")
    .eq("id", creatorId)
    .single();

  if (!creator?.email_verified) {
    return NextResponse.json({ error: "Email not verified" }, { status: 403 });
  }

  const { error } = await db.from("creator").update({
    phone,
    bvn: bvn || null,
    bank_name,
    bank_code,
    account_number,
    account_name,
    onboarding_done: true,
  }).eq("id", creatorId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
