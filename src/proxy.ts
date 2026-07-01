import { NextRequest, NextResponse } from "next/server";

// Simple in-process rate limiter for /api/checkout/init
// In production, use Redis (Upstash) for distributed rate limiting
const windowMs = 60_000;
const maxRequests = 5;
const counts = new Map<string, { count: number; resetAt: number }>();

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/api/checkout/init" && req.method === "POST") {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/checkout/init"],
};
