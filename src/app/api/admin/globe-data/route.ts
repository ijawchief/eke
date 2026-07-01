import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

function periodStart(p: string, from?: string): string {
  if (p === "custom" && from) return new Date(from).toISOString();
  const now = new Date();
  if (p === "today") { now.setHours(0, 0, 0, 0); return now.toISOString(); }
  if (p === "week") { now.setDate(now.getDate() - 7); return now.toISOString(); }
  if (p === "month") { now.setMonth(now.getMonth() - 1); return now.toISOString(); }
  if (p === "year") { now.setFullYear(now.getFullYear() - 1); return now.toISOString(); }
  return "1970-01-01T00:00:00Z"; // lifetime
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "week";
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const db = getServiceClient();
  let query = db.from("order").select("country, city").eq("status", "paid");
  query = query.gte("paid_at", periodStart(period, from));
  if (period === "custom" && to) query = query.lte("paid_at", new Date(to).toISOString());

  const { data } = await query;

  const countryMap: Record<string, { count: number; cities: Record<string, number> }> = {};
  (data ?? []).forEach((o: { country: string | null; city: string | null }) => {
    const c = o.country ?? "Unknown";
    if (!countryMap[c]) countryMap[c] = { count: 0, cities: {} };
    countryMap[c].count++;
    if (o.city) countryMap[c].cities[o.city] = (countryMap[c].cities[o.city] ?? 0) + 1;
  });

  return NextResponse.json(countryMap);
}
