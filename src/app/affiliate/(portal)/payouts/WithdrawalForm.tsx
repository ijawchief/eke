"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

interface Props {
  availableKobo: number;
}

export function WithdrawalForm({ availableKobo }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [resolving, setResolving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Resolve account name when account number + bank code are filled
  const handleResolve = async () => {
    if (accountNumber.length !== 10 || !bankCode) return;
    setResolving(true);
    try {
      const res = await fetch(`/api/creator/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`);
      if (res.ok) {
        const d = await res.json();
        setAccountName(d.account_name ?? "");
      }
    } catch { /* ignore */ } finally {
      setResolving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountKobo = Math.round(parseFloat(amount) * 100);
    if (!amountKobo || amountKobo <= 0) { setError("Enter a valid amount"); return; }
    if (amountKobo > availableKobo) { setError(`Max available: ${formatNaira(availableKobo)}`); return; }
    if (!bankName || !accountNumber || !accountName) { setError("Fill in all bank details"); return; }

    setError("");
    setLoading(true);

    const res = await fetch("/api/affiliate/withdrawal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount_kobo: amountKobo,
        bank_name: bankName,
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
      }),
    });

    if (res.ok) {
      setSuccess(true);
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
        <button onClick={() => setSuccess(false)} className="text-emerald-600 hover:underline text-sm mt-4">
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

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (₦)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g. 50000"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Bank Name</label>
        <input
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g. Access Bank"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Bank Code</label>
        <input
          type="text"
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
          onBlur={handleResolve}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g. 044"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Account Number</label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          onBlur={handleResolve}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="10-digit account number"
          maxLength={10}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Account Name</label>
        <input
          type="text"
          value={resolving ? "Resolving…" : accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Auto-filled on resolve"
          readOnly={resolving}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || availableKobo <= 0}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        {loading ? "Submitting…" : "Request Withdrawal"}
      </button>
    </form>
  );
}
