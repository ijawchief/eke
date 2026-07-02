import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { getCurrencyFromCookie, getRates, formatCurrency, koboToDisplay } from "@/lib/currency";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { DashboardPeriodTabs } from "@/components/admin/DashboardPeriodTabs";
import Link from "next/link";

function periodRange(period: string, from?: string, to?: string) {
  const end = to ? new Date(to) : new Date();
  const start = new Date(end);
  if (period === "today") { start.setHours(0, 0, 0, 0); }
  else if (period === "week") { start.setDate(end.getDate() - 7); }
  else if (period === "month") { start.setMonth(end.getMonth() - 1); }
  else if (period === "custom" && from) return { start: new Date(from), end, label: "Custom" };
  else { start.setMonth(end.getMonth() - 1); }
  const labels: Record<string, string> = { today: "Today", week: "This Week", month: "This Month", custom: "Custom" };
  return { start, end, label: labels[period] ?? "This Month" };
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

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const { period = "month", from, to } = await searchParams;
  const h = await headers();
  const currency = getCurrencyFromCookie(h.get("cookie") ?? "");
  const rates = await getRates();
  const fmt = (kobo: number) => formatCurrency(kobo, currency, rates);
  const { start, end, label } = periodRange(period, from, to);

  const db = getServiceClient();

  const [
    { data: orders },
    { data: ledger },
    { data: views },
    { data: products },
    { data: orderItems },
  ] = await Promise.all([
    db.from("order")
      .select(`id, status, total_kobo, created_at, paid_at, country, city, attribution,
        customer:customer_id(name, email),
        order_item(product:product_id(name))`)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false }),
    db.from("ledger_entry")
      .select("direction, amount_kobo, entry_type, created_at")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString()),
    db.from("page_view")
      .select("id, created_at")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString()),
    db.from("product").select("id, name, price_kobo, active"),
    db.from("order_item")
      .select("product_id, price_kobo, order:order_id(status, paid_at, created_at)")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString()),
  ]);

  const allOrders = orders ?? [];
  const paidOrders = allOrders.filter((o: { status: string }) => o.status === "paid");
  const startedCheckouts = allOrders.length;
  const pageViews = (views ?? []).length;

  const grossRevenue = (ledger ?? [])
    .filter((e: { direction: string; entry_type: string }) => e.direction === "credit" && e.entry_type === "sale")
    .reduce((s: number, e: { amount_kobo: number }) => s + e.amount_kobo, 0);
  const refunds = (ledger ?? [])
    .filter((e: { direction: string; entry_type: string }) => e.direction === "debit" && e.entry_type === "refund")
    .reduce((s: number, e: { amount_kobo: number }) => s + e.amount_kobo, 0);
  const netRevenue = grossRevenue - refunds;

  const checkoutCvr = startedCheckouts > 0 ? ((paidOrders.length / startedCheckouts) * 100).toFixed(1) : "0";
  const viewCvr = pageViews > 0 ? ((startedCheckouts / pageViews) * 100).toFixed(1) : "0";
  const avgOrder = paidOrders.length > 0 ? grossRevenue / paidOrders.length : 0;

  // Chart — daily
  const chartDays = period === "today" ? 24 : period === "week" ? 7 : 30;
  const chartData = Array.from({ length: Math.min(chartDays, 30) }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() - (Math.min(chartDays, 30) - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const kobo = (ledger ?? [])
      .filter((e: { direction: string; entry_type: string; created_at: string }) =>
        e.direction === "credit" && e.entry_type === "sale" && e.created_at.slice(0, 10) === key)
      .reduce((s: number, e: { amount_kobo: number }) => s + e.amount_kobo, 0);
    return {
      label: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      value: koboToDisplay(kobo, currency, rates),
    };
  });

  // Revenue by product
  const productRevMap: Record<string, { name: string; revenue: number; units: number }> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (orderItems ?? []).forEach((item: any) => {
    const order = Array.isArray(item.order) ? item.order[0] : item.order;
    if (order?.status !== "paid") return;
    const id = item.product_id;
    if (!productRevMap[id]) {
      const p = (products ?? []).find((p: { id: string }) => p.id === id);
      productRevMap[id] = { name: p?.name ?? "Unknown", revenue: 0, units: 0 };
    }
    productRevMap[id].revenue += item.price_kobo;
    productRevMap[id].units += 1;
  });
  const productRows = Object.values(productRevMap).sort((a, b) => b.revenue - a.revenue);

  // Traffic sources
  const sources: Record<string, number> = {};
  allOrders.forEach((o: { attribution: Record<string, string | null> }) => {
    const src = o.attribution?.utm_source ?? "direct";
    sources[src] = (sources[src] ?? 0) + 1;
  });
  const sourceEntries = Object.entries(sources).sort((a, b) => b[1] - a[1]);

  // Funnel rows for conversion funnel display
  const funnel = [
    { label: "Page Views", value: pageViews, pct: null },
    { label: "Started Checkout", value: startedCheckouts, pct: pageViews > 0 ? ((startedCheckouts / pageViews) * 100).toFixed(1) : "0" },
    { label: "Paid (Completed)", value: paidOrders.length, pct: startedCheckouts > 0 ? ((paidOrders.length / startedCheckouts) * 100).toFixed(1) : "0" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">{label} · detailed breakdown</p>
        </div>
        <DashboardPeriodTabs current={period} />
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gross Revenue", value: fmt(grossRevenue), sub: "total sales" },
          { label: "Net Revenue", value: fmt(netRevenue), sub: `after ${fmt(refunds)} refunds` },
          { label: "Avg Order Value", value: fmt(avgOrder), sub: `from ${paidOrders.length} orders` },
          { label: "Checkout CVR", value: `${checkoutCvr}%`, sub: "paid / started checkout" },
        ].map(({ label: l, value, sub }) => (
          <div key={l} className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{l}</p>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Revenue Trend</h2>
        <RevenueChart data={chartData} currency={currency} />
      </div>

      {/* Conversion funnel + Traffic sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-5">Conversion Funnel</h2>
          <div className="space-y-3">
            {funnel.map(({ label: l, value, pct }, i) => {
              const widths = ["100%", viewCvr + "%", checkoutCvr + "%"];
              return (
                <div key={l}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">{l}</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{value.toLocaleString()}</span>
                      {pct !== null && (
                        <span className="ml-2 text-xs text-pink-500 font-semibold">{pct}% CVR</span>
                      )}
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i === 0 ? "bg-blue-400" : i === 1 ? "bg-yellow-400" : "bg-green-500"}`}
                      style={{ width: widths[i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic sources */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-5">Traffic Sources</h2>
          {sourceEntries.length === 0 ? (
            <p className="text-gray-400 text-sm">No attribution data yet</p>
          ) : (
            <div className="space-y-3">
              {sourceEntries.map(([src, count]) => {
                const pct = Math.round((count / allOrders.length) * 100);
                return (
                  <div key={src}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">{src}</span>
                      <span className="text-gray-400">{count} checkouts · {pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product performance */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Revenue by Product</h2>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Units Sold</th>
              <th className="px-6 py-3">Revenue</th>
              <th className="px-6 py-3">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {productRows.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">No sales in this period</td></tr>
            )}
            {productRows.map((p) => (
              <tr key={p.name} className="hover:bg-gray-50">
                <td className="px-6 py-3.5 font-medium text-gray-800">{p.name}</td>
                <td className="px-6 py-3.5 text-gray-600">{p.units}</td>
                <td className="px-6 py-3.5 font-bold text-gray-900">{fmt(p.revenue)}</td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 rounded-full"
                        style={{ width: `${grossRevenue > 0 ? (p.revenue / grossRevenue) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {grossRevenue > 0 ? ((p.revenue / grossRevenue) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {/* All paid orders in period */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">All Sales This Period</h2>
          <Link href="/admin/buyers" className="text-sm text-pink-500 hover:underline">View all buyers →</Link>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3">Buyer</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paidOrders.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No paid orders in this period</td></tr>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {paidOrders.slice(0, 50).map((o: any) => {
              const customer = Array.isArray(o.customer) ? o.customer[0] : o.customer;
              const item = o.order_item?.[0];
              const product = item ? (Array.isArray(item.product) ? item.product[0] : item.product) : null;
              const location = [o.city, o.country].filter(Boolean).join(", ") || "—";
              return (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="font-semibold text-gray-800">{customer?.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{customer?.email}</p>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 max-w-[180px] truncate">{product?.name ?? "—"}</td>
                  <td className="px-6 py-3.5 font-bold text-gray-900">{fmt(o.total_kobo)}</td>
                  <td className="px-6 py-3.5 text-xs text-gray-500">{location}</td>
                  <td className="px-6 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {o.paid_at ? timeAgo(o.paid_at) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
