import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getAffiliateId } from "@/lib/affiliateAuth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const affiliateId = getAffiliateId(req);
  if (!affiliateId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { current_password, new_password } = await req.json();
  if (!current_password || !new_password) {
    return NextResponse.json({ error: "Both current and new password are required" }, { status: 400 });
  }

  const db = getServiceClient();
  const { data: affiliate } = await db
    .from("affiliate")
    .select("password_hash")
    .eq("id", affiliateId)
    .single();

  if (!affiliate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currentHash = crypto.createHash("sha256").update(current_password).digest("hex");
  if (currentHash !== affiliate.password_hash) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const newHash = crypto.createHash("sha256").update(new_password).digest("hex");
  await db.from("affiliate").update({ password_hash: newHash }).eq("id", affiliateId);

  return NextResponse.json({ ok: true });
}
