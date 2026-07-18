import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { product_id, affiliate_username } = await req.json();
  if (!product_id || !affiliate_username) {
    return NextResponse.json({ error: "product_id and affiliate_username required" }, { status: 400 });
  }

  const db = getServiceClient();
  const { data: affiliate } = await db
    .from("affiliate")
    .select("id")
    .eq("username", affiliate_username.toLowerCase())
    .single();

  if (!affiliate) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });

  await db.from("affiliate_click").insert({ affiliate_id: affiliate.id, product_id });

  return NextResponse.json({ ok: true });
}
