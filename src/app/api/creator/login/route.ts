import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

  const db = getServiceClient();
  const { data: creator } = await db
    .from("creator")
    .select("id, email, password_hash")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (!creator) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const hash = crypto.createHash("sha256").update(password).digest("hex");
  if (hash !== creator.password_hash) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("creator_id", creator.id, {
    httpOnly: true,
    secure:process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
