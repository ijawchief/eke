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

  const p = product as Product & {
    meta_pixel_id?: string | null;
    tiktok_pixel_id?: string | null;
  };

  // Fetch optional bump product if specified in first block
  const bumpProductId = p.page_blocks?.find(
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

  const metaPixelId = p.meta_pixel_id ?? process.env.META_PIXEL_ID ?? "";
  const tiktokPixelId = p.tiktok_pixel_id ?? "";

  return (
    <>
      {/* Meta Pixel */}
      {metaPixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');
fbq('track', 'ViewContent', {content_name: '${p.name.replace(/'/g, "\\'")}', currency: '${p.currency}', value: ${(p.price_kobo / 100).toFixed(2)}});
            `,
          }}
        />
      )}

      {/* TikTok Pixel */}
      {tiktokPixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${tiktokPixelId}');
  ttq.page();
}(window, document, 'ttq');
            `,
          }}
        />
      )}

      <ProductPageClient product={p} bumpProduct={bumpProduct} />
    </>
  );
}
