"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Product, Block } from "@/types";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PaystackPop: any;
    fbq?: (...args: unknown[]) => void;
  }
}

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

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

export function ProductPageClient({ product, bumpProduct }: Props) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bumpSelected, setBumpSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          email,
          phone,
          bump_product_id: bumpSelected ? bumpProduct?.id : undefined,
          attribution: getAttribution(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      const { access_code, order_id, event_id } = data;

      // Load Paystack inline
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
          onCancel: () => {
            setLoading(false);
          },
        });
        handler.openIframe();
      };
      document.head.appendChild(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }, [email, phone, bumpSelected, bumpProduct, product, getAttribution]);

  // Filter out internal block types from rendering
  const renderableBlocks = product.page_blocks.filter(
    (b: Block) => b.type !== "order_bump"
  );

  const total = product.price_kobo + (bumpSelected && bumpProduct ? bumpProduct.price_kobo : 0);

  return (
    <main className="min-h-screen bg-white">
      {/* Paystack public key exposed client-side is intentional */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__PS_KEY__ = "${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? ""}";`,
        }}
      />

      {/* Content blocks */}
      <div className="max-w-3xl mx-auto">
        {renderableBlocks.map((block: Block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>

      {/* Checkout form */}
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Get Instant Access</h2>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatNaira(product.price_kobo)}</div>
              {product.compare_at_kobo && (
                <div className="text-sm text-gray-400 line-through">
                  {formatNaira(product.compare_at_kobo)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08012345678"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Order Bump */}
            {bumpProduct && (
              <div
                className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                  bumpSelected ? "border-blue-500 bg-blue-50" : "border-dashed border-gray-300"
                }`}
                onClick={() => setBumpSelected(!bumpSelected)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={bumpSelected}
                    onChange={() => setBumpSelected(!bumpSelected)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-sm">
                      YES! Add {bumpProduct.name} — {formatNaira(bumpProduct.price_kobo)}
                    </p>
                    {bumpProduct.description && (
                      <p className="text-xs text-gray-600 mt-1">{bumpProduct.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-lg transition-colors"
            >
              {loading ? "Processing…" : `Pay ${formatNaira(total)} Now`}
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-4">
            Secured by Paystack · By paying you agree to our{" "}
            <a href="/terms" className="underline">Terms</a> and{" "}
            <a href="/privacy" className="underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </main>
  );
}
