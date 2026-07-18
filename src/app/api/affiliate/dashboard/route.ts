import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getAffiliateId } from "@/lib/affiliateAuth";

export async function GET(req: NextRequest) {
  const affiliateId = getAffiliateId(req);
  if (!affiliateId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getServiceClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: total_clicks },
    { count: total_conversions },
    { data: pendingData },
    { data: paidData },
    { data: recent_commissions },
    { data: clicksByProduct },
  ] = await Promise.all([
    db.from("affiliate_click").select("id", { count: "exact", head: true })
      .eq("affiliate_id", affiliateId).gte("created_at", since),
    db.from("affiliate_commission").select("id", { count: "exact", head: true })
      .eq("affiliate_id", affiliateId),
    db.from("affiliate_commission").select("amount_kobo")
      .eq("affiliate_id", affiliateId).eq("status", "pending"),
    db.from("affiliate_commission").select("amount_kobo")
      .eq("affiliate_id", affiliateId).eq("status", "paid"),
    db.from("affiliate_commission")
      .select("id, amount_kobo, status, created_at, product:product_id(name), order:order_id(id)")
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false })
      .limit(10),
    db.from("affiliate_click")
      .select("product_id")
      .eq("affiliate_id", affiliateId),
  ]);

  const pending_kobo = (pendingData ?? []).reduce((s: number, r: { amount_kobo: number }) => s + r.amount_kobo, 0);
  const paid_kobo = (paidData ?? []).reduce((s: number, r: { amount_kobo: number }) => s + r.amount_kobo, 0);

  // Build top products from clicks
  const clickCount: Record<string, number> = {};
  for (const c of clicksByProduct ?? []) {
    clickCount[c.product_id] = (clickCount[c.product_id] ?? 0) + 1;
  }
  const topProductIds = Object.entries(clickCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let top_products: { product_id: string; name: string; click_count: number; conversion_count: number }[] = [];
  if (topProductIds.length) {
    const { data: prods } = await db.from("product").select("id, name").in("id", topProductIds);
    const { data: convData } = await db.from("affiliate_commission")
      .select("product_id")
      .eq("affiliate_id", affiliateId)
      .in("product_id", topProductIds);

    const convCount: Record<string, number> = {};
    for (const c of convData ?? []) {
      convCount[c.product_id] = (convCount[c.product_id] ?? 0) + 1;
    }

    top_products = topProductIds.map((id) => {
      const prod = (prods ?? []).find((p: { id: string; name: string }) => p.id === id);
      return { product_id: id, name: prod?.name ?? "Unknown", click_count: clickCount[id] ?? 0, conversion_count: convCount[id] ?? 0 };
    });
  }

  return NextResponse.json({
    total_clicks: total_clicks ?? 0,
    total_conversions: total_conversions ?? 0,
    pending_kobo,
    paid_kobo,
    recent_commissions: recent_commissions ?? [],
    top_products,
  });
}
