import { NextRequest, NextResponse } from "next/server";

const windowMs = 60_000;
const maxRequests = 5;
const counts = new Map<string, { count: number; resetAt: number }>();

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Creator portal auth guard
  if (pathname.startsWith("/creator") && !pathname.startsWith("/creator/login")) {
    const creatorId = req.cookies.get("creator_id")?.value;
    if (!creatorId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Rate limiter for checkout
  if (pathname === "/api/checkout/init" && req.method === "POST") {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const now = Date.now();
    const entry = counts.get(ip);

    if (!entry || now > entry.resetAt) {
      counts.set(ip, { count: 1, resetAt: now + windowMs });
    } else if (entry.count >= maxRequests) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } else {
      entry.count++;
    }
  }

  const res = NextResponse.next();
  if (pathname.startsWith("/creator")) {
    res.headers.set("x-middleware-cache", "no-cache");
    res.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, max-age=0, must-revalidate"
    );
  }
  return res;
}

export const config = {
  matcher: ["/creator/:path*", "/api/checkout/init"],
};
