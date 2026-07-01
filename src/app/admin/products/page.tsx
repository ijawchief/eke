import { getServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { Plus, ExternalLink, Pencil, Radio, Mail } from "lucide-react";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export default async function ProductsPage() {
  const db = getServiceClient();
  const { data: products } = await db
    .from("product")
    .select("id, name, slug, price_kobo, active, created_at, meta_pixel_id, tiktok_pixel_id, webhook_url")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-400 text-sm mt-1">{(products ?? []).length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {(products ?? []).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="mb-3 text-4xl">📦</p>
            <p className="font-medium mb-1">No products yet</p>
            <Link href="/admin/products/new" className="text-pink-500 hover:underline text-sm">
              Create your first product
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Slug</th>
                <th className="text-left px-6 py-4">Price</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Tracking</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(products ?? []).map((p: {
                id: string; name: string; slug: string; price_kobo: number; active: boolean;
                meta_pixel_id?: string | null; tiktok_pixel_id?: string | null; webhook_url?: string | null;
              }) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-800">{p.name}</td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">/p/{p.slug}</td>
                  <td className="px-6 py-4 font-semibold">{formatNaira(p.price_kobo)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {p.meta_pixel_id && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">Meta</span>
                      )}
                      {p.tiktok_pixel_id && (
                        <span className="px-2 py-0.5 bg-black text-white text-xs font-semibold rounded-full">TikTok</span>
                      )}
                      {p.webhook_url && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full">Hook</span>
                      )}
                      {!p.meta_pixel_id && !p.tiktok_pixel_id && !p.webhook_url && (
                        <span className="text-gray-300 text-xs">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-gray-400 hover:text-pink-500 transition-colors"
                        title="Edit product"
                      >
                        <Pencil size={15} />
                      </Link>
                      <Link
                        href={`/admin/products/${p.id}?tab=tracking`}
                        className={`transition-colors ${p.meta_pixel_id || p.tiktok_pixel_id ? "text-blue-500 hover:text-blue-700" : "text-gray-300 hover:text-blue-400"}`}
                        title="Pixel & CAPI settings"
                      >
                        <Radio size={15} />
                      </Link>
                      <Link
                        href={`/admin/products/${p.id}?tab=email`}
                        className={`transition-colors ${p.webhook_url ? "text-purple-500 hover:text-purple-700" : "text-gray-300 hover:text-purple-400"}`}
                        title="Email & webhook settings"
                      >
                        <Mail size={15} />
                      </Link>
                      <a
                        href={`/p/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="View product page"
                      >
                        <ExternalLink size={15} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
