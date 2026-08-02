"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types";
import { Shield, Lock, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PaystackPop: any;
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
  themeColor: string;
  thumbnail?: string;
}

function fmt(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export function CheckoutPageClient({ product, bumpProduct, themeColor, thumbnail }: Props) {
  const searchParams = useSearchParams();
  const PINK = themeColor;

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bumpSelected, setBumpSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = product.price_kobo + (bumpSelected && bumpProduct ? bumpProduct.price_kobo : 0);

  useEffect(() => {
    const sessionId = sessionStorage.getItem("eke_sid") ?? crypto.randomUUID();
    sessionStorage.setItem("eke_sid", sessionId);
  }, []);

  const getAttribution = useCallback(() => {
    const fbp = document.cookie.match(/_fbp=([^;]+)/)?.[1];
    const fbc = document.cookie.match(/_fbc=([^;]+)/)?.[1];
    const affiliateRefRaw = document.cookie.match(/affiliate_ref=([^;]+)/)?.[1];
    const affiliateRef = affiliateRefRaw ? decodeURIComponent(affiliateRefRaw) : null;
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
      affiliate_ref: affiliateRef,
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
          name: customerName,
          email,
          phone,
          bump_product_id: bumpSelected ? bumpProduct?.id : undefined,
          attribution: getAttribution(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      const { access_code, order_id, event_id } = data;
      if (!access_code) throw new Error("Payment could not be initialised — please try again");

      const openPaystack = () => {
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
          access_code,
          callback: () => {
            const url = `/confirmation?order_id=${order_id}&event_id=${event_id}`;
            try { window.location.replace(url); } catch { window.location.href = url; }
          },
          onClose: () => { setLoading(false); },
        });
        handler.openIframe();
      };

      if (window.PaystackPop) {
        openPaystack();
      } else {
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.onload = openPaystack;
        document.head.appendChild(script);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }, [email, customerName, phone, bumpSelected, bumpProduct, product, getAttribution]);

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow";

  return (
    <main className="min-h-screen" style={{ background: "#f5f5f7" }}>
      <div className="max-w-lg mx-auto px-4 py-10 pb-20">

        {/* Back link */}
        <Link href={`/p/${product.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to product
        </Link>

        {/* Product summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 flex items-center gap-4">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center text-2xl font-bold"
              style={{ background: "linear-gradient(135deg, #f3f0ff, #fff7ed)", color: PINK }}>
              {product.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base truncate">{product.name}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-extrabold" style={{ color: PINK }}>{fmt(product.price_kobo)}</span>
              {product.compare_at_kobo && (
                <span className="text-sm text-gray-400 line-through">{fmt(product.compare_at_kobo)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Order bump */}
        {bumpProduct && (
          <div
            onClick={() => setBumpSelected(!bumpSelected)}
            className={`cursor-pointer rounded-2xl p-4 border-2 mb-5 transition-all ${
              bumpSelected ? "border-opacity-100" : "border-dashed border-gray-200 bg-white"
            }`}
            style={bumpSelected ? { background: `${PINK}10`, borderColor: PINK, borderStyle: "solid" } : {}}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all"
                style={bumpSelected ? { background: PINK, borderColor: PINK } : { borderColor: "#d1d5db", background: "white" }}>
                {bumpSelected && <Check size={11} className="text-white" strokeWidth={3} />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: PINK }}>
                  Special add-on offer
                </p>
                <p className="text-sm font-bold text-gray-800">Add: {bumpProduct.name}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: PINK }}>
                  + {fmt(bumpProduct.price_kobo)}
                </p>
                {bumpProduct.description && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{bumpProduct.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checkout form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Your details</h2>

          <div className="space-y-3 mb-5">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
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
            <span className="text-base font-extrabold" style={{ color: PINK }}>{fmt(total)}</span>
          </div>

          {/* Pay button */}
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
              "Complete Purchase"
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
      {/* Powered by Eke */}
      <div style={{ textAlign: "center", paddingTop: "1rem", paddingBottom: "2rem" }}>
        <a href="/" style={{ fontSize: "0.75rem", color: "#9ca3af", textDecoration: "none" }}>
          Powered by <strong style={{ color: "#6b7280" }}>Veelage</strong>
        </a>
      </div>
    </main>
  );
}
