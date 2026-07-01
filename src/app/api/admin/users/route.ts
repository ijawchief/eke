import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

function requireAdmin(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const token = cookie.match(/admin_token=([^;]+)/)?.[1];
  if (token !== process.env.ADMIN_SECRET) return false;
  return true;
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, email, username, password } = await req.json();
  if (!name || !email || !username || !password) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  const password_hash = crypto.createHash("sha256").update(password).digest("hex");
  const db = getServiceClient();
  const { error } = await db.from("creator").insert({ name, email, username, password_hash });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, name, email, username, password } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getServiceClient();
  const updates: Record<string, string> = { name, email, username };
  if (password) updates.password_hash = crypto.createHash("sha256").update(password).digest("hex");
  const { error } = await db.from("creator").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getServiceClient();
  const { error } = await db.from("creator").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
