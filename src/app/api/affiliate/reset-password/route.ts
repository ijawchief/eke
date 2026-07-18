import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Token and password required" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const db = getServiceClient();
  const { data: affiliate } = await db
    .from("affiliate")
    .select("id, reset_token_expires")
    .eq("reset_token", token)
    .maybeSingle();

  if (!affiliate) return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  if (new Date(affiliate.reset_token_expires) < new Date()) {
    return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
  }

  const password_hash = crypto.createHash("sha256").update(password).digest("hex");
  await db.from("affiliate").update({ password_hash, reset_token: null, reset_token_expires: null }).eq("id", affiliate.id);

  return NextResponse.json({ ok: true });
}
