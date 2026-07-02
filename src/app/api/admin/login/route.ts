import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // 1. Check env-based master admin (password-only, no email needed)
  if (!email && password === process.env.ADMIN_SECRET) {
    return setAdminCookie(NextResponse.json({ ok: true }));
  }

  // 2. Check DB admin accounts (email + password)
  if (email && password) {
    const db = getServiceClient();
    const hash = crypto.createHash("sha256").update(password).digest("hex");
    const { data } = await db
      .from("creator")
      .select("id")
      .eq("email", email)
      .eq("password_hash", hash)
      .eq("is_admin", true)
      .single();
    if (data) return setAdminCookie(NextResponse.json({ ok: true }));
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

function setAdminCookie(res: NextResponse) {
  res.cookies.set("admin_token", process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
