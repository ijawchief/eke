
import { getServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { AfricanVillageBackground } from "@/components/AfricanVillageBackground";
import { CreatorProductCard } from "./CreatorProductCard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";



function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export default async function CreatorProductsPage() {
  const cookieStore = await cookies();
const creatorId = cookieStore.get("creator_id")?.value;

if (!creatorId) {
  redirect("/login");
}
 

  const db = getServiceClient();
  const [{ data: products }, { data: orderItems }] = await Promise.all([
    db.from("product")
      .select("id, name, slug, price_kobo, active, thumbnail_url, created_at")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false }),
    db.from("order_item")
      .select("product_id, price_kobo, order:order_id(status)")
      .eq("creator_id", creatorId),
  ]);

  const revenueMap: Record<string, number> = {};
  const salesMap: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of orderItems ?? []) {
    const ord = (Array.isArray(row.order) ? row.order[0] : row.order) as { status: string } | null;
    if (!ord || ord.status !== "paid") continue;
    const pid = row.product_id as string;
    revenueMap[pid] = (revenueMap[pid] ?? 0) + (row.price_kobo as number);
    salesMap[pid] = (salesMap[pid] ?? 0) + 1;
  }

  return (
    <div>
      {/* Village banner header */}
      <div className="relative overflow-hidden rounded-2xl mb-6 h-32 bg-[#fff7ed]">
        <AfricanVillageBackground />
        <div className="relative z-10 flex items-end justify-between h-full px-5 sm:px-6 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 text-sm">Manage your digital products</p>
          </div>
          <Link href="/creator/products/new"
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={15} /> New Product
          </Link>
        </div>
      </div>

      {(!products || products.length === 0) ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-semibold text-gray-700 mb-1">No products yet</p>
          <p className="text-gray-400 text-sm mb-5">Create your first digital product to start selling.</p>
          <Link href="/creator/products/new"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <Plus size={15} /> Create Product
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <CreatorProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={formatNaira(p.price_kobo)}
              active={p.active}
              earned={formatNaira(revenueMap[p.id] ?? 0)}
              sales={salesMap[p.id] ?? 0}
              thumb={p.thumbnail_url ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
