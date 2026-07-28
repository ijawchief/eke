"use client";

import { useState } from "react";

export function ResendEmailsButton({ orderId }: { orderId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handle = async () => {
    if (!confirm("Resend fulfillment emails for this order?")) return;
    setState("loading");
    try {
      const res = await fetch("/api/admin/resend-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) { setState("done"); setMsg("Sent"); }
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
      onClick={handle}
      disabled={state === "loading"}
      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
    >
      {state === "loading" ? "Sending…" : "Resend"}
    </button>
  );
}
