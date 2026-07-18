import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { MiniSparkline } from "@/components/admin/MiniSparkline";
import { Eye, ShoppingCart, TrendingUp, DollarSign, ArrowRight, Info } from "lucide-react";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function CreatorDashboard() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/creator_id=([^;]+)/)?.[1];
  const creatorId = raw ? decodeURIComponent(raw) : null;

  const db = getServiceClient();
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);

  const [
    { data: creator },
    { data: allItems },
    { data: periodItems },
    { data: withdrawals },
    { data: products },
    { data: views },
  ] = await Promise.all([
    db.from("creator").select("name, email").eq("id", creatorId).single(),
    db.from("order_item")
      .select("id, price_kobo, created_at, product:product_id(name), order:order_id(status, created_at, customer:customer_id(email, name))")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })
      .limit(100),
    db.from("order_item")
      .select("price_kobo, created_at, order:order_id(status)")
      .eq("creator_id", creatorId)
      .gte("created_at", start.toISOString()),
    db.from("withdrawal_request")
      .select("id, amount_kobo, status, created_at")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })
      .limit(10),
    db.from("product")
      .select("id, name, price_kobo, active")
      .eq("creator_id", creatorId),
    db.from("page_view")
      .select("id, created_at, product_id")
      .in("product_id", (await db.from("product").select("id").eq("creator_id", creatorId)).data?.map((p) => p.id) ?? [])
      .gte("created_at", start.toISOString()),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paidItems = (allItems ?? []).filter((i: any) => {
    const o = Array.isArray(i.order) ? i.order[0] : i.order;
    return o?.status === "paid";
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodPaid = (periodItems ?? []).filter((i: any) => {
    const o = Array.isArray(i.order) ? i.order[0] : i.order;
    return o?.status === "paid";
  });

  const totalEarned = paidItems.reduce((s: number, i: { price_kobo: number }) => s + i.price_kobo, 0);
  const totalWithdrawn = (withdrawals ?? []).filter((w: { status: string }) => w.status === "paid").reduce((s: number, w: { amount_kobo: number }) => s + w.amount_kobo, 0);
  const walletBalance = totalEarned - totalWithdrawn;
  const periodRevenue = periodPaid.reduce((s: number, i: { price_kobo: number }) => s + i.price_kobo, 0);
  const pageViewCount = (views ?? []).length;
  const totalActiveProducts = (products ?? []).filter((p: { active: boolean }) => p.active).length;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodStarted = (periodItems ?? []).length;
  const checkoutCvr = periodStarted > 0 ? ((periodPaid.length / periodStarted) * 100).toFixed(1) : "0";
  const viewCvr = pageViewCount > 0 ? ((periodStarted / pageViewCount) * 100).toFixed(1) : "0";

  // Daily sparkline — last 30 days
  const sparkDays = 30;
  const dailyData = Array.from({ length: sparkDays }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() - (sparkDays - 1 - i));
    const key = d.toISOString().slice(0, 10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rev = (periodItems ?? []).filter((item: any) => {
      const o = Array.isArray(item.order) ? item.order[0] : item.order;
      return o?.status === "paid" && item.created_at.slice(0, 10) === key;
    }).reduce((s: number, item: { price_kobo: number }) => s + item.price_kobo, 0);
    const viewsDay = (views ?? []).filter((v: { created_at: string }) => v.created_at.slice(0, 10) === key).length;
    const checkoutsDay = (periodItems ?? []).filter((item: { created_at: string }) => item.created_at.slice(0, 10) === key).length;
    const salesDay = periodPaid.filter((item: { created_at: string }) => item.created_at.slice(0, 10) === key).length;
    return {
      date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      revenue: rev / 100,
      views: viewsDay,
      checkouts: checkoutsDay,
      sales: salesDay,
    };
  });
  const startLabel = dailyData[0]?.date ?? "";
  const endLabel = dailyData[dailyData.length - 1]?.date ?? "";

  // Product performance
  const productMap: Record<string, { name: string; revenue: number; units: number }> = {};
  paidItems.forEach((item: { price_kobo: number; product?: { name: string }[] | { name: string } | null; order?: unknown }) => {
    const prod = Array.isArray((item as { product?: unknown }).product) ? (item as { product: { name: string }[] }).product[0] : (item as { product?: { name: string } | null }).product;
    const pname = prod?.name ?? "Unknown";
    if (!productMap[pname]) productMap[pname] = { name: pname, revenue: 0, units: 0 };
    productMap[pname].revenue += item.price_kobo;
    productMap[pname].units += 1;
  });
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  const maxProductRevenue = Math.max(1, ...topProducts.map((p) => p.revenue));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome, <span className="font-extrabold">{creator?.name ?? "Creator"}</span>!
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">{creator?.email} · last 30 days</p>
      </div>

      {/* Funnel cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
        {/* Revenue */}
        <Link href="/creator/analytics" className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-gray-500 min-w-0">
              <Info size={12} className="flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold truncate">Revenue</span>
              <ArrowRight size={12} className="flex-shrink-0" />
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign size={13} className="text-orange-600" />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-2">{formatNaira(periodRevenue)}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap">
              Wallet: {formatNaira(walletBalance)}
            </span>
          </div>
          <div className="mt-auto">
            <MiniSparkline data={dailyData.map((d) => ({ value: d.revenue }))} color="#ea580c" startLabel={startLabel} endLabel={endLabel} />
          </div>
        </Link>

        {/* Page Views */}
        <Link href="/creator/analytics" className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-gray-500 min-w-0">
              <Info size={12} className="flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold truncate">Page Views</span>
              <ArrowRight size={12} className="flex-shrink-0" />
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Eye size={13} className="text-blue-500" />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-2">{pageViewCount.toLocaleString()}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full whitespace-nowrap">→ checkout: {viewCvr}%</span>
          </div>
          <div className="mt-auto">
            <MiniSparkline data={dailyData.map((d) => ({ value: d.views }))} color="#3b82f6" startLabel={startLabel} endLabel={endLabel} />
          </div>
        </Link>

        {/* Started Checkout */}
        <Link href="/creator/orders" className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-gray-500 min-w-0">
              <Info size={12} className="flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold truncate">Checkouts</span>
              <ArrowRight size={12} className="flex-shrink-0" />
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingCart size={13} className="text-yellow-500" />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-2">{periodStarted.toLocaleString()}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap">CVR: {checkoutCvr}%</span>
          </div>
          <div className="mt-auto">
            <MiniSparkline data={dailyData.map((d) => ({ value: d.checkouts }))} color="#f59e0b" startLabel={startLabel} endLabel={endLabel} />
          </div>
        </Link>

        {/* Sales */}
        <Link href="/creator/orders" className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-gray-500 min-w-0">
              <Info size={12} className="flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold truncate">Sales</span>
              <ArrowRight size={12} className="flex-shrink-0" />
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp size={13} className="text-green-500" />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-2">{periodPaid.length.toLocaleString()}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full whitespace-nowrap">All time: {paidItems.length}</span>
          </div>
          <div className="mt-auto">
            <MiniSparkline data={dailyData.map((d) => ({ value: d.sales }))} color="#22c55e" startLabel={startLabel} endLabel={endLabel} />
          </div>
        </Link>
      </div>

      {/* Product performance */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-800">Product Performance</h2>
              <p className="text-xs text-gray-400 mt-0.5">{totalActiveProducts} active products</p>
            </div>
            <Link href="/creator/products" className="text-sm text-orange-600 hover:underline font-medium flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 divide-x divide-y xl:divide-y-0 divide-gray-50">
            {topProducts.map((p, i) => {
              const pct = Math.round((p.revenue / maxProductRevenue) * 100);
              const colors = ["bg-orange-600", "bg-blue-500", "bg-yellow-500", "bg-green-500"];
              return (
                <div key={p.name} className="px-4 sm:px-6 py-4 sm:py-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg ${colors[i]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{i + 1}</div>
                    <span className="text-xs text-gray-400 font-semibold">{p.units} sold</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm leading-snug mb-1 line-clamp-2">{p.name}</p>
                  <p className="text-base sm:text-lg font-extrabold text-gray-900 mb-2 sm:mb-3">{formatNaira(p.revenue)}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i]} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent sales */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Sales</h2>
          <Link href="/creator/orders" className="text-sm text-orange-600 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {paidItems.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No sales yet</p>}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {paidItems.slice(0, 8).map((item: any) => {
            const order = Array.isArray(item.order) ? item.order[0] : item.order;
            const customerRaw = order?.customer;
            const cust = Array.isArray(customerRaw) ? customerRaw[0] : customerRaw;
            const prod = Array.isArray(item.product) ? item.product[0] : item.product;
            return (
              <div key={item.id} className="px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm truncate">{prod?.name ?? "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{cust?.email ?? "—"}</p>
                  <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</p>
                </div>
                <p className="font-semibold text-gray-900 text-sm flex-shrink-0">{formatNaira(item.price_kobo)}</p>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left px-6 py-3">Customer</th>
                <th className="text-left px-6 py-3">Product</th>
                <th className="text-left px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paidItems.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-gray-400">No sales yet</td></tr>}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {paidItems.slice(0, 8).map((item: any) => {
                const order = Array.isArray(item.order) ? item.order[0] : item.order;
                const customerRaw = order?.customer;
                const cust = Array.isArray(customerRaw) ? customerRaw[0] : customerRaw;
                const prod = Array.isArray(item.product) ? item.product[0] : item.product;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-800">{cust?.name ?? cust?.email ?? "—"}</p>
                      {cust?.name && <p className="text-xs text-gray-400">{cust?.email}</p>}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{prod?.name ?? "—"}</td>
                    <td className="px-6 py-3 font-semibold">{formatNaira(item.price_kobo)}</td>
                    <td className="px-6 py-3 text-gray-400 text-xs">{new Date(item.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
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
