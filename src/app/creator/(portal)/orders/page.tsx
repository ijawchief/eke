import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export default async function CreatorOrdersPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const creatorId = cookie.match(/creator_id=([^;]+)/)?.[1]!;

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
        <table className="w-full text-sm">
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
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      status === "paid" ? "bg-green-100 text-green-700" :
                      status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{status}</span>
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
  );
}
