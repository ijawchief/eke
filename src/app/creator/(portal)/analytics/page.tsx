import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export default async function CreatorAnalyticsPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/creator_id=([^;]+)/)?.[1];
  const creatorId = raw ? decodeURIComponent(raw) : null;

  const db = getServiceClient();
  const [{ data: items }, { data: products }] = await Promise.all([
    db.from("order_item")
      .select("price_kobo, product_id, created_at, order:order_id(status)")
      .eq("creator_id", creatorId),
    db.from("product").select("id, name").eq("creator_id", creatorId),
  ]);

  const all = items ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paid = all.filter((i: any) => {
    const o = Array.isArray(i.order) ? i.order[0] : i.order;
    return o?.status === "paid";
  });

  const totalRevenue = paid.reduce((s: number, i: { price_kobo: number }) => s + i.price_kobo, 0);

  // Per-product breakdown
  const byProduct: Record<string, { name: string; revenue: number; units: number }> = {};
  paid.forEach((i: { product_id: string; price_kobo: number }) => {
    if (!byProduct[i.product_id]) {
      const p = (products ?? []).find((p: { id: string }) => p.id === i.product_id);
      byProduct[i.product_id] = { name: p?.name ?? "Unknown", revenue: 0, units: 0 };
    }
    byProduct[i.product_id].revenue += i.price_kobo;
    byProduct[i.product_id].units += 1;
  });
  const topProducts = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue);
  const maxRev = Math.max(1, ...topProducts.map((p) => p.revenue));

  // Last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const rev = paid
      .filter((x: { created_at: string }) => x.created_at.slice(0, 10) === key)
      .reduce((s: number, x: { price_kobo: number }) => s + x.price_kobo, 0);
    return { label: d.toLocaleDateString("en", { weekday: "short" }), rev };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.rev));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Your performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: formatNaira(totalRevenue) },
          { label: "Total Sales", value: paid.length.toString() },
          { label: "Products", value: (products ?? []).length.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* 7-day chart */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="font-semibold text-gray-800 mb-4">Revenue — last 7 days</p>
        <div className="flex items-end gap-3 h-28">
          {days.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-orange-500 rounded-t-md"
                style={{ height: `${Math.max(4, (d.rev / maxDay) * 100)}%` }}
              />
              <span className="text-xs text-gray-400">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top products */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="font-semibold text-gray-800">Top Products</p>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.map((p) => (
              <div key={p.name} className="px-5 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.units} sold</p>
                </div>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                </div>
                <p className="font-semibold text-gray-900 text-sm w-24 text-right">{formatNaira(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
