import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { getCurrencyFromCookie, getRates, formatCurrency, koboToDisplay } from "@/lib/currency";
import { DashboardPeriodTabs } from "@/components/admin/DashboardPeriodTabs";
import { MiniSparkline } from "@/components/admin/MiniSparkline";
import { SalesMap } from "@/components/admin/SalesMap";
import Link from "next/link";
import { Eye, ShoppingCart, TrendingUp, DollarSign, ArrowRight, Info } from "lucide-react";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function periodRange(period: string, from?: string, to?: string) {
  const end = to ? new Date(to) : new Date();
  const start = new Date(end);
  if (period === "today") start.setHours(0, 0, 0, 0);
  else if (period === "week") start.setDate(end.getDate() - 7);
  else if (period === "month") start.setMonth(end.getMonth() - 1);
  else if (period === "custom" && from) return { start: new Date(from), end };
  else start.setMonth(end.getMonth() - 1);
  return { start, end };
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const { period = "month", from, to } = await searchParams;
  const h = await headers();
  const currency = getCurrencyFromCookie(h.get("cookie") ?? "");
  const rates = await getRates();
  const fmt = (kobo: number) => formatCurrency(kobo, currency, rates);

  const { start, end } = periodRange(period, from, to);
  const db = getServiceClient();

  const [{ data: orders }, { data: ledger }, { data: views }, { data: recentPaid }, { data: products }, { data: orderItems }] = await Promise.all([
    db.from("order").select("id, status, total_kobo, created_at").gte("created_at", start.toISOString()).lte("created_at", end.toISOString()),
    db.from("ledger_entry").select("direction, amount_kobo, entry_type, created_at").gte("created_at", start.toISOString()).lte("created_at", end.toISOString()),
    db.from("page_view").select("id, created_at").gte("created_at", start.toISOString()).lte("created_at", end.toISOString()),
    db.from("order").select(`id, total_kobo, paid_at, country, city, customer:customer_id(name, email), order_item(product:product_id(name))`).eq("status", "paid").order("paid_at", { ascending: false }).limit(7),
    db.from("product").select("id, name, price_kobo, active"),
    db.from("order_item").select("product_id, price_kobo, order:order_id(status, paid_at)").gte("created_at", start.toISOString()).lte("created_at", end.toISOString()),
  ]);

  const allOrders = orders ?? [];
  const paidOrders = allOrders.filter((o: { status: string }) => o.status === "paid");
  const startedCheckouts = allOrders.length;
  const pageViewCount = (views ?? []).length;

  const grossRevenue = (ledger ?? []).filter((e: { direction: string; entry_type: string }) => e.direction === "credit" && e.entry_type === "sale").reduce((s: number, e: { amount_kobo: number }) => s + e.amount_kobo, 0);
  const refunds = (ledger ?? []).filter((e: { direction: string; entry_type: string }) => e.direction === "debit" && e.entry_type === "refund").reduce((s: number, e: { amount_kobo: number }) => s + e.amount_kobo, 0);
  const netRevenue = grossRevenue - refunds;
  const checkoutCvr = startedCheckouts > 0 ? ((paidOrders.length / startedCheckouts) * 100).toFixed(2) : "0";
  const viewCvr = pageViewCount > 0 ? ((startedCheckouts / pageViewCount) * 100).toFixed(2) : "0";
  const netSales = paidOrders.length;
  const leads = allOrders.filter((o: { status: string }) => o.status === "pending").length;

  // Build daily sparkline data for the period
  const totalDays = Math.max(7, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const sparkDays = Math.min(totalDays, 30);
  const dailyData = Array.from({ length: sparkDays }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() - (sparkDays - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const revKobo = (ledger ?? []).filter((e: { direction: string; entry_type: string; created_at: string }) => e.direction === "credit" && e.entry_type === "sale" && e.created_at.slice(0, 10) === key).reduce((s: number, e: { amount_kobo: number }) => s + e.amount_kobo, 0);
    const viewsDay = (views ?? []).filter((v: { created_at: string }) => v.created_at.slice(0, 10) === key).length;
    const checkoutsDay = allOrders.filter((o: { created_at: string }) => o.created_at.slice(0, 10) === key).length;
    const salesDay = paidOrders.filter((o: { created_at: string }) => o.created_at.slice(0, 10) === key).length;
    return {
      date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      revenue: koboToDisplay(revKobo, currency, rates),
      views: viewsDay,
      checkouts: checkoutsDay,
      sales: salesDay,
    };
  });

  const startLabel = dailyData[0]?.date ?? "";
  const endLabel = dailyData[dailyData.length - 1]?.date ?? "";
  // Product stats for the period
  const productMap: Record<string, { name: string; revenue: number; units: number }> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (orderItems ?? []).forEach((item: any) => {
    const order = Array.isArray(item.order) ? item.order[0] : item.order;
    if (order?.status !== "paid") return;
    const id = item.product_id;
    if (!productMap[id]) {
      const p = (products ?? []).find((p: { id: string }) => p.id === id);
      productMap[id] = { name: p?.name ?? "Unknown", revenue: 0, units: 0 };
    }
    productMap[id].revenue += item.price_kobo;
    productMap[id].units += 1;
  });
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  const maxProductRevenue = Math.max(1, ...topProducts.map((p) => p.revenue));
  const totalActiveProducts = (products ?? []).filter((p: { active: boolean }) => p.active).length;

  const adminUsername = process.env.ADMIN_USERNAME ?? "Admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Home</h1>
        <p className="text-gray-400 text-sm mt-0.5">Welcome back, <span className="font-semibold text-gray-600 capitalize">{adminUsername}</span>!</p>
      </div>

      {/* Period tabs row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <DashboardPeriodTabs current={period} />
      </div>

      {/* Funnel cards — screenshot style */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">

        {/* Gross Revenue */}
        <Link href="/admin/sales" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Info size={13} />
              <span className="text-sm font-semibold">Gross Revenue</span>
              <ArrowRight size={13} />
            </div>
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
              <DollarSign size={15} className="text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mb-3">{fmt(grossRevenue)}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              <Info size={10} /> Net Revenue: {fmt(netRevenue)}
            </span>
          </div>
          <div className="mt-auto">
            <MiniSparkline data={dailyData.map((d) => ({ value: d.revenue }))} color="#ea580c" startLabel={startLabel} endLabel={endLabel} />
          </div>
        </Link>

        {/* Funnel Views */}
        <Link href="/admin/sales" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Info size={13} />
              <span className="text-sm font-semibold">Funnel Views</span>
              <ArrowRight size={13} />
            </div>
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Eye size={15} className="text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mb-3">{pageViewCount.toLocaleString()}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              <Info size={10} /> To checkout: {viewCvr}%
            </span>
          </div>
          <div className="mt-auto">
            <MiniSparkline data={dailyData.map((d) => ({ value: d.views }))} color="#3b82f6" startLabel={startLabel} endLabel={endLabel} />
          </div>
        </Link>

        {/* Started Checkout */}
        <Link href="/admin/sales" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Info size={13} />
              <span className="text-sm font-semibold">Started Checkout</span>
              <ArrowRight size={13} />
            </div>
            <div className="w-8 h-8 bg-yellow-50 rounded-xl flex items-center justify-center">
              <ShoppingCart size={15} className="text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mb-3">{startedCheckouts.toLocaleString()}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Conversion rate: {checkoutCvr}%
            </span>
          </div>
          <div className="mt-auto">
            <MiniSparkline data={dailyData.map((d) => ({ value: d.checkouts }))} color="#f59e0b" startLabel={startLabel} endLabel={endLabel} />
          </div>
        </Link>

        {/* Gross Sales */}
        <Link href="/admin/sales" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Info size={13} />
              <span className="text-sm font-semibold">Gross Sales</span>
              <ArrowRight size={13} />
            </div>
            <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={15} className="text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mb-3">{paidOrders.length.toLocaleString()}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              <Info size={10} /> Net Sales: {netSales}
            </span>
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              <Info size={10} /> Leads: {leads}
            </span>
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              <Info size={10} /> Checkout CVR: {checkoutCvr}%
            </span>
            {refunds > 0 && (
              <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full font-semibold">
                Refunds: {Math.round(refunds / 100)}
              </span>
            )}
          </div>
          <div className="mt-auto">
            <MiniSparkline data={dailyData.map((d) => ({ value: d.sales }))} color="#22c55e" startLabel={startLabel} endLabel={endLabel} />
          </div>
        </Link>
      </div>

      {/* Product performance snapshot */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800">Product Performance</h2>
            <p className="text-xs text-gray-400 mt-0.5">{totalActiveProducts} active products · top sellers this period</p>
          </div>
          <Link href="/admin/sales" className="text-sm text-orange-600 hover:underline font-medium flex items-center gap-1">
            Full breakdown <ArrowRight size={14} />
          </Link>
        </div>

        {topProducts.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">No sales in this period</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-50">
            {topProducts.map((p, i) => {
              const pct = Math.round((p.revenue / maxProductRevenue) * 100);
              const colors = ["bg-orange-600", "bg-blue-500", "bg-yellow-500", "bg-green-500"];
              return (
                <div key={p.name} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-lg ${colors[i]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {i + 1}
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">{p.units} sold</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm leading-snug mb-1 line-clamp-2">{p.name}</p>
                  <p className="text-lg font-extrabold text-gray-900 mb-3">{fmt(p.revenue)}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i]} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent sales + Globe */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        {/* Recent sales */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Sales</h2>
            <Link href="/admin/buyers" className="flex items-center gap-1 text-sm text-orange-600 hover:underline font-medium">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentPaid ?? []).length === 0 && (
              <p className="text-center text-gray-400 text-sm py-12">No sales yet</p>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(recentPaid ?? []).map((o: any) => {
              const customer = Array.isArray(o.customer) ? o.customer[0] : o.customer;
              const item = o.order_item?.[0];
              const product = item ? (Array.isArray(item.product) ? item.product[0] : item.product) : null;
              const location = [o.city, o.country].filter(Boolean).join(", ") || null;
              return (
                <div key={o.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600 text-xs font-bold">
                      {(customer?.name ?? customer?.email ?? "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{customer?.name ?? customer?.email ?? "—"}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {product?.name ?? "—"}{location && <span className="ml-1 text-gray-300">· {location}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-bold text-gray-900 text-sm">{fmt(o.total_kobo)}</p>
                    <p className="text-xs text-gray-400">{o.paid_at ? timeAgo(o.paid_at) : "—"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Globe */}
        <SalesMap />
      </div>
    </div>
  );
}
