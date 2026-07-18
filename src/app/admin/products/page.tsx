import { getServiceClient } from "@/lib/supabase";
import { getCurrencyFromCookie, getRates, formatCurrency } from "@/lib/currency";
import { headers } from "next/headers";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { AfricanVillageBackground } from "@/components/AfricanVillageBackground";

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

    db.from("order_item")
      .select("product_id, price_kobo, order:order_id(status)")
      .eq("order.status", "paid"),
  ]);

  const revenueMap: Record<string, number> = {};
  const salesMap: Record<string, number> = {};
  for (const row of revenueRows ?? []) {
    const ord = (Array.isArray(row.order) ? row.order[0] : row.order) as { status: string } | null;
    if (!ord || ord.status !== "paid") continue;
    const pid = row.product_id as string;
    revenueMap[pid] = (revenueMap[pid] ?? 0) + (row.price_kobo as number);
    salesMap[pid] = (salesMap[pid] ?? 0) + 1;
  }

  const list = products ?? [];

  return (
    <div className="max-w-2xl">
      {/* Village banner header */}
      <div className="relative overflow-hidden rounded-2xl mb-6 h-32 bg-[#fff7ed]">
        <AfricanVillageBackground />
        <div className="relative z-10 flex items-end h-full px-6 pb-5">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        </div>
      </div>

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
          }) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={fmt(p.price_kobo)}
              active={p.active}

              earned={fmt(revenueMap[p.id] ?? 0)}
              sales={salesMap[p.id] ?? 0}
              thumb={getThumbnail(p.page_blocks ?? [])}
            />
          ))}
        </div>
      )}

      <Link href="/admin/products/new"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #7c3aed, #ea580c)" }}>
        <Plus size={16} />
        Add Product
      </Link>
    </div>
  );
}
