"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Product, Block } from "@/types";
import { ArrowDown } from "lucide-react";
import Link from "next/link";

const DEFAULT_COLOR = "#e91e8c";

interface Props {
  product: Product;
}

function fmt(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export function ProductPageClient({ product }: Props) {
  const searchParams = useSearchParams();

  const PINK = (product.page_blocks.find((b: Block) => b.type === "theme")?.data?.color as string) ?? DEFAULT_COLOR;
  const allBlocks = product.page_blocks.filter((b: Block) => b.type !== "order_bump" && b.type !== "theme");
  const heroBlock = allBlocks.find((b: Block) => b.type === "hero");
  const imageBlock = allBlocks.find((b: Block) => b.type === "image");
  const contentBlocks = allBlocks.filter((b: Block) => b.type !== "image" && b.type !== "hero");

  const subheadline = (heroBlock?.data?.subheadline as string) ?? "";
  const headline = heroBlock?.data?.headline as string | undefined;
  const showHeadline = headline && headline !== product.name;

  // Preserve UTM params on checkout link
  const checkoutUrl = (() => {
    const base = `/checkout/${product.slug}`;
    const params = new URLSearchParams();
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid"].forEach((k) => {
      const v = searchParams.get(k);
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  })();

  useEffect(() => {
    const sessionId = sessionStorage.getItem("eke_sid") ?? crypto.randomUUID();
    sessionStorage.setItem("eke_sid", sessionId);
    fetch("/api/track/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product.id, session_id: sessionId }),
    }).catch(() => {});
  }, [product.id]);

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row gap-8 md:gap-12 items-center">

          {/* Left – product image */}
          {imageBlock && (
            <div className="w-full md:w-[55%] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageBlock.data.url as string}
                alt={(imageBlock.data.alt as string) ?? product.name}
                className="w-full rounded-2xl object-cover shadow-md"
                style={{ maxHeight: 480 }}
              />
            </div>
          )}

          {/* Right – title, price, CTA */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>
            {subheadline && (
              <p className="text-base text-gray-500 mb-5 leading-relaxed">{subheadline}</p>
            )}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-extrabold" style={{ color: PINK }}>
                {fmt(product.price_kobo)}
              </span>
              {product.compare_at_kobo && (
                <span className="text-lg text-gray-400 line-through">{fmt(product.compare_at_kobo)}</span>
              )}
            </div>

            <Link
              href={checkoutUrl}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: PINK, boxShadow: `0 8px 24px ${PINK}33` }}
            >
              Get it now
              <ArrowDown size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ──────────────────────────────────────────────── */}
      <div className="border-t border-gray-100" />

      {/* ── CONTENT SECTION ──────────────────────────────────────── */}
      <section style={{ background: "#f5f5f7" }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">

            {showHeadline && (
              <h2 className="text-2xl font-extrabold text-gray-900 leading-snug mb-6">
                {headline}
              </h2>
            )}

            {contentBlocks.length > 0 && (
              <div className="mb-8 space-y-1">
                {contentBlocks.map((block: Block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-2xl font-extrabold" style={{ color: PINK }}>
                {fmt(product.price_kobo)}
              </span>
              {product.compare_at_kobo && (
                <span className="text-base text-gray-400 line-through">{fmt(product.compare_at_kobo)}</span>
              )}
            </div>

            <Link
              href={checkoutUrl}
              className="block w-full text-center py-4 rounded-2xl text-base font-bold text-white tracking-wide uppercase transition-all hover:opacity-90 active:scale-[0.99]"
              style={{ background: PINK, boxShadow: `0 8px 24px ${PINK}33` }}
            >
              Get Instant Access
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
