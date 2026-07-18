import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { CreatorProductForm } from "../ProductForm";

interface Props { params: Promise<{ id: string }> }

export default async function EditCreatorProductPage({ params }: Props) {
  const { id } = await params;
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/creator_id=([^;]+)/)?.[1];
  const creatorId = raw ? decodeURIComponent(raw) : null;

  const db = getServiceClient();
  const { data: product } = await db
    .from("product")
    .select("id, name, slug, price_kobo, compare_at_kobo, external_url, active, page_blocks, meta_pixel_id, meta_capi_token, tiktok_pixel_id, from_name, from_email, webhook_url")
    .eq("id", id)
    .eq("creator_id", creatorId)
    .single();

  if (!product) notFound();

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/creator/products" className="text-gray-400 hover:text-gray-600">My Products</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-semibold">{product.name}</span>
        </div>
      </div>
      <CreatorProductForm initialData={product} />
    </div>
  );
}
