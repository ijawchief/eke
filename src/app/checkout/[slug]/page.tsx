import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { Product, Block } from "@/types";
import { CheckoutPageClient } from "./CheckoutPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const db = getServiceClient();

  const { data: product } = await db
    .from("product")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!product) notFound();

  const p = product as Product;

  const bumpProductId = p.page_blocks?.find(
    (b: Block) => b.type === "order_bump"
  )?.data?.product_id as string | undefined;

  let bumpProduct = null;
  if (bumpProductId) {
    const { data } = await db
      .from("product")
      .select("id, name, price_kobo, page_blocks")
      .eq("id", bumpProductId)
      .single();
    bumpProduct = data;
  }

  const themeColor = (p.page_blocks?.find((b: Block) => b.type === "theme")?.data?.color as string) ?? "#ea580c";
  const thumbnail = p.page_blocks?.find((b: Block) => b.type === "image")?.data?.url as string | undefined;

  return (
    <CheckoutPageClient
      product={p}
      bumpProduct={bumpProduct}
      themeColor={themeColor}
      thumbnail={thumbnail}
    />
  );
}
