import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  // Check env-based master admin first
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_SECRET
  ) {
    return setAdminCookie(NextResponse.json({ role: "admin", redirect: "/admin" }));
  }

  // Check DB admin accounts (creator with is_admin=true)
  const dbAdmin = await (async () => {
    const db = getServiceClient();
    const hash = crypto.createHash("sha256").update(password).digest("hex");
    const normalized = username.toLowerCase().trim();
    const { data } = await db
      .from("creator")
      .select("id")
      .or(`email.eq.${normalized},username.eq.${normalized}`)
      .eq("password_hash", hash)
      .eq("is_admin", true)
      .maybeSingle();
    return data;
  })();
  if (dbAdmin) return setAdminCookie(NextResponse.json({ role: "admin", redirect: "/admin" }));

  // Check creator — match by username or email
  const db = getServiceClient();
  const normalized = username.toLowerCase().trim();
  let { data: creator } = await db
    .from("creator")
    .select("id, name, password_hash")
    .eq("username", normalized)
    .maybeSingle();

  if (!creator) {
    const { data } = await db
      .from("creator")
      .select("id, name, password_hash")
      .eq("email", normalized)
      .maybeSingle();
    creator = data;
  }

  if (creator && creator.password_hash) {
    const hash = crypto.createHash("sha256").update(password).digest("hex");
    if (hash === creator.password_hash) {
      const res = NextResponse.json({ role: "creator", redirect: "/creator/dashboard" });
      res.cookies.set("creator_id", creator.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return res;
    }
  }

  return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
}

function setAdminCookie(res: NextResponse) {
  res.cookies.set("admin_token", process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
