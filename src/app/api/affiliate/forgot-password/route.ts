import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getResend } from "@/lib/email";
import crypto from "crypto";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://veelage.co";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const db = getServiceClient();
  const { data: affiliate } = await db
    .from("affiliate")
    .select("id, name, email")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (!affiliate) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await db.from("affiliate").update({ reset_token: token, reset_token_expires: expires }).eq("id", affiliate.id);

  const resetLink = `${BASE_URL}/affiliate/reset-password?token=${token}`;

  await getResend().emails.send({
    from: "Veelage <no-reply@eke.ng>",
    to: affiliate.email,
    subject: "Reset your Veelage affiliate password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#111">Reset your password</h2>
        <p>Hi ${affiliate.name ?? "there"},</p>
        <p>We received a request to reset your Veelage affiliate account password.</p>
        <p style="margin:28px 0">
          <a href="${resetLink}" style="background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
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
