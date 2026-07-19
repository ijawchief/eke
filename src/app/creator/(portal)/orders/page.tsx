import { cookies, headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export default async function CreatorOrdersPage() {
  const cookieStore = await cookies();
  const creatorId_raw = cookieStore.get("creator_id")?.value ?? "";
  let creatorId = creatorId_raw;
  if (!creatorId) {
    const h = await headers();
    const raw = h.get("cookie")?.match(/creator_id=([^;]+)/)?.[1];
    creatorId = raw ? decodeURIComponent(raw) : "";
  }

  const db = getServiceClient();
  const { data: items } = await db
    .from("order_item")
    .select("id, price_kobo, kind, created_at, product:product_id(name), order:order_id(status, created_at, customer:customer_id(email))")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  const all = items ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Sales</h1>
        <p className="text-gray-400 text-sm mt-1">{all.length} total</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Mobile cards */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div className="sm:hidden divide-y divide-gray-50">
          {all.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No sales yet</p>}
          {all.map((item: any) => {
            const order = Array.isArray(item.order) ? item.order[0] : item.order;
            const customerRaw = order?.customer;
            const email = Array.isArray(customerRaw) ? customerRaw[0]?.email : customerRaw?.email;
            const status = order?.status ?? "—";
            return (
              <div key={item.id} className="px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm truncate">{(Array.isArray(item.product) ? item.product[0] : item.product)?.name ?? "—"}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{email ?? "—"}</p>
                  <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-gray-900 text-sm">{formatNaira(item.price_kobo)}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status === "paid" ? "bg-green-100 text-green-700" : status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>{status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Type</th>
                <th className="text-left px-6 py-4">Amount</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {all.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No sales yet</td></tr>
              )}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {all.map((item: any) => {
                const order = Array.isArray(item.order) ? item.order[0] : item.order;
                const customerRaw = order?.customer;
                const email = Array.isArray(customerRaw) ? customerRaw[0]?.email : customerRaw?.email;
                const status = order?.status ?? "—";
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-800">{(Array.isArray(item.product) ? item.product[0] : item.product)?.name ?? "—"}</td>
                    <td className="px-6 py-3 text-gray-500">{email ?? "—"}</td>
                    <td className="px-6 py-3 capitalize text-gray-400 text-xs">{item.kind}</td>
                    <td className="px-6 py-3 font-semibold">{formatNaira(item.price_kobo)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status === "paid" ? "bg-green-100 text-green-700" : status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>{status}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
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
