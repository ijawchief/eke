import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(new URL("/creator/login", process.env.APP_URL ?? "http://localhost:3000"));
  res.cookies.set("creator_id", "", {
  path: "/",
  expires: new Date(0),
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});
  return res;
}
