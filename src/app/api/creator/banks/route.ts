import { NextResponse } from "next/server";

let cache: { data: unknown; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < 1000 * 60 * 60) {
    return NextResponse.json(cache.data);
  }
  const res = await fetch("https://api.paystack.co/bank?country=nigeria&perPage=100", {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    next: { revalidate: 3600 },
  });
  const json = await res.json();
  cache = { data: json.data, ts: Date.now() };
  return NextResponse.json(json.data);
}
