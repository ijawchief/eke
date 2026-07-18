import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

async function getCreatorId(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const raw = cookie.match(/(?:^|;\s*)creator_id=([^;]+)/)?.[1];
  return raw ? decodeURIComponent(raw) : null;
}

async function assertOwner(creatorId: string, productId: string) {
  const db = getServiceClient();
  const { data } = await db.from("product").select("id").eq("id", productId).eq("creator_id", creatorId).single();
  return !!data;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const creatorId = await getCreatorId(req);
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await assertOwner(creatorId, id))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const {
    name, slug, price_kobo, compare_at_kobo, external_url, active,
    page_blocks, meta_pixel_id, meta_capi_token, tiktok_pixel_id,
    from_name, from_email, webhook_url,
  } = body;

  const db = getServiceClient();

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (price_kobo !== undefined) updates.price_kobo = price_kobo;
  if (compare_at_kobo !== undefined) updates.compare_at_kobo = compare_at_kobo;
  if (external_url !== undefined) updates.external_url = external_url;
  if (active !== undefined) updates.active = active;
  if (page_blocks !== undefined) {
    updates.page_blocks = page_blocks;
    const img = page_blocks.find((b: { type: string }) => b.type === "image");
    updates.thumbnail_url = img ? (img.data?.url as string) ?? null : null;
  }
  if (meta_pixel_id !== undefined) updates.meta_pixel_id = meta_pixel_id;
  if (meta_capi_token !== undefined) updates.meta_capi_token = meta_capi_token;
  if (tiktok_pixel_id !== undefined) updates.tiktok_pixel_id = tiktok_pixel_id;
  if (from_name !== undefined) updates.from_name = from_name;
  if (from_email !== undefined) updates.from_email = from_email;
  if (webhook_url !== undefined) updates.webhook_url = webhook_url;

  const { error } = await db.from("product").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const creatorId = await getCreatorId(req);
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await assertOwner(creatorId, id))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const db = getServiceClient();
  await db.from("page_view").delete().eq("product_id", id);
  const { error } = await db.from("product").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
