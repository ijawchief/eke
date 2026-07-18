import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

async function getCreatorId(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const raw = cookie.match(/(?:^|;\s*)creator_id=([^;]+)/)?.[1];
  return raw ? decodeURIComponent(raw) : null;
}

export async function PATCH(req: NextRequest) {
  const creatorId = await getCreatorId(req);
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, phone, bank_name, bank_code, account_number, account_name, email } = body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (bank_name !== undefined) updates.bank_name = bank_name;
  if (bank_code !== undefined) updates.bank_code = bank_code;
  if (account_number !== undefined) updates.account_number = account_number;
  if (account_name !== undefined) updates.account_name = account_name;
  if (email !== undefined) {
    updates.email = email;
    updates.email_verified = false; // force re-verification on email change
  }

  const db = getServiceClient();
  const { error } = await db.from("creator").update(updates).eq("id", creatorId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
