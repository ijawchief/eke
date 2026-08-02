import { getServiceClient } from "@/lib/supabase";
import { getCreatorId } from "@/lib/auth";
import { RevenueChart } from "@/components/admin/RevenueChart";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

export default async function CreatorAnalyticsPage() {
  const creatorId = await getCreatorId();

  const db = getServiceClient();
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);

  const { data: productRows } = await db.from("product").select("id, name").eq("creator_id", creatorId);
  const productIds = (productRows ?? []).map((p: { id: string }) => p.id);

  const [{ data: items }, viewsResult] = await Promise.all([
    db.from("order_item")
      .select("price_kobo, created_at, product_id, product:product_id(name), order:order_id(status, created_at, paid_at, attribution, customer:customer_id(name, email))")
      .eq("creator_id", creatorId)
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: false }),
    productIds.length > 0
      ? db.from("page_view").select("id, created_at").in("product_id", productIds).gte("created_at", start.toISOString())
      : Promise.resolve({ data: [] as { id: string; created_at: string }[] }),
  ]);

  const all = items ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paid = all.filter((i: any) => {
    const o = Array.isArray(i.order) ? i.order[0] : i.order;
    return o?.status === "paid";
  });

  const views = viewsResult.data ?? [];
  const pageViews = views.length;
  const started = all.length;
  const grossRevenue = paid.reduce((s: number, i: { price_kobo: number }) => s + i.price_kobo, 0);
  const avgOrder = paid.length > 0 ? grossRevenue / paid.length : 0;
  const checkoutCvr = started > 0 ? ((paid.length / started) * 100).toFixed(1) : "0";
  const viewCvr = pageViews > 0 ? ((started / pageViews) * 100).toFixed(1) : "0";

  // Chart data
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    const kobo = paid
      .filter((item: { created_at: string }) => item.created_at.slice(0, 10) === key)
      .reduce((s: number, item: { price_kobo: number }) => s + item.price_kobo, 0);
    return { label: d.toLocaleDateString("en", { month: "short", day: "numeric" }), value: kobo / 100 };
  });

  const funnel = [
    { label: "Page Views", value: pageViews, pct: null as string | null },
    { label: "Started Checkout", value: started, pct: viewCvr },
    { label: "Paid (Completed)", value: paid.length, pct: checkoutCvr },
  ];

  // Traffic sources
  const sources: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  all.forEach((i: any) => {
    const o = Array.isArray(i.order) ? i.order[0] : i.order;
    const src = o?.attribution?.utm_source ?? "direct";
    sources[src] = (sources[src] ?? 0) + 1;
  });
  const sourceEntries = Object.entries(sources).sort((a, b) => b[1] - a[1]);

  // Product breakdown
  const productMap: Record<string, { name: string; revenue: number; units: number }> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paid.forEach((i: any) => {
    const prod = Array.isArray(i.product) ? i.product[0] : i.product;
    const pname = prod?.name ?? "Unknown";
    if (!productMap[pname]) productMap[pname] = { name: pname, revenue: 0, units: 0 };
    productMap[pname].revenue += i.price_kobo;
    productMap[pname].units += 1;
  });
  const productBreakdown = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Last 30 days</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Gross Revenue", value: formatNaira(grossRevenue), sub: "total sales" },
          { label: "Avg Order Value", value: formatNaira(avgOrder), sub: `from ${paid.length} orders` },
          { label: "Checkout CVR", value: `${checkoutCvr}%`, sub: "paid / started checkout" },
          { label: "Page Views", value: pageViews.toLocaleString(), sub: `→ checkout ${viewCvr}%` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Revenue Trend</h2>
        <RevenueChart data={chartData} currency="NGN" />
      </div>

      {/* Funnel + Traffic sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-5">Conversion Funnel</h2>
          <div className="space-y-4">
            {funnel.map(({ label, value, pct }, i) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700">{label}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{value.toLocaleString()}</span>
                    {pct !== null && <span className="ml-2 text-xs text-orange-600 font-semibold">{pct}% CVR</span>}
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${i === 0 ? "bg-blue-400" : i === 1 ? "bg-yellow-400" : "bg-green-500"}`}
                    style={{ width: i === 0 ? "100%" : i === 1 ? `${viewCvr}%` : `${checkoutCvr}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-5">Traffic Sources</h2>
          {sourceEntries.length === 0 ? (
            <p className="text-gray-400 text-sm">No attribution data yet</p>
          ) : (
            <div className="space-y-3">
              {sourceEntries.map(([src, count]) => {
                const pct = Math.round((count / all.length) * 100);
                return (
                  <div key={src}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">{src}</span>
                      <span className="text-gray-400">{count} checkouts · {pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Revenue by product */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Revenue by Product</h2>
        </div>
        {productBreakdown.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">No sales this period</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {productBreakdown.map((p) => (
              <div key={p.name} className="px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.units} sold</p>
                  <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600 rounded-full"
                      style={{ width: `${grossRevenue > 0 ? (p.revenue / grossRevenue) * 100 : 0}%` }} />
                  </div>
                </div>
                <p className="font-bold text-gray-900 text-sm flex-shrink-0">{formatNaira(p.revenue)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All sales */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">All Sales This Period</h2>
          <Link href="/creator/orders" className="text-sm text-orange-600 hover:underline">View all →</Link>
        </div>
        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {paid.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No paid sales this period</p>}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {paid.slice(0, 30).map((o: any, idx: number) => {
            const order = Array.isArray(o.order) ? o.order[0] : o.order;
            const custRaw = order?.customer;
            const cust = Array.isArray(custRaw) ? custRaw[0] : custRaw;
            const prod = Array.isArray(o.product) ? o.product[0] : o.product;
            return (
              <div key={idx} className="px-4 py-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-sm truncate">{cust?.name ?? cust?.email ?? "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{prod?.name ?? "—"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 text-sm">{formatNaira(o.price_kobo)}</p>
                  <p className="text-xs text-gray-400">{order?.paid_at ? timeAgo(order.paid_at) : "—"}</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3">Buyer</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paid.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-gray-400">No paid sales this period</td></tr>}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {paid.slice(0, 30).map((o: any, idx: number) => {
                const order = Array.isArray(o.order) ? o.order[0] : o.order;
                const custRaw = order?.customer;
                const cust = Array.isArray(custRaw) ? custRaw[0] : custRaw;
                const prod = Array.isArray(o.product) ? o.product[0] : o.product;
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-gray-800">{cust?.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{cust?.email}</p>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600 max-w-[180px] truncate">{prod?.name ?? "—"}</td>
                    <td className="px-6 py-3.5 font-bold text-gray-900">{formatNaira(o.price_kobo)}</td>
                    <td className="px-6 py-3.5 text-xs text-gray-400 whitespace-nowrap">{order?.paid_at ? timeAgo(order.paid_at) : "—"}</td>
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
