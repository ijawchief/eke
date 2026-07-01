import { notFound } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import { ProductForm } from "@/components/admin/ProductForm";
import { Block } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;
  const db = getServiceClient();

  const { data: product } = await db
    .from("product")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/admin/products" className="text-gray-400 hover:text-gray-600">My Store</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-semibold">{product.name}</span>
        </div>
      </div>
      <ProductForm
        defaultTab={tab === "tracking" ? "tracking" : tab === "email" ? "email" : "page"}
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          price_kobo: product.price_kobo,
          compare_at_kobo: product.compare_at_kobo,
          external_url: product.external_url,
          active: product.active,
          page_blocks: product.page_blocks as Block[],
          meta_pixel_id: product.meta_pixel_id ?? null,
          meta_capi_token: product.meta_capi_token ?? null,
          tiktok_pixel_id: product.tiktok_pixel_id ?? null,
          from_name: product.from_name ?? null,
          from_email: product.from_email ?? null,
          webhook_url: product.webhook_url ?? null,
        }}
      />
    </div>
  );
}
