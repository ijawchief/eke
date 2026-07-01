import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { Product } from "@/types";
import { ProductPageClient } from "./ProductPageClient";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const db = getServiceClient();

  const { data: product } = await db
    .from("product")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!product) notFound();

  // Fetch optional bump product if specified in first block
  const bumpProductId = (product as Product).page_blocks?.find(
    (b) => b.type === "order_bump"
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

  return (
    <>
      {/* Meta Pixel */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${process.env.META_PIXEL_ID ?? ""}');
fbq('track', 'PageView');
fbq('track', 'ViewContent', {content_name: '${(product as Product).name.replace(/'/g, "\\'")}', currency: '${(product as Product).currency}', value: ${((product as Product).price_kobo / 100).toFixed(2)}});
          `,
        }}
      />
      <ProductPageClient product={product as Product} bumpProduct={bumpProduct} />
    </>
  );
}
