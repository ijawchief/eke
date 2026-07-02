"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Product, Block } from "@/types";

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
  const descBlocks = allBlocks.filter((b: Block) => !["image","hero","faq","testimonial"].includes(b.type));
  const faqBlocks = allBlocks.filter((b: Block) => b.type === "faq");
  const reviewBlocks = allBlocks.filter((b: Block) => b.type === "testimonial");

  const subheadline = (heroBlock?.data?.subheadline as string) ?? "";
  const rating = (heroBlock?.data?.rating as number) ?? 0;
  const rawHeadline = heroBlock?.data?.headline as string | undefined;
  // strip product name if it was accidentally prepended (old bug)
  const headline = rawHeadline?.startsWith(product.name)
    ? rawHeadline.slice(product.name.length).trim()
    : rawHeadline;
  const showHeadline = !!headline && headline !== product.name;

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
      <section style={{ background: "#f5f5f7" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem", display: "grid", gridTemplateColumns: imageBlock ? "1.1fr 0.9fr" : "1fr", gap: "2.5rem", alignItems: "start" }}>

          {/* Left – product image */}
          {imageBlock && (
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.13)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageBlock.data.url as string}
                alt={(imageBlock.data.alt as string) ?? product.name}
                style={{ width: "100%", display: "block", objectFit: "cover" }}
              />
            </div>
          )}

          {/* Right – sales copy */}
          <div style={{ paddingTop: "0.5rem" }}>

            {/* Stars */}
            {rating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.9rem" }}>
                <span style={{ color: "#f59e0b", fontSize: "1.2rem", letterSpacing: "-1px" }}>
                  {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600 }}>{rating}.0 / 5</span>
              </div>
            )}

            {/* Title */}
            <h1 style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)", fontWeight: 900, color: "#0f0f0f", lineHeight: 1.2, marginBottom: "0.75rem" }}>
              {product.name}
            </h1>

            {/* Subheadline */}
            {subheadline && (
              <p style={{ fontSize: "1rem", color: "#6b7280", lineHeight: 1.65, marginBottom: "1.5rem" }}>{subheadline}</p>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: "#e5e7eb", marginBottom: "1.5rem" }} />

            {/* Price */}
            <div style={{ marginBottom: "1.5rem" }}>
              {product.compare_at_kobo && (
                <p style={{ fontSize: "0.9rem", color: "#9ca3af", textDecoration: "line-through", marginBottom: "0.15rem" }}>
                  {fmt(product.compare_at_kobo)}
                </p>
              )}
              <span style={{ fontSize: "2.4rem", fontWeight: 900, color: PINK, lineHeight: 1 }}>
                {fmt(product.price_kobo)}
              </span>
            </div>

            {/* CTA */}
            <Link
              href={checkoutUrl}
              style={{ display: "block", textAlign: "center", padding: "1rem 1.5rem", borderRadius: 14, fontSize: "1.05rem", fontWeight: 800, color: "#fff", background: PINK, boxShadow: `0 6px 20px ${PINK}44`, textDecoration: "none", marginBottom: "0.75rem", letterSpacing: "0.02em" }}
            >
              Buy Now →
            </Link>
            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af" }}>
              🔒 Secure checkout · Instant access after payment
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTENT SECTION ──────────────────────────────────────── */}
      <section className="bg-white">
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 2rem" }}>

          {showHeadline && (
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", lineHeight: 1.3, marginBottom: "2rem" }}>
              {headline}
            </h2>
          )}

          {descBlocks.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              {descBlocks.map((block: Block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>
          )}

          {/* ── Offer box ── */}
          <div style={{
            marginTop: "2.5rem",
            background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)",
            borderRadius: 20,
            padding: "2.5rem 2rem",
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {product.compare_at_kobo && (
              <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginBottom: "0.25rem", textDecoration: "line-through" }}>
                {fmt(product.compare_at_kobo)}
              </p>
            )}
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {product.compare_at_kobo ? "Today only" : "Get instant access for"}
            </p>
            <p style={{ fontSize: "3rem", fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: "1.75rem" }}>
              {fmt(product.price_kobo)}
            </p>
            <Link
              href={checkoutUrl}
              style={{
                display: "block",
                background: PINK,
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.05rem",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "1.1rem 2rem",
                borderRadius: 14,
                textDecoration: "none",
                boxShadow: `0 8px 32px ${PINK}55`,
                transition: "opacity 0.15s",
                marginBottom: "0.75rem",
              }}
            >
              Yes, I Want Instant Access →
            </Link>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>
              🔒 Secure checkout · Instant delivery
            </p>
          </div>

          {/* FAQ */}
          {faqBlocks.length > 0 && (
            <div style={{ marginTop: "3rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", marginBottom: "1rem" }}>
                Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                {faqBlocks.map((block: Block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviewBlocks.length > 0 && (
            <div style={{ marginTop: "3rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", marginBottom: "1rem" }}>
                What people are saying
              </h3>
              <div className="space-y-3">
                {reviewBlocks.map((block: Block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
