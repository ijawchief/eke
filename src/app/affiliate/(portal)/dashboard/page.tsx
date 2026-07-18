import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { Flame, TrendingUp, Star } from "lucide-react";

function fmt(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://veelage.co";

export default async function AffiliateDashboardPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/affiliate_id=([^;]+)/)?.[1];
  const affiliateId = raw ? decodeURIComponent(raw) : "";

  const db = getServiceClient();

  const now = new Date();
  const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const since7d  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000).toISOString();
  const since24h = new Date(now.getTime() -      24 * 60 * 60 * 1000).toISOString();

  const [
    { count: total_clicks },
    { count: total_conversions },
    { data: pendingData },
    { data: paidData },
    { data: recent_commissions },
    { data: weekClicks },
    { data: weekCommissions },
    { data: todayClicks },
    { data: affiliate },
    { data: allProducts },
    { data: platformConfig },
  ] = await Promise.all([
    db.from("affiliate_click").select("id", { count: "exact", head: true }).eq("affiliate_id", affiliateId).gte("created_at", since30d),
    db.from("affiliate_commission").select("id", { count: "exact", head: true }).eq("affiliate_id", affiliateId),
    db.from("affiliate_commission").select("amount_kobo").eq("affiliate_id", affiliateId).eq("status", "pending"),
    db.from("affiliate_commission").select("amount_kobo").eq("affiliate_id", affiliateId).eq("status", "paid"),
    db.from("affiliate_commission")
      .select("id, amount_kobo, status, created_at, product:product_id(name)")
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false })
      .limit(10),
    // All affiliate clicks in last 7d (all affiliates, for leaderboard)
    db.from("affiliate_click").select("product_id").gte("created_at", since7d),
    // All affiliate commissions in last 7d (for gravity)
    db.from("affiliate_commission").select("product_id, affiliate_id, amount_kobo").gte("created_at", since7d),
    // Today's clicks (all affiliates, for product of the day)
    db.from("affiliate_click").select("product_id").gte("created_at", since24h),
    db.from("affiliate").select("username").eq("id", affiliateId).single(),
    db.from("product").select("id, name, slug, price_kobo, thumbnail_url, affiliate_commission_rate").eq("active", true),
    db.from("affiliate_config").select("commission_rate").eq("id", 1).single(),
  ]);

  const pending_kobo = (pendingData ?? []).reduce((s: number, r: { amount_kobo: number }) => s + r.amount_kobo, 0);
  const paid_kobo   = (paidData   ?? []).reduce((s: number, r: { amount_kobo: number }) => s + r.amount_kobo, 0);
  const username = affiliate?.username ?? "";
  const defaultRate = (platformConfig as { commission_rate: number } | null)?.commission_rate ?? 10;

  // Build product map
  const productMap: Record<string, { id: string; name: string; slug: string; price_kobo: number; thumbnail_url: string | null; rate: number }> = {};
  for (const p of allProducts ?? []) {
    productMap[p.id] = { id: p.id, name: p.name, slug: p.slug, price_kobo: p.price_kobo, thumbnail_url: p.thumbnail_url, rate: p.affiliate_commission_rate ?? defaultRate };
  }

  // ── Product of the Day: most clicked product in last 24h ──────────
  const todayClickMap: Record<string, number> = {};
  for (const c of todayClicks ?? []) todayClickMap[c.product_id] = (todayClickMap[c.product_id] ?? 0) + 1;
  const potdId = Object.entries(todayClickMap).sort((a, b) => b[1] - a[1])[0]?.[0];
  const potd = potdId ? productMap[potdId] : (allProducts?.[0] ? productMap[allProducts[0].id] : null);

  // ── Top 10 of the week ────────────────────────────────────────────
  const weekClickMap: Record<string, number> = {};
  for (const c of weekClicks ?? []) weekClickMap[c.product_id] = (weekClickMap[c.product_id] ?? 0) + 1;

  // Gravity = unique affiliates who earned commission this week
  const weekGravityMap: Record<string, Set<string>> = {};
  const weekRevenueMap: Record<string, number> = {};
  for (const c of weekCommissions ?? []) {
    if (!weekGravityMap[c.product_id]) weekGravityMap[c.product_id] = new Set();
    weekGravityMap[c.product_id].add(c.affiliate_id);
    weekRevenueMap[c.product_id] = (weekRevenueMap[c.product_id] ?? 0) + c.amount_kobo;
  }

  const top10 = Object.keys(productMap)
    .map((id) => ({
      ...productMap[id],
      clicks: weekClickMap[id] ?? 0,
      gravity: weekGravityMap[id]?.size ?? 0,
      weekRevenue: weekRevenueMap[id] ?? 0,
      epc: weekClickMap[id] ? Math.round((weekRevenueMap[id] ?? 0) / weekClickMap[id]) : 0,
    }))
    .filter((p) => p.clicks > 0 || p.gravity > 0)
    .sort((a, b) => (b.gravity * 10 + b.clicks) - (a.gravity * 10 + a.clicks))
    .slice(0, 10);

  const stats = [
    { label: "Clicks (30d)",     value: String(total_clicks ?? 0),  sub: "product page visits" },
    { label: "Conversions",      value: String(total_conversions ?? 0), sub: "completed purchases" },
    { label: "Pending Earnings", value: fmt(pending_kobo),           sub: "awaiting approval" },
    { label: "Total Paid Out",   value: fmt(paid_kobo),              sub: "all time" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Your affiliate performance overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-xl sm:text-2xl font-extrabold ${i === 2 ? "text-yellow-600" : i === 3 ? "text-emerald-600" : "text-gray-900"}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Product of the Day */}
      {potd && (
        <div className="relative rounded-2xl overflow-hidden shadow-sm"
          style={{ background: "linear-gradient(135deg, #0f2a1f 0%, #1a4a32 60%, #0f3320 100%)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #4ade80 0%, transparent 60%)" }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6">
            <div className="flex items-center gap-2 sm:hidden">
              <Flame size={16} className="text-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Product of the Day</span>
            </div>
            {potd.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={potd.thumbnail_url} alt={potd.name}
                className="w-full sm:w-24 h-36 sm:h-24 object-cover rounded-xl flex-shrink-0" />
            )}
            {!potd.thumbnail_url && (
              <div className="w-24 h-24 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">📦</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="hidden sm:flex items-center gap-2 mb-1">
                <Flame size={15} className="text-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Product of the Day</span>
              </div>
              <p className="text-white font-bold text-lg leading-tight">{potd.name}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-emerald-300 font-semibold text-sm">{fmt(potd.price_kobo)}</span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold">{potd.rate}% commission</span>
                <span className="text-white/50 text-xs">Clicks today: {todayClickMap[potd.id] ?? 0}</span>
              </div>
              <p className="text-white/40 text-xs mt-1">Commission per sale: {fmt(Math.round(potd.price_kobo * potd.rate / 100))}</p>
            </div>
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
              <Link href={`/affiliate/links`}
                className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-colors">
                Get Link
              </Link>
              <a href={`/p/${potd.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors">
                Preview
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Top 10 of the week */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 sm:px-6 py-4 border-b border-gray-100">
          <TrendingUp size={16} className="text-emerald-600" />
          <h2 className="font-semibold text-gray-800">Top 10 Products This Week</h2>
          <span className="ml-auto text-xs text-gray-400">by gravity score</span>
        </div>

        {top10.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-sm">No activity yet this week.</p>
            <Link href="/affiliate/links" className="mt-2 inline-block text-emerald-600 text-sm hover:underline">
              Browse products to promote →
            </Link>
          </div>
        ) : (
          <div>
            {/* Mobile */}
            <div className="sm:hidden divide-y divide-gray-50">
              {top10.map((p, i) => (
                <div key={p.id} className="px-4 py-3.5 flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                    i === 0 ? "bg-yellow-400 text-yellow-900" : i === 1 ? "bg-gray-300 text-gray-700" : i === 2 ? "bg-orange-300 text-orange-900" : "bg-gray-100 text-gray-500"
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">{p.clicks} clicks</span>
                      <span className="text-xs text-emerald-600 font-semibold">⚡ {p.gravity} gravity</span>
                      <span className="text-xs text-gray-400">{p.rate}% comm.</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{fmt(p.price_kobo)}</p>
                    <p className="text-xs text-gray-400">EPC {fmt(p.epc)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left w-8">#</th>
                    <th className="px-6 py-3 text-left">Product</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Comm.</th>
                    <th className="px-6 py-3 text-left">Gravity</th>
                    <th className="px-6 py-3 text-left">Clicks</th>
                    <th className="px-6 py-3 text-left">EPC</th>
                    <th className="px-6 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {top10.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                          i === 0 ? "bg-yellow-400 text-yellow-900" : i === 1 ? "bg-gray-300 text-gray-700" : i === 2 ? "bg-orange-300 text-orange-900" : "bg-gray-100 text-gray-500"
                        }`}>{i + 1}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          {i < 3 && <Star size={12} className="text-yellow-400 flex-shrink-0" fill="currentColor" />}
                          <span className="font-semibold text-gray-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-gray-700">{fmt(p.price_kobo)}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{p.rate}%</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-emerald-600">{p.gravity}</span>
                        <span className="text-gray-400 text-xs ml-1">affiliates</span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">{p.clicks}</td>
                      <td className="px-6 py-3.5 font-semibold text-gray-700">{fmt(p.epc)}</td>
                      <td className="px-6 py-3.5">
                        <Link href={`/affiliate/links`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">
                          Promote
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Commissions */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Commissions</h2>
        </div>
        <div className="sm:hidden divide-y divide-gray-50">
          {(recent_commissions ?? []).length === 0 && (
            <p className="text-gray-400 text-sm text-center py-10">No commissions yet</p>
          )}
          {(recent_commissions ?? []).map((c: { id: string; amount_kobo: number; status: string; created_at: string; product: { name: string } | { name: string }[] | null }) => {
            const name = Array.isArray(c.product) ? (c.product[0]?.name ?? "—") : (c.product?.name ?? "—");
            return (
              <div key={c.id} className="px-4 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(c.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">{fmt(c.amount_kobo)}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    c.status === "paid" ? "bg-green-100 text-green-700" : c.status === "pending" ? "bg-yellow-100 text-yellow-700" : c.status === "approved" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"
                  }`}>{c.status}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(recent_commissions ?? []).length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">No commissions yet</td></tr>
              )}
              {(recent_commissions ?? []).map((c: { id: string; amount_kobo: number; status: string; created_at: string; product: { name: string } | { name: string }[] | null }) => {
                const name = Array.isArray(c.product) ? (c.product[0]?.name ?? "—") : (c.product?.name ?? "—");
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-800">{name}</td>
                    <td className="px-6 py-3.5 font-bold text-gray-900">{fmt(c.amount_kobo)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.status === "paid" ? "bg-green-100 text-green-700" : c.status === "pending" ? "bg-yellow-100 text-yellow-700" : c.status === "approved" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-400">{new Date(c.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
