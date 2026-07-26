import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

function clearAuthCookies(res: NextResponse) {
  res.cookies.delete("admin_token");
  res.cookies.delete("creator_id");
  res.cookies.delete("affiliate_id");
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password required" },
      { status: 400 }
    );
  }

  const db = getServiceClient();
  const normalized = username.toLowerCase().trim();
  const hash = crypto.createHash("sha256").update(password).digest("hex");

  // ==========================
  // MASTER ADMIN
  // ==========================
  if (
    normalized === process.env.ADMIN_USERNAME?.toLowerCase() &&
    password === process.env.ADMIN_SECRET
  ) {
    const res = NextResponse.json({
      role: "admin",
      redirect: "/admin",
    });

    clearAuthCookies(res);

    res.cookies.set("admin_token", process.env.ADMIN_SECRET!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  }

  // ==========================
  // DB ADMIN
  // ==========================
  const { data: dbAdmin } = await db
    .from("creator")
    .select("id")
    .or(`email.eq.${normalized},username.eq.${normalized}`)
    .eq("password_hash", hash)
    .eq("is_admin", true)
    .maybeSingle();

  if (dbAdmin) {
    const res = NextResponse.json({
      role: "admin",
      redirect: "/admin",
    });

    clearAuthCookies(res);

    res.cookies.set("admin_token", process.env.ADMIN_SECRET!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  }

  // ==========================
  // CREATOR
  // ==========================
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

  if (creator && creator.password_hash === hash) {
    const res = NextResponse.json({
      role: "creator",
      redirect: "/creator/dashboard",
    });

    clearAuthCookies(res);

    res.cookies.set("creator_id", creator.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  }

  // ==========================
  // AFFILIATE
  // ==========================
  const { data: affiliate } = await db
    .from("affiliate")
    .select("id,password_hash,status,status_note")
    .or(`email.eq.${normalized},username.eq.${normalized}`)
    .maybeSingle();

  if (affiliate && affiliate.password_hash === hash) {
    if (affiliate.status === "banned") {
      return NextResponse.json(
        {
          error:
            "Your account has been banned." +
            (affiliate.status_note
              ? ` Reason: ${affiliate.status_note}`
              : ""),
        },
        { status: 403 }
      );
    }

    if (affiliate.status === "restricted") {
      return NextResponse.json(
        {
          error:
            "Your account has been restricted." +
            (affiliate.status_note
              ? ` Reason: ${affiliate.status_note}`
              : ""),
        },
        { status: 403 }
      );
    }

    const res = NextResponse.json({
      role: "affiliate",
      redirect: "/affiliate/dashboard",
    });

    clearAuthCookies(res);

    res.cookies.set("affiliate_id", affiliate.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  }

  return NextResponse.json(
    { error: "Invalid username or password" },
    { status: 401 }
  );
}