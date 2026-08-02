import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifyToken(token: string): {
  cookieName: string;
  cookieValue: string;
  redirect: string;
} | null {
  const dot = token.indexOf(".");
  if (dot === -1) return null;

  const payloadB64 = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const data = Buffer.from(payloadB64, "base64url").toString();
  const expected = crypto
    .createHmac("sha256", process.env.ADMIN_SECRET!)
    .update(data)
    .digest("hex");

  if (signature !== expected) return null;

  const parsed = JSON.parse(data);
  if (Date.now() > parsed.exp) return null;

  return {
    cookieName: parsed.cookieName,
    cookieValue: parsed.cookieValue,
    redirect: parsed.redirect,
  };
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const session = verifyToken(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const res = NextResponse.redirect(new URL(session.redirect, req.url));

  res.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, max-age=0, must-revalidate"
  );

  // Clear other auth cookies
  for (const name of ["admin_token", "creator_id", "affiliate_id"]) {
    if (name !== session.cookieName) {
      res.cookies.set(name, "", {
        expires: new Date(0),
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  }

  // Set the auth cookie via redirect response — most reliable method
  res.cookies.set(session.cookieName, session.cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
