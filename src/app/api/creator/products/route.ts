import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

async function getCreatorId(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const raw = cookie.match(/creator_id=([^;]+)/)?.[1];
  return raw ? decodeURIComponent(raw) : null;
}

export async function GET(req: NextRequest) {
  const creatorId = await getCreatorId(req);
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getServiceClient();
  const { data, error } = await db
    .from("product")
    .select("id, name, slug, price_kobo, active, thumbnail_url, created_at")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const creatorId = await getCreatorId(req);
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name, slug, price_kobo, compare_at_kobo, external_url, active = false,
    page_blocks, meta_pixel_id, meta_capi_token, tiktok_pixel_id,
    from_name, from_email, webhook_url,
  } = body;

  if (!name || !slug || !price_kobo) {
    return NextResponse.json({ error: "Name, slug and price are required" }, { status: 400 });
  }

  const db = getServiceClient();

  const { data: existing } = await db.from("product").select("id").eq("slug", slug).single();
  if (existing) return NextResponse.json({ error: "This URL slug is already taken" }, { status: 400 });

  const thumbnail_url = (() => {
    const img = (page_blocks ?? []).find((b: { type: string }) => b.type === "image");
    return img ? (img.data?.url as string) ?? null : null;
  })();

  const { data, error } = await db
    .from("product")
    .insert({
      name, slug, price_kobo,
      compare_at_kobo: compare_at_kobo ?? null,
      external_url: external_url ?? null,
      active, creator_id: creatorId,
      page_blocks: page_blocks ?? [],
      thumbnail_url,
      meta_pixel_id: meta_pixel_id ?? null,
      meta_capi_token: meta_capi_token ?? null,
      tiktok_pixel_id: tiktok_pixel_id ?? null,
      from_name: from_name ?? null,
      from_email: from_email ?? null,
      webhook_url: webhook_url ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}
