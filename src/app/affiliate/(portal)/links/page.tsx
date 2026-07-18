import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { CopyButton } from "./CopyButton";
import { Flame, TrendingUp, Zap } from "lucide-react";

function fmt(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://veelage.co";

export default async function AffiliateMarketplacePage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/affiliate_id=([^;]+)/)?.[1];
  const affiliateId = raw ? decodeURIComponent(raw) : "";

  const db = getServiceClient();

  const now = new Date();
  const since7d  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000).toISOString();
  const since24h = new Date(now.getTime() -      24 * 60 * 60 * 1000).toISOString();

  const [
    { data: affiliate },
    { data: products },
    { data: platformConfig },
    { data: allClicks },
    { data: recentClicks },
    { data: weekCommissions },
    { data: myClicks },
    { data: myConversions },
  ] = await Promise.all([
    db.from("affiliate").select("username").eq("id", affiliateId).single(),
    db.from("product")
      .select("id, name, slug, price_kobo, thumbnail_url, affiliate_commission_rate, creator:creator_id(name)")
      .eq("active", true)
      .order("created_at", { ascending: false }),
    db.from("affiliate_config").select("commission_rate").eq("id", 1).single(),
    // All-time clicks per product (all affiliates)
    db.from("affiliate_click").select("product_id"),
    // Last 24h clicks (for "rising" tag)
    db.from("affiliate_click").select("product_id").gte("created_at", since24h),
    // Last 7d commissions (for gravity)
    db.from("affiliate_commission").select("product_id, affiliate_id").gte("created_at", since7d),
    // My clicks per product
    db.from("affiliate_click").select("product_id").eq("affiliate_id", affiliateId),
    // My conversions per product
    db.from("affiliate_commission").select("product_id").eq("affiliate_id", affiliateId),
  ]);

  const username = affiliate?.username ?? "";
  const defaultRate = (platformConfig as { commission_rate: number } | null)?.commission_rate ?? 10;

  // Build stat maps
  const allClickMap: Record<string, number> = {};
  for (const c of allClicks ?? []) allClickMap[c.product_id] = (allClickMap[c.product_id] ?? 0) + 1;

  const recentClickMap: Record<string, number> = {};
  for (const c of recentClicks ?? []) recentClickMap[c.product_id] = (recentClickMap[c.product_id] ?? 0) + 1;

  // Gravity = unique affiliates with commission in last 7d
  const gravityMap: Record<string, Set<string>> = {};
  for (const c of weekCommissions ?? []) {
    if (!gravityMap[c.product_id]) gravityMap[c.product_id] = new Set();
    gravityMap[c.product_id].add(c.affiliate_id);
  }

  const myClickMap: Record<string, number> = {};
  for (const c of myClicks ?? []) myClickMap[c.product_id] = (myClickMap[c.product_id] ?? 0) + 1;

  const myConvMap: Record<string, number> = {};
  for (const c of myConversions ?? []) myConvMap[c.product_id] = (myConvMap[c.product_id] ?? 0) + 1;

  // Compute max gravity for relative bar
  const maxGravity = Math.max(1, ...Object.values(gravityMap).map((s) => s.size));

  const enriched = (products ?? []).map((p: {
    id: string; name: string; slug: string; price_kobo: number;
    thumbnail_url: string | null; affiliate_commission_rate: number | null;
    creator: { name: string } | { name: string }[] | null;
  }) => {
    const rate = p.affiliate_commission_rate ?? defaultRate;
    const gravity = gravityMap[p.id]?.size ?? 0;
    const clicks = allClickMap[p.id] ?? 0;
    const recent = recentClickMap[p.id] ?? 0;
    const commission_kobo = Math.round(p.price_kobo * rate / 100);
    const isHot = gravity >= 3;
    const isRising = recent >= 5 && !isHot;
    const creatorName = Array.isArray(p.creator) ? (p.creator[0]?.name ?? "Unknown") : (p.creator?.name ?? "Unknown");
    return { ...p, rate, gravity, clicks, recent, commission_kobo, isHot, isRising, creatorName };
  }).sort((a, b) => (b.gravity * 10 + b.clicks) - (a.gravity * 10 + a.clicks));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-400 text-sm mt-1">Choose products to promote and earn commissions</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full text-orange-700 font-semibold">
          <Flame size={12} /> Hot — top sellers this week
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full text-blue-700 font-semibold">
          <TrendingUp size={12} /> Rising — trending in last 24h
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full text-emerald-700 font-semibold">
          <Zap size={12} /> Gravity — unique affiliates earning this week
        </span>
      </div>

      {enriched.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <p className="text-gray-400">No active products available yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {enriched.map((p) => {
          const refLink = `${BASE_URL}/p/${p.slug}?ref=${username}`;
          return (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="relative">
                {p.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumbnail_url} alt={p.name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                    <span className="text-5xl opacity-30">📦</span>
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {p.isHot && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold shadow">
                      <Flame size={10} /> Hot
                    </span>
                  )}
                  {p.isRising && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-bold shadow">
                      <TrendingUp size={10} /> Rising
                    </span>
                  )}
                </div>
                {/* Commission badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow">
                    {p.rate}% comm.
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <p className="font-bold text-gray-900 leading-tight">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">by {p.creatorName}</p>

                {/* Price + payout */}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="font-bold text-gray-900">{fmt(p.price_kobo)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">You earn</p>
                    <p className="font-bold text-emerald-600">{fmt(p.commission_kobo)}</p>
                  </div>
                </div>

                {/* Gravity bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Zap size={10} className="text-emerald-500" /> Gravity</span>
                    <span className="text-xs font-bold text-emerald-600">{p.gravity}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.max(4, (p.gravity / maxGravity) * 100)}%` }} />
                  </div>
                </div>

                {/* My stats */}
                <div className="flex gap-4 mt-3 text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span>Total clicks: <strong className="text-gray-700">{p.clicks}</strong></span>
                  <span>My clicks: <strong className="text-gray-700">{myClickMap[p.id] ?? 0}</strong></span>
                  <span>My sales: <strong className="text-emerald-600">{myConvMap[p.id] ?? 0}</strong></span>
                </div>

                {/* Ref link + copy */}
                <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-500 truncate flex-1 font-mono">{refLink}</p>
                  <CopyButton text={refLink} />
                </div>

                {/* Preview */}
                <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer"
                  className="mt-2 text-center text-xs text-gray-400 hover:text-emerald-600 transition-colors py-1">
                  Preview product page →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
