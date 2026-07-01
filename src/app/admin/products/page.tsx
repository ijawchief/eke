import { getServiceClient } from "@/lib/supabase";
import { getCurrencyFromCookie, getRates, formatCurrency } from "@/lib/currency";
import { headers } from "next/headers";
import Link from "next/link";
import { Plus, ExternalLink, Pencil, GripVertical, Download, MoreHorizontal, TrendingUp } from "lucide-react";

const PINK = "#e91e8c";

function getThumbnail(blocks: { type: string; data: Record<string, unknown> }[]): string | null {
  const img = blocks?.find((b) => b.type === "image");
  return img ? (img.data.url as string) ?? null : null;
}

export default async function ProductsPage() {
  const db = getServiceClient();
  const h = await headers();
  const currency = getCurrencyFromCookie(h.get("cookie") ?? "");
  const rates = await getRates();
  const fmt = (kobo: number) => formatCurrency(kobo, currency, rates);

  const [{ data: products }, { data: revenueRows }] = await Promise.all([
    db.from("product")
      .select("id, name, slug, price_kobo, active, created_at, page_blocks, external_url")
      .order("created_at", { ascending: false }),

    // sum revenue per product from paid orders
    db.from("order_item")
      .select("product_id, price_kobo, order:order_id(status)")
      .eq("order.status", "paid"),
  ]);

  // aggregate revenue by product_id
  const revenueMap: Record<string, number> = {};
  const salesMap: Record<string, number> = {};
  for (const row of revenueRows ?? []) {
    // supabase returns the joined row under "order" key
    const ord = (Array.isArray(row.order) ? row.order[0] : row.order) as { status: string } | null;
    if (!ord || ord.status !== "paid") continue;
    const pid = row.product_id as string;
    revenueMap[pid] = (revenueMap[pid] ?? 0) + (row.price_kobo as number);
    salesMap[pid] = (salesMap[pid] ?? 0) + 1;
  }

  const list = products ?? [];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>

      {/* Product cards */}
      {list.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📦</p>
          <p className="font-semibold text-gray-700 mb-1">No products yet</p>
          <p className="text-sm">Add your first digital product to start selling.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {list.map((p: {
            id: string; name: string; slug: string; price_kobo: number;
            active: boolean; page_blocks: { type: string; data: Record<string, unknown> }[];
            external_url: string | null;
          }) => {
            const thumb = getThumbnail(p.page_blocks ?? []);
            const hasFile = p.external_url !== null;
            const earned = revenueMap[p.id] ?? 0;
            const sales = salesMap[p.id] ?? 0;

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 px-5 py-5 hover:shadow-md transition-shadow group">
                <GripVertical size={16} className="text-gray-300 shrink-0 cursor-grab" />

                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                  {thumb
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #f3f0ff, #fff0f8)" }}>
                        <span className="text-2xl font-bold" style={{ color: PINK }}>
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-gray-900 text-base leading-snug">{p.name}</p>
                    {hasFile && <Download size={13} className="text-gray-400 shrink-0" />}
                    {!p.active && (
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Draft</span>
                    )}
                  </div>
                  <p className="text-base font-bold mb-2" style={{ color: PINK }}>{fmt(p.price_kobo)}</p>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-green-500" />
                    <span className="text-xs font-semibold text-green-600">{fmt(earned)} earned</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{sales} {sales === 1 ? "sale" : "sales"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/products/${p.id}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    title="Edit">
                    <Pencil size={14} />
                  </Link>
                  <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    title="View page">
                    <ExternalLink size={14} />
                  </a>
                </div>

                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product */}
      <Link href="/admin/products/new"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #7c3aed, #e91e8c)" }}>
        <Plus size={16} />
        Add Product
      </Link>
    </div>
  );
}
