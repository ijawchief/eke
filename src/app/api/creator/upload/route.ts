import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const raw = cookie.match(/creator_id=([^;]+)/)?.[1];
  const creatorId = raw ? decodeURIComponent(raw) : null;
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const db = getServiceClient();
  const { error } = await db.storage
    .from("eke-assets")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = db.storage.from("eke-assets").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
