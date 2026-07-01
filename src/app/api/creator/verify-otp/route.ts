import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const creatorId = cookie.match(/creator_id=([^;]+)/)?.[1];
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { otp } = await req.json();
  if (!otp) return NextResponse.json({ error: "OTP required" }, { status: 400 });

  const db = getServiceClient();
  const { data: creator } = await db
    .from("creator")
    .select("email_otp, email_otp_expires_at")
    .eq("id", creatorId)
    .single();

  if (!creator?.email_otp) {
    return NextResponse.json({ error: "No OTP found — request a new one" }, { status: 400 });
  }
  if (new Date(creator.email_otp_expires_at) < new Date()) {
    return NextResponse.json({ error: "Code expired — request a new one" }, { status: 400 });
  }
  if (creator.email_otp !== otp.trim()) {
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
  }

  await db.from("creator").update({
    email_verified: true,
    email_otp: null,
    email_otp_expires_at: null,
  }).eq("id", creatorId);

  return NextResponse.json({ ok: true });
}
