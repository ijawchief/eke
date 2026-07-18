import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

async function requireAdmin(req: NextRequest) {
  // env-based master admin
  const token = req.cookies.get("admin_token")?.value;
  if (token === process.env.ADMIN_SECRET) return true;
  // DB admin (creator with is_admin=true)
  const creatorId = req.cookies.get("creator_id")?.value;
  if (creatorId) {
    const db = getServiceClient();
    const { data } = await db.from("creator").select("is_admin").eq("id", creatorId).single();
    if (data?.is_admin) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, email, username, password, is_admin } = await req.json();
  if (!name || !email || !username || !password) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  const password_hash = crypto.createHash("sha256").update(password).digest("hex");
  const db = getServiceClient();
  const { error } = await db.from("creator").insert({
    name, email, username, password_hash, is_admin: !!is_admin, email_verified: false, onboarding_done: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, name, email, username, password, is_admin, email_verified } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getServiceClient();
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (username !== undefined) updates.username = username;
  if (password) updates.password_hash = crypto.createHash("sha256").update(password).digest("hex");
  if (is_admin !== undefined) updates.is_admin = is_admin;
  if (email_verified !== undefined) updates.email_verified = email_verified;
  const { error } = await db.from("creator").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getServiceClient();
  const { error } = await db.from("creator").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
