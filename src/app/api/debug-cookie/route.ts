// app/api/debug-cookie/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    cookies: (await cookies()).getAll(),
  });
}