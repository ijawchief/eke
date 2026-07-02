import { getServiceClient } from "@/lib/supabase";
import { headers } from "next/headers";
import { getCurrencyFromCookie, getRates, formatCurrency } from "@/lib/currency";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days = "30" } = await searchParams;
  const h = await headers();
  const currency = getCurrencyFromCookie(h.get("cookie") ?? "");
  const rates = await getRates();
  const fmt = (kobo: number) => formatCurrency(kobo, currency, rates);

  const since = new Date();
  since.setDate(since.getDate() - parseInt(days));

  const db = getServiceClient();
  const { data: orders } = await db
    .from("order")
    .select(`
      id, total_kobo, paid_at, country, city,
      customer:customer_id(name, email),
      order_item(product:product_id(name))
    `)
    .eq("status", "paid")
    .gte("paid_at", since.toISOString())
    .order("paid_at", { ascending: false })
    .limit(200);

  const PERIOD_OPTIONS = [
    { label: "Today", days: "1" },
    { label: "7 days", days: "7" },
    { label: "30 days", days: "30" },
    { label: "90 days", days: "90" },
    { label: "All time", days: "3650" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recent Buyers</h1>
          <p className="text-gray-400 text-sm mt-0.5">{(orders ?? []).length} buyers in the last {days} days</p>
        </div>
      </div>

      {/* Period filter */}
      <div className="flex gap-2 mb-6">
        {PERIOD_OPTIONS.map((opt) => (
          <Link
            key={opt.days}
            href={`/admin/buyers?days=${opt.days}`}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              days === opt.days
                ? "bg-pink-500 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3">Buyer</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Spent</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(orders ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-400">
                  No buyers in this period
                </td>
              </tr>
            )}
            {(orders ?? []).map((o: {
              id: string;
              total_kobo: number;
              paid_at: string;
              country: string | null;
              city: string | null;
              customer: { name: string | null; email: string } | { name: string | null; email: string }[] | null;
              order_item: { product: { name: string } | { name: string }[] | null }[];
            }) => {
              const customer = Array.isArray(o.customer) ? o.customer[0] : o.customer;
              const productName = (() => {
                const item = o.order_item?.[0];
                if (!item) return "—";
                const p = Array.isArray(item.product) ? item.product[0] : item.product;
                return p?.name ?? "—";
              })();
              const location = [o.city, o.country].filter(Boolean).join(", ") || "—";
              return (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="font-semibold text-gray-800">{customer?.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{customer?.email}</p>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 max-w-[200px] truncate">{productName}</td>
                  <td className="px-6 py-3.5 font-bold text-gray-900">{fmt(o.total_kobo)}</td>
                  <td className="px-6 py-3.5 text-gray-500 text-xs">{location}</td>
                  <td className="px-6 py-3.5 text-gray-400 text-xs whitespace-nowrap">
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
