import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // Try req.cookies first (works in most cases), fall back to raw header parse
  const fromCookies = req.cookies.get("creator_id")?.value;
  const cookieHeader = req.headers.get("cookie") ?? "";
  const fromHeader = cookieHeader.match(/(?:^|;\s*)creator_id=([^;]+)/)?.[1];
  const raw = fromCookies ?? fromHeader;
  const creatorId = raw ? decodeURIComponent(raw) : null;
  if (!creatorId) return NextResponse.json({ error: "Unauthorized — please log out and log back in" }, { status: 401 });

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
