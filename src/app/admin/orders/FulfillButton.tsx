"use client";

import { useState } from "react";

export function FulfillButton({ orderId }: { orderId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleFulfill = async () => {
    if (!confirm("Verify this payment with Paystack and send fulfillment emails?")) return;
    setState("loading");
    try {
      const res = await fetch("/api/admin/fulfill-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) { setState("done"); setMsg(data.message ?? "Done"); }
      else { setState("error"); setMsg(data.error ?? "Failed"); }
    } catch {
      setState("error");
      setMsg("Network error");
    }
  };

  if (state === "done") return <span className="text-xs text-green-600 font-semibold">✓ {msg}</span>;
  if (state === "error") return <span className="text-xs text-red-500 font-semibold">✗ {msg}</span>;

  return (
    <button
      onClick={handleFulfill}
      disabled={state === "loading"}
      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50"
    >
      {state === "loading" ? "Verifying…" : "Fulfill"}
    </button>
  );
}
