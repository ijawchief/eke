import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { CreatorProductForm } from "../ProductForm";

interface Props { params: Promise<{ id: string }> }

function getDescription(blocks: { type: string; data: Record<string, unknown> }[]): string {
  const text = blocks?.find((b) => b.type === "text");
  return text ? String(text.data.text ?? "") : "";
}

export default async function EditCreatorProductPage({ params }: Props) {
  const { id } = await params;
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/creator_id=([^;]+)/)?.[1];
  const creatorId = raw ? decodeURIComponent(raw) : null;

  const db = getServiceClient();
  const { data: product } = await db
    .from("product")
    .select("id, name, slug, price_kobo, active, thumbnail_url, page_blocks")
    .eq("id", id)
    .eq("creator_id", creatorId)
    .single();

  if (!product) notFound();

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/creator/products" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4">
          <ChevronLeft size={15} /> Products
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <a href={`/p/${product.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-orange-600 hover:underline mt-1">
              <ExternalLink size={11} /> View product page
            </a>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
        <CreatorProductForm
          mode="edit"
          productId={product.id}
          initial={{
            name: product.name,
            slug: product.slug,
            price_kobo: product.price_kobo,
            description: getDescription(product.page_blocks ?? []),
            thumbnail_url: product.thumbnail_url ?? "",
            active: product.active,
          }}
        />
      </div>
    </div>
  );
}
