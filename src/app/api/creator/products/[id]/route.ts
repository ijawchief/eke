import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

async function getCreatorId(req: NextRequest) {
  const raw = req.cookies.get("creator_id")?.value;
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
  const { name, slug, price_kobo, description, thumbnail_url, active } = body;

  const db = getServiceClient();

  // Build page_blocks only if description provided
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (price_kobo !== undefined) updates.price_kobo = price_kobo;
  if (active !== undefined) updates.active = active;
  if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;
  if (description !== undefined) {
    updates.page_blocks = [{ type: "text", data: { text: description } }];
  }

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
