import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

function setCookie(res: NextResponse, id: string) {
  res.cookies.set("affiliate_id", id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Email/username and password required" }, { status: 400 });

  const db = getServiceClient();
  const identifier = email.toLowerCase().trim();

  // Look up by email OR username
  const { data: affiliate, error: dbError } = await db
    .from("affiliate")
    .select("id, password_hash, status, status_note")
    .or(`email.eq.${identifier},username.eq.${identifier}`)
    .maybeSingle();

  // Fallback if status columns not yet added via migration
  if (dbError) {
    const { data: aff2 } = await db
      .from("affiliate")
      .select("id, password_hash")
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .maybeSingle();
    if (!aff2) return NextResponse.json({ error: "Invalid email/username or password" }, { status: 401 });
    const h = crypto.createHash("sha256").update(password).digest("hex");
    if (h !== aff2.password_hash) return NextResponse.json({ error: "Invalid email/username or password" }, { status: 401 });
    return setCookie(NextResponse.json({ ok: true }), aff2.id);
  }

  if (!affiliate) return NextResponse.json({ error: "Invalid email/username or password" }, { status: 401 });

  const hash = crypto.createHash("sha256").update(password).digest("hex");
  if (hash !== affiliate.password_hash) return NextResponse.json({ error: "Invalid email/username or password" }, { status: 401 });

  if (affiliate.status === "banned") {
    return NextResponse.json({ error: "Your account has been banned." + (affiliate.status_note ? ` Reason: ${affiliate.status_note}` : "") }, { status: 403 });
  }
  if (affiliate.status === "restricted") {
    return NextResponse.json({ error: "Your account has been restricted." + (affiliate.status_note ? ` Reason: ${affiliate.status_note}` : "") }, { status: 403 });
  }

  return setCookie(NextResponse.json({ ok: true }), affiliate.id);
}
