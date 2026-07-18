import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getResend } from "@/lib/email";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const creatorId = cookie.match(/(?:^|;\s*)creator_id=([^;]+)/)?.[1];
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getServiceClient();
  const { data: creator } = await db
    .from("creator")
    .select("id, email, name")
    .eq("id", creatorId)
    .single();

  if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

  const otp = generateOtp();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  await db.from("creator").update({
    email_otp: otp,
    email_otp_expires_at: expires,
  }).eq("id", creatorId);

  const resend = getResend();
  if (resend) {
    await resend.emails.send({
      from: "Veelage <noreply@eke.store>",
      to: creator.email,
      subject: "Your Veelage verification code",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#111;">Verify your email</h2>
          <p>Hi ${creator.name ?? "there"},</p>
          <p>Your verification code is:</p>
          <div style="font-size:40px;font-weight:800;letter-spacing:8px;color:#ea580c;margin:24px 0;">${otp}</div>
          <p style="color:#888;font-size:13px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });
  }

  return NextResponse.json({ ok: true, email: creator.email });
}
