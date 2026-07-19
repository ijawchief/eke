"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

interface UpsellProduct {
  id: string;
  name: string;
  price_kobo: number;
  description?: string;
  external_url?: string;
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const eventId = searchParams.get("event_id");
  const upsellProductId = searchParams.get("upsell_product_id");
  const upsellName = searchParams.get("upsell_name");
  const upsellPrice = searchParams.get("upsell_price");

  const [pixelFired, setPixelFired] = useState(false);
  const [upsellLoading, setUpsellLoading] = useState(false);
  const [upsellDone, setUpsellDone] = useState(false);
  const [orderValue, setOrderValue] = useState<number | null>(null);

  useEffect(() => {
    if (!orderId || pixelFired) return;

    // Fetch order value for accurate pixel event
    fetch(`/api/checkout/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: orderId }),
    });

    // Fire Pixel Purchase
    if (window.fbq && eventId) {
      window.fbq("track", "Purchase", {
        value: orderValue ?? 0,
        currency: "NGN",
        eventID: eventId,
      });
    }
    setPixelFired(true);
  }, [orderId, eventId, pixelFired, orderValue]);

  const handleUpsell = async () => {
    if (!orderId || !upsellProductId) return;
    setUpsellLoading(true);
    try {
      const res = await fetch("/api/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, upsell_product_id: upsellProductId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Fire Pixel for upsell
      if (window.fbq && data.event_id) {
        window.fbq("track", "Purchase", {
          value: upsellPrice ? parseInt(upsellPrice) / 100 : 0,
          currency: "NGN",
          eventID: data.event_id,
        });
      }
      setUpsellDone(true);
    } catch {
      alert("Upsell charge failed. Please contact support.");
    } finally {
      setUpsellLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#FDF6EE" }}>
      <div className="max-w-md w-full">

        {/* Success card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
          <div style={{ background: "#C04B1E", padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎉</div>
            <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Payment Successful!</h1>
          </div>
          <div style={{ padding: "1.75rem", textAlign: "center" }}>
            <p style={{ color: "#2C2C2C", fontSize: "1rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              Your order has been confirmed. Check your email — your access link is on its way.
            </p>
            <div style={{ background: "#FDF6EE", borderRadius: 12, padding: "0.75rem 1rem", display: "inline-block" }}>
              <p style={{ fontSize: "0.7rem", color: "#999", marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Order Reference</p>
              <code style={{ fontSize: "0.75rem", color: "#2C2C2C", fontFamily: "monospace" }}>{orderId}</code>
            </div>
          </div>
        </div>

        {/* One-click upsell */}
        {upsellProductId && upsellName && upsellPrice && !upsellDone && (
          <div style={{ background: "#fff", borderRadius: 16, border: "2px solid #C04B1E", padding: "1.5rem", marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#C04B1E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
              Special One-Time Offer
            </p>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2C2C2C", marginBottom: "0.5rem" }}>{upsellName}</h2>
            <p style={{ fontSize: "1.5rem", fontWeight: 900, color: "#C04B1E", marginBottom: "0.75rem" }}>
              Add for {formatNaira(parseInt(upsellPrice))}
            </p>
            <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1.25rem", lineHeight: 1.5 }}>
              This offer will not appear again. Charged to your card on file — no form required.
            </p>
            <button
              onClick={handleUpsell}
              disabled={upsellLoading}
              style={{ width: "100%", background: "#C04B1E", color: "#fff", fontWeight: 700, fontSize: "0.95rem", padding: "0.9rem", borderRadius: 12, border: "none", cursor: "pointer", marginBottom: "0.5rem", opacity: upsellLoading ? 0.6 : 1 }}
            >
              {upsellLoading ? "Processing…" : `YES! Add ${upsellName}`}
            </button>
            <button
              onClick={() => setUpsellDone(true)}
              style={{ width: "100%", background: "none", border: "none", color: "#aaa", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
            >
              No thanks, I don&apos;t want this
            </button>
          </div>
        )}

        {upsellDone && upsellProductId && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "1rem", marginBottom: "1.25rem", textAlign: "center" }}>
            <p style={{ color: "#15803d", fontWeight: 600, fontSize: "0.9rem" }}>✓ Upsell added! Check your email for access.</p>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#bbb" }}>
          Powered by <strong style={{ color: "#888" }}>Veelage</strong>
        </p>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
