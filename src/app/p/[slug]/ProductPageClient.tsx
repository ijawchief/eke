"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Product, Block } from "@/types";

import Link from "next/link";

const DEFAULT_COLOR = "#ea580c";

// country code → ISO currency code
const COUNTRY_CURRENCY: Record<string, string> = {
  NG: "NGN", GH: "GHS", KE: "KES", ZA: "ZAR", UG: "UGX", TZ: "TZS", RW: "RWF",
  ET: "ETB", EG: "EGP", MA: "MAD", CI: "XOF", SN: "XOF", CM: "XAF",
  US: "USD", CA: "CAD", GB: "GBP", AU: "AUD", NZ: "NZD",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR", PT: "EUR", AT: "EUR", IE: "EUR",
  JP: "JPY", CN: "CNY", IN: "INR", SG: "SGD", HK: "HKD", MY: "MYR", TH: "THB", PH: "PHP", ID: "IDR",
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD",
  BR: "BRL", MX: "MXN", AR: "ARS", CO: "COP", CL: "CLP",
  CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN",
  TR: "TRY", IL: "ILS", PK: "PKR", BD: "BDT",
};

function heroGradient(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dark1 = `rgb(${Math.round(r * 0.10)}, ${Math.round(g * 0.10)}, ${Math.round(b * 0.10)})`;
  const dark2 = `rgb(${Math.round(r * 0.18)}, ${Math.round(g * 0.18)}, ${Math.round(b * 0.18)})`;
  return `linear-gradient(135deg, ${dark1} 0%, ${dark2} 100%)`;
}

interface Props {
  product: Product;
}

