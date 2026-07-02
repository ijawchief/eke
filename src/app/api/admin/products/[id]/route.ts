import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin_token")?.value === process.env.ADMIN_SECRET;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, slug, price_kobo, compare_at_kobo, external_url, active, page_blocks,
    meta_pixel_id, meta_capi_token, tiktok_pixel_id, from_name, from_email, webhook_url } = body;

  const db = getServiceClient();
  const { error } = await db
    .from("product")
    .update({ name, slug, price_kobo, compare_at_kobo, external_url, active, page_blocks,
      meta_pixel_id, meta_capi_token, tiktok_pixel_id, from_name, from_email, webhook_url })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getServiceClient();

  // Delete dependent rows first to avoid FK constraint errors
  await db.from("order").delete().eq("product_id", id);
  await db.from("page_view").delete().eq("product_id", id);

  const { error } = await db.from("product").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
