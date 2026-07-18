import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getAffiliateId } from "@/lib/affiliateAuth";

export async function GET(req: NextRequest) {
  const affiliateId = getAffiliateId(req);
  if (!affiliateId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getServiceClient();

  const { data: products } = await db
    .from("product")
    .select("id, name, slug, price_kobo, thumbnail_url, creator:creator_id(name)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (!products?.length) return NextResponse.json([]);

  const productIds = products.map((p: { id: string }) => p.id);

  const [{ data: clicks }, { data: conversions }] = await Promise.all([
    db.from("affiliate_click").select("product_id").eq("affiliate_id", affiliateId).in("product_id", productIds),
    db.from("affiliate_commission").select("product_id").eq("affiliate_id", affiliateId).in("product_id", productIds),
  ]);

  const clickMap: Record<string, number> = {};
  for (const c of clicks ?? []) clickMap[c.product_id] = (clickMap[c.product_id] ?? 0) + 1;
  const convMap: Record<string, number> = {};
  for (const c of conversions ?? []) convMap[c.product_id] = (convMap[c.product_id] ?? 0) + 1;

  const result = products.map((p: { id: string; name: string; slug: string; price_kobo: number; thumbnail_url: string | null; creator: { name: string } | { name: string }[] | null }) => ({
    ...p,
    creator_name: Array.isArray(p.creator) ? (p.creator[0]?.name ?? "") : (p.creator?.name ?? ""),
    click_count: clickMap[p.id] ?? 0,
    conversion_count: convMap[p.id] ?? 0,
  }));

  return NextResponse.json(result);
}
