import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(new URL("/login", process.env.APP_URL ?? "http://localhost:3000"));
  res.cookies.delete("admin_token");
  return res;
}
