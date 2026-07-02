"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Product, Block } from "@/types";
import { Shield, Lock, Check } from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PaystackPop: any;
    fbq?: (...args: unknown[]) => void;
  }
}

const DEFAULT_COLOR = "#e91e8c";

interface BumpProduct {
  id: string;
  name: string;
  price_kobo: number;
  description?: string;
}

interface Props {
  product: Product;
  bumpProduct: BumpProduct | null;
}

function fmt(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export function ProductPageClient({ product, bumpProduct }: Props) {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bumpSelected, setBumpSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = sessionStorage.getItem("eke_sid") ?? crypto.randomUUID();
    sessionStorage.setItem("eke_sid", sessionId);
    fetch("/api/track/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product.id, session_id: sessionId }),
    }).catch(() => {});
  }, [product.id]);

  const getAttribution = useCallback(() => {
    const fbp = document.cookie.match(/_fbp=([^;]+)/)?.[1];
    const fbc = document.cookie.match(/_fbc=([^;]+)/)?.[1];
    return {
      utm_source: searchParams.get("utm_source"),
      utm_medium: searchParams.get("utm_medium"),
      utm_campaign: searchParams.get("utm_campaign"),
      utm_content: searchParams.get("utm_content"),
      utm_term: searchParams.get("utm_term"),
      fbclid: searchParams.get("fbclid"),
      fbp: fbp ?? null,
      fbc: fbc ?? null,
      landing_url: window.location.href,
    };
  }, [searchParams]);

  const handleCheckout = useCallback(async () => {
    if (!email) { setError("Email is required"); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          name,
          email,
          phone,
          bump_product_id: bumpSelected ? bumpProduct?.id : undefined,
          attribution: getAttribution(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      const { access_code, order_id, event_id } = data;

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => {
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email,
          access_code,
          onSuccess: () => {
            window.location.href = `/confirmation?order_id=${order_id}&event_id=${event_id}`;
          },
          onCancel: () => { setLoading(false); },
        });
        handler.openIframe();
      };
      document.head.appendChild(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }, [email, name, phone, bumpSelected, bumpProduct, product, getAttribution]);

  const total = product.price_kobo + (bumpSelected && bumpProduct ? bumpProduct.price_kobo : 0);

  const PINK = (product.page_blocks.find((b: Block) => b.type === "theme")?.data?.color as string) ?? DEFAULT_COLOR;
  const allBlocks = product.page_blocks.filter((b: Block) => b.type !== "order_bump" && b.type !== "theme");
  const firstImage = allBlocks.find((b: Block) => b.type === "image");
  const contentBlocks = allBlocks.filter((b: Block) => b !== firstImage);

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow";

  return (
    <main className="min-h-screen" style={{ background: "#f5f5f7" }}>
      <div className="max-w-[480px] mx-auto px-4 py-10 pb-20">

        {/* Thumbnail */}
        {firstImage && (
          <div className="mb-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={firstImage.data.url as string}
              alt={(firstImage.data.alt as string) ?? product.name}
              className="w-full rounded-2xl object-cover shadow-sm"
              style={{ maxHeight: 300 }}
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">
          {product.name}
        </h1>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-2xl font-bold" style={{ color: PINK }}>
            {fmt(product.price_kobo)}
          </span>
          {product.compare_at_kobo && (
            <span className="text-base text-gray-400 line-through">
              {fmt(product.compare_at_kobo)}
            </span>
          )}
        </div>

        {/* Content blocks */}
        {contentBlocks.length > 0 && (
          <div className="mb-6">
            {contentBlocks.map((block: Block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </div>
        )}

        {/* Order bump */}
        {bumpProduct && (
          <div
            onClick={() => setBumpSelected(!bumpSelected)}
            className={`cursor-pointer rounded-2xl p-4 border-2 mb-5 transition-all ${
              bumpSelected ? "bg-pink-50 border-pink-300" : "border-dashed border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all ${
                bumpSelected ? "border-pink-500" : "border-gray-300 bg-white"
              }`}
              style={bumpSelected ? { background: PINK, borderColor: PINK } : {}}>
                {bumpSelected && <Check size={11} className="text-white" strokeWidth={3} />}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Add: {bumpProduct.name}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: PINK }}>
                  + {fmt(bumpProduct.price_kobo)}
                </p>
                {bumpProduct.description && (
                  <p className="text-xs text-gray-500 mt-1">{bumpProduct.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checkout card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-3 mb-5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={inp}
              style={{ "--tw-ring-color": PINK } as React.CSSProperties}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className={inp}
              style={{ "--tw-ring-color": PINK } as React.CSSProperties}
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number (optional)"
              className={inp}
              style={{ "--tw-ring-color": PINK } as React.CSSProperties}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-100 px-3 py-2 rounded-xl mb-4">
              {error}
            </p>
          )}

          {/* Total */}
          <div className="flex items-center justify-between mb-5 px-1">
            <span className="text-sm font-medium text-gray-500">Total</span>
            <div className="flex-1 border-b border-dashed border-gray-200 mx-3" />
            <span className="text-sm font-bold" style={{ color: PINK }}>{fmt(total)}</span>
          </div>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full text-white font-bold py-4 rounded-2xl text-base tracking-wide uppercase transition-all disabled:opacity-60 active:scale-[0.99]"
            style={{ background: PINK, boxShadow: `0 8px 24px ${PINK}33` }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </span>
            ) : (
              "Purchase Now"
            )}
          </button>

          {/* Trust */}
          <div className="flex items-center justify-center gap-5 mt-4">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Lock size={11} /> Secure checkout
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Shield size={11} /> Powered by Paystack
            </span>
          </div>

          <p className="text-xs text-center text-gray-400 mt-3">
            By purchasing you agree to our{" "}
            <a href="/terms" className="underline hover:text-gray-600">Terms</a>
            {" "}and{" "}
            <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>
          </p>
        </div>
      </div>
    </main>
  );
}