function fmt(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export function ProductPageClient({ product }: Props) {
  const searchParams = useSearchParams();
  const [geoPrice, setGeoPrice] = useState<string | null>(null);
  const [geoCompare, setGeoCompare] = useState<string | null>(null);

  const PINK = (product.page_blocks.find((b: Block) => b.type === "theme")?.data?.color as string) ?? DEFAULT_COLOR;
  const allBlocks = product.page_blocks.filter((b: Block) => b.type !== "order_bump" && b.type !== "theme");
  const heroBlock = allBlocks.find((b: Block) => b.type === "hero");
  const imageBlock = allBlocks.find((b: Block) => b.type === "image");
  const descBlocks = allBlocks.filter((b: Block) => !["image","hero","faq","testimonial"].includes(b.type));
  const faqBlocks = allBlocks.filter((b: Block) => b.type === "faq");
  const reviewBlocks = allBlocks.filter((b: Block) => b.type === "testimonial");

  const subheadline = (heroBlock?.data?.subheadline as string) ?? "";
  const rating = (heroBlock?.data?.rating as number) ?? 0;
  const author = (heroBlock?.data?.author as string) ?? "";
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
    const ref = searchParams.get("ref");
    if (ref) {
      document.cookie = `affiliate_ref=${encodeURIComponent(ref)}; path=/; max-age=86400`;
      fetch("/api/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, affiliate_username: ref }),
      }).catch(() => {});
    }
  }, [product.id, searchParams]);

  useEffect(() => {
    const sessionId = sessionStorage.getItem("eke_sid") ?? crypto.randomUUID();
    sessionStorage.setItem("eke_sid", sessionId);
    fetch("/api/track/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product.id, session_id: sessionId }),
    }).catch(() => {});
  }, [product.id]);

  useEffect(() => {
    async function detectGeoCurrency() {
      try {
        const geoRes = await fetch("https://api.country.is/");
        const { country } = await geoRes.json();
        const currency = COUNTRY_CURRENCY[country] ?? "USD";
        if (currency === "NGN") return; // already shown in NGN
        const ratesRes = await fetch("https://open.er-api.com/v6/latest/USD");
        const { rates } = await ratesRes.json();
        if (!rates) return;
        const ngnRate = rates.NGN ?? 1650;
        const convert = (kobo: number) => {
          const usd = (kobo / 100) / ngnRate;
          return usd * (rates[currency] ?? 1);
        };
        const fmtGeo = (amount: number) =>
          new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
        setGeoPrice(fmtGeo(convert(product.price_kobo)));
        if (product.compare_at_kobo) setGeoCompare(fmtGeo(convert(product.compare_at_kobo)));
      } catch { /* fall back to NGN */ }
    }
    detectGeoCurrency();
  }, [product.price_kobo, product.compare_at_kobo]);

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section style={{ background: heroGradient(PINK) }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem 2.5rem" }}>

          {/* Desktop: side-by-side | Mobile: stacked */}
          <div className="product-hero-grid">

            {/* Thumbnail */}
            {imageBlock && (
              <div className="product-hero-image" style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.13)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageBlock.data.url as string}
                  alt={(imageBlock.data.alt as string) ?? product.name}
                  style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
                />
              </div>
            )}

            {/* Sales copy */}
            <div style={{ paddingTop: "0.25rem" }}>

              {/* Stars */}
              {rating > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.9rem" }}>
                  <span style={{ color: "#f59e0b", fontSize: "1.2rem", letterSpacing: "-1px" }}>
                    {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{rating}.0 / 5</span>
                </div>
              )}

              {/* Title */}
              <h1 style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)", fontWeight: 900, color: "#ffffff", lineHeight: 1.2, marginBottom: author ? "0.5rem" : "0.75rem" }}>
                {product.name}
              </h1>
              {author && (
                <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", marginBottom: "0.9rem", fontWeight: 500 }}>
                  by {author}
                </p>
              )}

              {/* Subheadline */}
              {subheadline && (
                <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, marginBottom: "1.5rem" }}>{subheadline}</p>
              )}

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: "1.5rem" }} />

              {/* Price */}
              <div style={{ marginBottom: "1.5rem" }}>
                {product.compare_at_kobo && (
                  <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.35)", textDecoration: "line-through", marginBottom: "0.15rem" }}>
                    {geoCompare ?? fmt(product.compare_at_kobo)}
                  </p>
                )}
                <span style={{ fontSize: "2.4rem", fontWeight: 900, color: PINK, lineHeight: 1 }}>
                  {geoPrice ?? fmt(product.price_kobo)}
                </span>
              </div>

              {/* CTA */}
              <Link
                href={checkoutUrl}
                style={{ display: "block", textAlign: "center", padding: "1rem 1.5rem", borderRadius: 14, fontSize: "1.05rem", fontWeight: 800, color: "#fff", background: PINK, boxShadow: `0 6px 20px ${PINK}44`, textDecoration: "none", marginBottom: "0.75rem", letterSpacing: "0.02em" }}
              >
                Buy Now →
              </Link>
              <p style={{ textAlign: "center", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
                🔒 Secure checkout · Instant access after payment
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .product-hero-grid {
          display: grid;
          grid-template-columns: ${imageBlock ? "360px 1fr" : "1fr"};
          gap: 2.5rem;
          align-items: start;
        }
        .product-hero-image {
          height: 360px;
        }
        @media (max-width: 640px) {
          .product-hero-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .product-hero-image {
            height: 260px;
          }
          main p, main li, main span, main td, main a, main label {
            font-size: 14px !important;
          }
        }
      `}</style>

      {/* ── CONTENT SECTION ──────────────────────────────────────── */}
      <section className="bg-white">
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.25rem" }}>

          {showHeadline && (
            <h2 style={{ fontSize: "clamp(1.35rem, 4vw, 1.75rem)", fontWeight: 800, color: "#111827", lineHeight: 1.3, marginBottom: "1.5rem" }}>
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
            background: heroGradient(PINK),
            borderRadius: 20,
            padding: "2rem 1.5rem",
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {product.compare_at_kobo && (
              <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginBottom: "0.25rem", textDecoration: "line-through" }}>
                {geoCompare ?? fmt(product.compare_at_kobo)}
              </p>
            )}
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {product.compare_at_kobo ? "Today only" : "Get instant access for"}
            </p>
            <p style={{ fontSize: "3rem", fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: "1.75rem" }}>
              {geoPrice ?? fmt(product.price_kobo)}
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
      {/* Powered by Eke */}
      <div style={{ textAlign: "center", padding: "1.5rem 1rem", borderTop: "1px solid #f0f0f0" }}>
        <a href="/" style={{ fontSize: "0.75rem", color: "#9ca3af", textDecoration: "none" }}>
          Powered by <strong style={{ color: "#6b7280" }}>Veelage</strong>
        </a>
      </div>
    </main>
  );
}
