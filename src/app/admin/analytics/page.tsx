import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { getCurrencyFromCookie, getRates, formatCurrency } from "@/lib/currency";
import { RevenueChart } from "@/components/admin/RevenueChart";

export default async function AnalyticsPage() {
  const h = await headers();
  const currency = getCurrencyFromCookie(h.get("cookie") ?? "");
  const rates = await getRates();
  const fmt = (kobo: number) => formatCurrency(kobo, currency, rates);

  const db = getServiceClient();

  const [{ data: orders }, { data: ledger }, { data: products }, { data: customers }] = await Promise.all([
    db.from("order").select("id, status, total_kobo, created_at, attribution"),
    db.from("ledger_entry").select("direction, amount_kobo, entry_type, created_at"),
    db.from("product").select("id, name, price_kobo, active"),
    db.from("customer").select("id, created_at"),
  ]);

  const allOrders = orders ?? [];
  const allLedger = ledger ?? [];

  // Revenue last 30 days
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    const kobo = allLedger
      .filter((e: { direction: string; entry_type: string; created_at: string }) =>
        e.direction === "credit" && e.entry_type === "sale" && e.created_at.slice(0, 10) === key
      )
      .reduce((s: number, e: { amount_kobo: number }) => s + e.amount_kobo, 0);
    return {
      label: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      value: currency === "NGN" ? kobo / 100 : parseFloat((kobo / 100 / (rates.NGN ?? 1650)).toFixed(2)),
    };
  });

  const grossRevenue = allLedger
    .filter((e: { direction: string; entry_type: string }) => e.direction === "credit" && e.entry_type === "sale")
    .reduce((s: number, e: { amount_kobo: number }) => s + e.amount_kobo, 0);

  const refunds = allLedger
    .filter((e: { direction: string; entry_type: string }) => e.direction === "debit" && e.entry_type === "refund")
    .reduce((s: number, e: { amount_kobo: number }) => s + e.amount_kobo, 0);

  const paidOrders = allOrders.filter((o: { status: string }) => o.status === "paid");
  const conversionRate = allOrders.length > 0 ? ((paidOrders.length / allOrders.length) * 100).toFixed(1) : "0";

  // Traffic sources from attribution
  const sources: Record<string, number> = {};
  allOrders.forEach((o: { attribution: Record<string, string | null> }) => {
    const src = (o.attribution as Record<string, string | null>)?.utm_source ?? "direct";
    sources[src] = (sources[src] ?? 0) + 1;
  });
  const sourceEntries = Object.entries(sources).sort((a, b) => b[1] - a[1]);

  // New customers by week
  const customersByWeek = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (7 * (7 - i)));
    const weekEnd = new Date(d);
    weekEnd.setDate(d.getDate() + 7);
    const count = (customers ?? []).filter((c: { created_at: string }) => {
      const t = new Date(c.created_at);
      return t >= d && t < weekEnd;
    }).length;
    return { label: `W${i + 1}`, count };
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">All-time performance</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Gross Revenue", value: fmt(grossRevenue) },
          { label: "Net Revenue", value: fmt(grossRevenue - refunds) },
          { label: "Conversion Rate", value: `${conversionRate}%` },
          { label: "Total Customers", value: (customers ?? []).length.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-2">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-800 mb-1">Revenue — last 30 days</h2>
        <p className="text-xs text-gray-400 mb-4">Shown in {currency}</p>
        <RevenueChart data={last30} currency={currency} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic sources */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Traffic Sources</h2>
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
                      <span className="text-gray-400">{count} orders · {pct}%</span>
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

        {/* New customers by week */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">New Customers (last 8 weeks)</h2>
          <div className="flex items-end gap-2 h-32">
            {customersByWeek.map(({ label, count }) => {
              const max = Math.max(...customersByWeek.map((w) => w.count), 1);
              const height = Math.round((count / max) * 100);
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
                    <div
                      className="w-full bg-pink-500 rounded-t-md transition-all"
                      style={{ height: `${height}%`, minHeight: count > 0 ? 4 : 0 }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product performance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-gray-800 mb-4">Product Performance</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left pb-3">Product</th>
                <th className="text-left pb-3">Price</th>
                <th className="text-left pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(products ?? []).map((p: { id: string; name: string; price_kobo: number; active: boolean }) => (
                <tr key={p.id}>
                  <td className="py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="py-3 text-gray-600">
                    {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p.price_kobo / 100)}
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
