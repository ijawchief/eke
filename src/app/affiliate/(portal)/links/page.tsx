import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { CopyButton } from "./CopyButton";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://veelage.co";

export default async function AffiliateLinksPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/affiliate_id=([^;]+)/)?.[1];
  const affiliateId = raw ? decodeURIComponent(raw) : "";

  const db = getServiceClient();

  const { data: affiliate } = await db
    .from("affiliate")
    .select("username")
    .eq("id", affiliateId)
    .single();

  const username = affiliate?.username ?? "";

  const { data: products } = await db
    .from("product")
    .select("id, name, slug, price_kobo, thumbnail_url, creator:creator_id(name)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  const productIds = (products ?? []).map((p: { id: string }) => p.id);

  const [{ data: clicks }, { data: conversions }] = await Promise.all([
    productIds.length
      ? db.from("affiliate_click").select("product_id").eq("affiliate_id", affiliateId).in("product_id", productIds)
      : Promise.resolve({ data: [] }),
    productIds.length
      ? db.from("affiliate_commission").select("product_id").eq("affiliate_id", affiliateId).in("product_id", productIds)
      : Promise.resolve({ data: [] }),
  ]);

  const clickMap: Record<string, number> = {};
  for (const c of clicks ?? []) clickMap[c.product_id] = (clickMap[c.product_id] ?? 0) + 1;
  const convMap: Record<string, number> = {};
  for (const c of conversions ?? []) convMap[c.product_id] = (convMap[c.product_id] ?? 0) + 1;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Links</h1>
        <p className="text-gray-400 text-sm mt-1">Promote these products and earn commissions</p>
      </div>

      {(products ?? []).length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <p className="text-gray-400">No active products available to promote yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(products ?? []).map((p: {
          id: string; name: string; slug: string; price_kobo: number;
          thumbnail_url: string | null; creator: { name: string } | { name: string }[] | null;
        }) => {
          const creatorName = Array.isArray(p.creator) ? (p.creator[0]?.name ?? "Unknown") : (p.creator?.name ?? "Unknown");
          const refLink = `${BASE_URL}/p/${p.slug}?ref=${username}`;
          return (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
              {p.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.thumbnail_url} alt={p.name} className="w-full h-40 object-cover" />
              )}
              {!p.thumbnail_url && (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-300 text-4xl">📦</span>
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">by {creatorName}</p>
                <p className="text-emerald-600 font-semibold text-sm mt-1">{formatNaira(p.price_kobo)}</p>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span><strong className="text-gray-700">{clickMap[p.id] ?? 0}</strong> clicks</span>
                  <span><strong className="text-gray-700">{convMap[p.id] ?? 0}</strong> conversions</span>
                </div>
                <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-500 truncate flex-1 font-mono">{refLink}</p>
                  <CopyButton text={refLink} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
