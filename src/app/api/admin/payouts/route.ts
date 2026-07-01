import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

function requireAdmin(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  return cookie.match(/admin_token=([^;]+)/)?.[1] === process.env.ADMIN_SECRET;
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, note } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
  const db = getServiceClient();
  const updates: Record<string, string | null> = { status };
  if (note) updates.note = note;
  const { error } = await db.from("withdrawal_request").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
