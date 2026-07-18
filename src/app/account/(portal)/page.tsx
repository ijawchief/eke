import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { Download } from "lucide-react";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export default async function AccountDashboard() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/customer_id=([^;]+)/)?.[1];
  const customerId = raw ? decodeURIComponent(raw) : null;

  const db = getServiceClient();
  const { data: orders } = await db
    .from("order")
    .select(`id, total_kobo, status, paid_at, order_item(id, product:product_id(id, name, slug, thumbnail_url))`)
    .eq("customer_id", customerId)
    .eq("status", "paid")
    .order("paid_at", { ascending: false });

  const allOrders = orders ?? [];
  const totalSpent = allOrders.reduce((s, o) => s + o.total_kobo, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Purchases</h1>
        <p className="text-gray-400 text-sm mt-1">{allOrders.length} order{allOrders.length !== 1 ? "s" : ""} · {formatNaira(totalSpent)} total</p>
      </div>

      {allOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-400 mb-3">You haven&apos;t bought anything yet.</p>
          <Link href="/" className="text-orange-600 text-sm font-semibold hover:underline">Browse products →</Link>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {allOrders.map((order: any) => {
            const items = order.order_item ?? [];
            return items.map((item: any) => {
              const product = Array.isArray(item.product) ? item.product[0] : item.product;
              if (!product) return null;
              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  {product.thumbnail_url ? (
                    <img src={product.thumbnail_url} alt={product.name} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-orange-50 flex items-center justify-center">
                      <span className="text-orange-300 text-4xl font-black">{product.name?.[0]}</span>
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</p>
                    <p className="text-xs text-gray-400 mb-3">
                      Purchased {order.paid_at ? new Date(order.paid_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </p>
                    <div className="mt-auto flex gap-2">
                      <Link
                        href={`/p/${product.slug}`}
                        className="flex-1 text-center text-xs font-semibold py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/confirmation?order_id=${order.id}`}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                      >
                        <Download size={12} /> Download
                      </Link>
                    </div>
                  </div>
                </div>
              );
            });
          })}
        </div>
      )}
    </div>
  );
}
