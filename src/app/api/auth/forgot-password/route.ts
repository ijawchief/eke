import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getResend } from "@/lib/email";
import crypto from "crypto";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://veelage.co";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const db = getServiceClient();
  const { data: creator } = await db
    .from("creator")
    .select("id, name, email")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  // Always return success to avoid email enumeration
  if (!creator) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await db.from("creator").update({ reset_token: token, reset_token_expires: expires }).eq("id", creator.id);

  const resetLink = `${BASE_URL}/reset-password?token=${token}`;

  await getResend().emails.send({
    from: "Veelage <no-reply@eke.ng>",
    to: creator.email,
    subject: "Reset your Veelage password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#111">Reset your password</h2>
        <p>Hi ${creator.name ?? "there"},</p>
        <p>We received a request to reset your Veelage creator account password. Click the button below to choose a new password:</p>
        <p style="margin:28px 0">
          <a href="${resetLink}" style="background:#ea580c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
            Reset Password
          </a>
        </p>
        <p style="color:#888;font-size:13px">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">Veelage · <a href="${BASE_URL}" style="color:#aaa">${BASE_URL}</a></p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
