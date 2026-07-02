"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { formatCurrency, Currency } from "@/lib/currency";

interface Payout {
  id: string;
  amount_kobo: number;
  status: string;
  bank_name: string;
  bank_code?: string;
  account_number: string;
  account_name: string;
  phone?: string;
  note?: string;
  created_at: string;
  creator: { name: string | null; email: string } | { name: string | null; email: string }[] | null;
}

const STATUS_TABS = ["all", "pending", "approved", "paid", "rejected"];

export function PayoutsClient({
  payouts,
  totalPending,
  totalPaid,
  currency,
  rates,
}: {
  payouts: Payout[];
  totalPending: number;
  totalPaid: number;
  currency: Currency;
  rates: Record<string, number>;
}) {
  const fmt = (kobo: number) => formatCurrency(kobo, currency, rates);
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  const filtered = tab === "all" ? payouts : payouts.filter((p) => p.status === tab);

  const updateStatus = async (id: string, status: string) => {
    setLoading(id);
    await fetch("/api/admin/payouts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status, note: note[id] ?? null }),
    });
    setLoading(null);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
        <p className="text-gray-400 text-sm mt-1">Creator withdrawal requests</p>
      </div>

      {/* Summary cards — always 3 columns */}
      <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-3">
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-yellow-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Pending</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-yellow-700">{fmt(totalPending)}</p>
            <p className="text-xs text-yellow-500 mt-1">{payouts.filter(p => p.status === "pending").length} requests awaiting action</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Paid Out</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-green-700">{fmt(totalPaid)}</p>
            <p className="text-xs text-green-500 mt-1">{payouts.filter(p => p.status === "paid").length} completed</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Requests</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{payouts.length}</p>
            <p className="text-xs text-gray-400 mt-1">all time</p>
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-4">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
              tab === t ? "bg-pink-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3">Creator</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Bank Details</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Requested</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No {tab !== "all" ? tab : ""} payouts</td></tr>
            )}
            {filtered.map((p) => {
              const creator = Array.isArray(p.creator) ? p.creator[0] : p.creator;
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{creator?.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{creator?.email}</p>
                    {p.phone && <p className="text-xs text-gray-400">{p.phone}</p>}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{fmt(p.amount_kobo)}</td>
                  <td className="px-6 py-4 text-xs">
                    <p className="font-medium text-gray-700">{p.account_name}</p>
                    <p className="text-gray-400">{p.bank_name}</p>
                    <p className="text-gray-400">{p.account_number}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      p.status === "paid" ? "bg-green-100 text-green-700" :
                      p.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      p.status === "approved" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-600"
                    }`}>{p.status}</span>
                    {p.note && <p className="text-xs text-gray-400 mt-1 max-w-[120px] truncate">{p.note}</p>}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    {p.status === "pending" && (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="Note (optional)"
                          value={note[p.id] ?? ""}
                          onChange={(e) => setNote((n) => ({ ...n, [p.id]: e.target.value }))}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-pink-300"
                        />
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateStatus(p.id, "approved")}
                            disabled={loading === p.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            {loading === p.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(p.id, "rejected")}
                            disabled={loading === p.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            <XCircle size={11} /> Reject
                          </button>
                        </div>
                      </div>
                    )}
                    {p.status === "approved" && (
                      <button
                        onClick={() => updateStatus(p.id, "paid")}
                        disabled={loading === p.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        {loading === p.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
