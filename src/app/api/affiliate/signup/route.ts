import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { name, email, username, password } = await req.json();

  if (!name || !email || !username || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json({ error: "Username must be 3-20 characters, alphanumeric and underscores only" }, { status: 400 });
  }

  const db = getServiceClient();

  const { data: existing } = await db
    .from("affiliate")
    .select("id")
    .or(`email.eq.${email.toLowerCase().trim()},username.eq.${username.toLowerCase()}`)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Email or username already taken" }, { status: 409 });
  }

  const password_hash = crypto.createHash("sha256").update(password).digest("hex");

  const { data: affiliate, error } = await db
    .from("affiliate")
    .insert({
      name,
      email: email.toLowerCase().trim(),
      username: username.toLowerCase(),
      password_hash,
    })
    .select("id")
    .single();

  if (error || !affiliate) {
    return NextResponse.json({ error: error?.message ?? "Failed to create account" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("affiliate_id", affiliate.id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
