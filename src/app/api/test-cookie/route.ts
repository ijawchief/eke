// app/api/test-cookie/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("test_cookie", "works", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60,
  });

  return res;
}