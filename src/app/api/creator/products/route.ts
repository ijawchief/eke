import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

async function getCreatorId(req: NextRequest) {
  const raw = req.cookies.get("creator_id")?.value;
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
  const { name, slug, price_kobo, description, thumbnail_url, active = false } = body;

  if (!name || !slug || !price_kobo) {
    return NextResponse.json({ error: "Name, slug and price are required" }, { status: 400 });
  }

  const db = getServiceClient();

  // Check slug uniqueness
  const { data: existing } = await db.from("product").select("id").eq("slug", slug).single();
  if (existing) return NextResponse.json({ error: "This URL slug is already taken" }, { status: 400 });

  const pageBlocks = description
    ? [{ type: "text", data: { text: description } }]
    : [];

  const { data, error } = await db
    .from("product")
    .insert({ name, slug, price_kobo, active, creator_id: creatorId, page_blocks: pageBlocks, thumbnail_url })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}
