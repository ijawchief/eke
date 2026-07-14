import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export default async function CreatorProductsPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/creator_id=([^;]+)/)?.[1];
  const creatorId = raw ? decodeURIComponent(raw) : null;

  const db = getServiceClient();
  const { data: products } = await db
    .from("product")
    .select("id, name, slug, price_kobo, active, thumbnail_url, created_at")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your digital products</p>
        </div>
      </div>

      {(!products || products.length === 0) ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No products yet. Contact your admin to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {p.thumbnail_url && (
                <img src={p.thumbnail_url} alt={p.name} className="w-full h-36 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-gray-900 text-sm leading-snug">{p.name}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.active ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="text-lg font-extrabold text-gray-900 mb-3">{formatNaira(p.price_kobo)}</p>
                <a
                  href={`/p/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-pink-500 hover:underline font-medium"
                >
                  <ExternalLink size={12} /> View product page
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
