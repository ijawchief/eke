import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

function requireAdmin(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const token = cookie.match(/admin_token=([^;]+)/)?.[1];
  return token === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, slug, price_kobo, compare_at_kobo, external_url, active, page_blocks,
    meta_pixel_id, meta_capi_token, tiktok_pixel_id, from_name, from_email, webhook_url } = body;

  if (!name || !slug || !price_kobo) {
    return NextResponse.json({ error: "name, slug, price_kobo required" }, { status: 400 });
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from("product")
    .insert({ name, slug, price_kobo, compare_at_kobo, external_url, active, page_blocks,
      meta_pixel_id, meta_capi_token, tiktok_pixel_id, from_name, from_email, webhook_url })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}
