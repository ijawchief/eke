import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(new URL("/creator/login", process.env.APP_URL ?? "http://localhost:3000"));
  res.cookies.delete("creator_id");
  return res;
}
