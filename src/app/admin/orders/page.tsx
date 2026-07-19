import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { getCurrencyFromCookie, getRates, formatCurrency } from "@/lib/currency";
import { FulfillButton } from "./FulfillButton";

export default async function OrdersPage() {
  const h = await headers();
  const currency = getCurrencyFromCookie(h.get("cookie") ?? "");
  const rates = await getRates();
  const fmt = (kobo: number) => formatCurrency(kobo, currency, rates);

  const db = getServiceClient();
  const { data: orders } = await db
    .from("order")
    .select("id, status, total_kobo, paystack_reference, attribution, created_at, customer:customer_id(email, phone)")
    .order("created_at", { ascending: false })
    .limit(200);

  const all = orders ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-400 text-sm mt-1">{all.length} total · amounts in {currency}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {all.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No orders yet</p>}
          {all.map((o: {
            id: string; status: string; total_kobo: number;
            paystack_reference: string; attribution: Record<string, string | null>;
            created_at: string; customer: { email: string }[] | { email: string } | null;
          }) => {
            const email = Array.isArray(o.customer) ? o.customer[0]?.email : (o.customer as { email: string } | null)?.email;
            const source = (o.attribution as Record<string, string | null>)?.utm_campaign ?? (o.attribution as Record<string, string | null>)?.utm_source ?? "direct";
            return (
              <div key={o.id} className="px-4 py-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm truncate">{email ?? "—"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{source} · {new Date(o.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-gray-900 text-sm">{fmt(o.total_kobo)}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.status === "paid" ? "bg-green-100 text-green-700" : o.status === "pending" ? "bg-yellow-100 text-yellow-700" : o.status === "refunded" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>{o.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Reference</th>
                <th className="text-left px-6 py-4">Amount</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Source</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {all.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No orders yet</td></tr>
              )}
              {all.map((o: {
                id: string; status: string; total_kobo: number;
                paystack_reference: string; attribution: Record<string, string | null>;
                created_at: string; customer: { email: string }[] | { email: string } | null;
              }) => {
                const email = Array.isArray(o.customer) ? o.customer[0]?.email : (o.customer as { email: string } | null)?.email;
                const source = (o.attribution as Record<string, string | null>)?.utm_campaign ?? (o.attribution as Record<string, string | null>)?.utm_source ?? "direct";
                return (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-800">{email ?? "—"}</td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-400">{o.paystack_reference.slice(0, 20)}…</td>
                    <td className="px-6 py-3 font-semibold">{fmt(o.total_kobo)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${o.status === "paid" ? "bg-green-100 text-green-700" : o.status === "pending" ? "bg-yellow-100 text-yellow-700" : o.status === "refunded" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>{o.status}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-xs">{source}</td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {new Date(o.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-3">
                      {o.status === "pending" && <FulfillButton orderId={o.id} />}
                    </td>
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
