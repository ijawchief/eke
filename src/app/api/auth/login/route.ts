import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

function signToken(payload: object): string {
  const data = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", process.env.ADMIN_SECRET!)
    .update(data)
    .digest("hex");
  return Buffer.from(data).toString("base64url") + "." + signature;
}

function makeLoginResponse(
  role: string,
  cookieName: string,
  cookieValue: string,
  redirect: string
) {
  const token = signToken({
    role,
    cookieName,
    cookieValue,
    redirect,
    exp: Date.now() + 60_000,
  });

  const res = NextResponse.json(
    { role, redirect: `/api/auth/callback?token=${token}` },
    {
      headers: {
        "Cache-Control": "private, no-store, no-cache",
      },
    }
  );

  // Also set cookies directly on the JSON response (belt)
  // The callback route is the suspenders if the browser ignores these
  res.cookies.set(cookieName, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
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
    return makeLoginResponse(
      "admin",
      "admin_token",
      process.env.ADMIN_SECRET!,
      "/admin"
    );
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
    return makeLoginResponse(
      "admin",
      "admin_token",
      process.env.ADMIN_SECRET!,
      "/admin"
    );
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
    return makeLoginResponse(
      "creator",
      "creator_id",
      creator.id,
      "/creator/dashboard"
    );
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

    return makeLoginResponse(
      "affiliate",
      "affiliate_id",
      affiliate.id,
      "/affiliate/dashboard"
    );
  }

  return NextResponse.json(
    { error: "Invalid username or password" },
    { status: 401 }
  );
}
