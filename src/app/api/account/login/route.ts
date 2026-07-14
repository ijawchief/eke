import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

  const db = getServiceClient();
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  const { data: customer } = await db
    .from("customer")
    .select("id, name, email")
    .eq("email", email.toLowerCase().trim())
    .eq("password_hash", hash)
    .maybeSingle();

  if (!customer) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const res = NextResponse.json({ ok: true, redirect: "/account" });
  res.cookies.set("customer_id", customer.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
