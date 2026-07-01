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
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-lg w-full">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Check your email — your access link is on its way.
        </p>

        {/* One-click upsell */}
        {upsellProductId && upsellName && upsellPrice && !upsellDone && (
          <div className="border-2 border-yellow-400 rounded-2xl p-6 mb-8 bg-yellow-50">
            <p className="text-xs font-semibold text-yellow-700 uppercase mb-2">Special One-Time Offer</p>
            <h2 className="text-xl font-bold mb-2">{upsellName}</h2>
            {upsellPrice && (
              <p className="text-2xl font-bold text-green-600 mb-4">
                Add for {formatNaira(parseInt(upsellPrice))}
              </p>
            )}
            <p className="text-sm text-gray-600 mb-4">
              This offer will not appear again. Charged to your card on file — no form required.
            </p>
            <button
              onClick={handleUpsell}
              disabled={upsellLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {upsellLoading ? "Processing…" : `YES! Add ${upsellName}`}
            </button>
            <button
              onClick={() => setUpsellDone(true)}
              className="w-full mt-2 text-gray-400 text-sm underline"
            >
              No thanks, I don&apos;t want this
            </button>
          </div>
        )}

        {upsellDone && upsellProductId && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
            <p className="text-green-700 font-medium">Upsell added! Check your email for access.</p>
          </div>
        )}

        <p className="text-sm text-gray-400">
          Order reference: <code className="bg-gray-100 px-2 py-0.5 rounded">{orderId}</code>
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
