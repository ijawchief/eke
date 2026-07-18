import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

  const db = getServiceClient();
  const { data: affiliate, error: dbError } = await db
    .from("affiliate")
    .select("id, email, password_hash, status, status_note")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (dbError) {
    // Fallback if status columns don't exist yet (migration not run)
    const { data: aff2 } = await db
      .from("affiliate")
      .select("id, email, password_hash")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();
    if (!aff2) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const hash2 = crypto.createHash("sha256").update(password).digest("hex");
    if (hash2 !== aff2.password_hash) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const res2 = NextResponse.json({ ok: true });
    res2.cookies.set("affiliate_id", aff2.id, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" });
    return res2;
  }

  if (!affiliate) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const hash = crypto.createHash("sha256").update(password).digest("hex");
  if (hash !== affiliate.password_hash) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  if (affiliate.status === "banned") {
    return NextResponse.json({ error: "Your account has been banned." + (affiliate.status_note ? ` Reason: ${affiliate.status_note}` : "") }, { status: 403 });
  }
  if (affiliate.status === "restricted") {
    return NextResponse.json({ error: "Your account has been restricted." + (affiliate.status_note ? ` Reason: ${affiliate.status_note}` : "") }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("affiliate_id", affiliate.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
