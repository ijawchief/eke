"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

interface Props {
  creatorId: string;
  availableKobo: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export function WithdrawalForm({ creatorId, availableKobo, bankName, accountNumber, accountName }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountKobo = Math.round(parseFloat(amount) * 100);
    if (!amountKobo || amountKobo <= 0) { setError("Enter a valid amount"); return; }
    if (amountKobo > availableKobo) { setError(`Max available: ${formatNaira(availableKobo)}`); return; }

    setError("");
    setLoading(true);

    const res = await fetch("/api/creator/withdrawal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creator_id: creatorId,
        amount_kobo: amountKobo,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setAmount("");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to submit");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />
        <p className="font-semibold text-gray-800">Withdrawal requested!</p>
        <p className="text-gray-400 text-sm mt-1">You&apos;ll be notified once it&apos;s processed.</p>
        <button onClick={() => setSuccess(false)} className="text-pink-500 hover:underline text-sm mt-4">
          Make another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
        Available: <span className="font-bold text-gray-900">{formatNaira(availableKobo)}</span>
      </div>

      {/* Saved bank details */}
      <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 text-sm">
        <p className="text-xs font-semibold text-pink-400 uppercase tracking-wide mb-1">Payout account</p>
        <p className="font-semibold text-gray-800">{accountName}</p>
        <p className="text-gray-500 text-xs">{bankName} · {accountNumber}</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (₦)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          placeholder="e.g. 50000"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || availableKobo <= 0}
        className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        {loading ? "Submitting…" : "Request Withdrawal"}
      </button>
    </form>
  );
}
