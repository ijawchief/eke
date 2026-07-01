import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { product_id, session_id } = await req.json();
    if (!product_id) return NextResponse.json({ ok: false });
    const country = req.headers.get("x-vercel-ip-country") ?? null;
    const city = req.headers.get("x-vercel-ip-city") ?? null;
    const db = getServiceClient();
    await db.from("page_view").insert({ product_id, session_id: session_id ?? null, country, city });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
