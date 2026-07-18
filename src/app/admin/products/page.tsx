import { getServiceClient } from "@/lib/supabase";
import { getCurrencyFromCookie, getRates, formatCurrency } from "@/lib/currency";
import { headers } from "next/headers";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

function getThumbnail(blocks: { type: string; data: Record<string, unknown> }[]): string | null {
  const img = blocks?.find((b) => b.type === "image");
  return img ? (img.data.url as string) ?? null : null;
}

export default async function AdminProductsPage() {
  const db = getServiceClient();
  const h = await headers();
  const currency = getCurrencyFromCookie(h.get("cookie") ?? "");
  const rates = await getRates();
  const fmt = (kobo: number) => formatCurrency(kobo, currency, rates);

  const [{ data: products }, { data: orderItems }, { data: views }] = await Promise.all([
    db.from("product")
      .select("id, name, slug, price_kobo, active, created_at, page_blocks, creator_id, creator:creator_id(name, email)")
      .order("created_at", { ascending: false }),
    db.from("order_item")
      .select("product_id, price_kobo, order:order_id(status)"),
    db.from("page_view").select("product_id"),
  ]);

  // Build per-product stats
  const revenueMap: Record<string, number> = {};
  const salesMap:   Record<string, number> = {};
  const viewsMap:   Record<string, number> = {};

  for (const row of orderItems ?? []) {
    const ord = (Array.isArray(row.order) ? row.order[0] : row.order) as { status: string } | null;
    if (ord?.status !== "paid") continue;
    const pid = row.product_id as string;
    revenueMap[pid] = (revenueMap[pid] ?? 0) + (row.price_kobo as number);
    salesMap[pid]   = (salesMap[pid]   ?? 0) + 1;
  }
  for (const v of views ?? []) {
    const pid = v.product_id as string;
    viewsMap[pid] = (viewsMap[pid] ?? 0) + 1;
  }

  const list = (products ?? []) as {
    id: string; name: string; slug: string; price_kobo: number;
    active: boolean; created_at: string;
    page_blocks: { type: string; data: Record<string, unknown> }[];
    creator_id: string | null;
    creator: { name: string; email: string } | { name: string; email: string }[] | null;
  }[];

  const totalProducts  = list.length;
  const activeProducts = list.filter((p) => p.active).length;
  const totalRevenue   = Object.values(revenueMap).reduce((s, v) => s + v, 0);
  const totalSales     = Object.values(salesMap).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        <p className="text-sm text-gray-400 mt-0.5">Every product published by creators on the platform</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Products",  value: totalProducts },
          { label: "Active / Live",   value: activeProducts },
          { label: "Total Sales",     value: totalSales.toLocaleString() },
          { label: "Platform Revenue", value: fmt(totalRevenue) },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm px-5 py-4">
            <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
            <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold text-gray-600">No products yet</p>
            <p className="text-sm mt-1">Products created by creators will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-5 py-3">Product</th>
                  <th className="text-left px-5 py-3">Creator</th>
                  <th className="text-left px-5 py-3">Price</th>
                  <th className="text-left px-5 py-3">Views</th>
                  <th className="text-left px-5 py-3">Sales</th>
                  <th className="text-left px-5 py-3">Revenue</th>
                  <th className="text-left px-5 py-3">CVR</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Added</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map((p) => {
                  const thumb   = getThumbnail(p.page_blocks ?? []);
                  const revenue = revenueMap[p.id] ?? 0;
                  const sales   = salesMap[p.id]   ?? 0;
                  const pviews  = viewsMap[p.id]   ?? 0;
                  const cvr     = pviews > 0 ? ((sales / pviews) * 100).toFixed(1) : "—";
                  const creator = Array.isArray(p.creator) ? p.creator[0] : p.creator;
                  const added   = new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      {/* Product */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
                            {thumb
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                              : <span className="text-sm font-bold text-orange-500">{p.name.charAt(0)}</span>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[180px]">{p.name}</p>
                            <p className="text-xs text-gray-400 truncate">/{p.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Creator */}
                      <td className="px-5 py-3.5">
                        {creator
                          ? <div>
                              <p className="font-medium text-gray-800">{creator.name}</p>
                              <p className="text-xs text-gray-400">{creator.email}</p>
                            </div>
                          : <span className="text-gray-300 text-xs">—</span>
                        }
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 font-semibold text-gray-900">{fmt(p.price_kobo)}</td>

                      {/* Views */}
                      <td className="px-5 py-3.5 text-gray-600">{pviews.toLocaleString()}</td>

                      {/* Sales */}
                      <td className="px-5 py-3.5 font-semibold text-gray-900">{sales.toLocaleString()}</td>

                      {/* Revenue */}
                      <td className="px-5 py-3.5 font-semibold text-orange-600">{fmt(revenue)}</td>

                      {/* CVR */}
                      <td className="px-5 py-3.5 text-gray-500">{cvr}{cvr !== "—" ? "%" : ""}</td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          p.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                        }`}>
                          {p.active ? "Live" : "Draft"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">{added}</td>

                      {/* View link */}
                      <td className="px-5 py-3.5">
                        <Link href={`/p/${p.slug}`} target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-orange-600 transition-colors">
                          <ExternalLink size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
