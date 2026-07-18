"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

interface Payout {
  id: string;
  affiliate_id: string;
  amount_kobo: number;
  status: string;
  bank_name: string | null;
  bank_code: string | null;
  account_number: string | null;
  account_name: string | null;
  note: string | null;
  created_at: string;
}

interface Affiliate {
  id: string;
  name: string;
  email: string;
  username: string;
  balance_kobo: number;
  total_earned_kobo: number;
  created_at: string;
  payouts: Payout[];
  pending_kobo: number;
  paid_kobo: number;
}

export function AffiliatesClient({ affiliates }: { affiliates: Affiliate[] }) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const allPayouts = affiliates.flatMap((a) => a.payouts.map((p) => ({ ...p, affiliateName: a.name, affiliateEmail: a.email })));
  const pendingPayouts = allPayouts.filter((p) => p.status === "pending");

  const updatePayout = async (id: string, status: string, note?: string) => {
    setUpdating(id);
    await fetch("/api/admin/affiliates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, note }),
    });
    setUpdating(null);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>
        <p className="text-gray-400 text-sm mt-1">Manage affiliate accounts and payout requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total Affiliates</p>
          <p className="text-2xl font-extrabold text-gray-900">{affiliates.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Pending Payouts</p>
          <p className="text-2xl font-extrabold text-yellow-600">{pendingPayouts.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total Pending ₦</p>
          <p className="text-2xl font-extrabold text-gray-900">{formatNaira(pendingPayouts.reduce((s, p) => s + p.amount_kobo, 0))}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total Earned</p>
          <p className="text-2xl font-extrabold text-emerald-600">{formatNaira(affiliates.reduce((s, a) => s + a.total_earned_kobo, 0))}</p>
        </div>
      </div>

      {/* Pending payouts */}
      {pendingPayouts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Pending Payout Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Affiliate</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Bank</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingPayouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{p.affiliateName}</p>
                      <p className="text-xs text-gray-400">{p.affiliateEmail}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatNaira(p.amount_kobo)}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{p.account_name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{p.bank_name ?? "—"} · {p.account_number ?? "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updatePayout(p.id, "paid")}
                          disabled={updating === p.id}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          {updating === p.id ? "…" : "Mark Paid"}
                        </button>
                        <button
                          onClick={() => updatePayout(p.id, "rejected", "Rejected by admin")}
                          disabled={updating === p.id}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All affiliates */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">All Affiliates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Username</th>
                <th className="px-6 py-3 text-left">Total Earned</th>
                <th className="px-6 py-3 text-left">Balance</th>
                <th className="px-6 py-3 text-left">Joined</th>
                <th className="px-6 py-3 text-left">Payouts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {affiliates.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No affiliates yet</td></tr>
              )}
              {affiliates.map((a) => (
                <>
                  <tr key={a.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">@{a.username}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{formatNaira(a.total_earned_kobo)}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatNaira(a.balance_kobo)}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(a.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-xs">{a.payouts.length} requests</span>
                    </td>
                  </tr>
                  {expanded === a.id && a.payouts.length > 0 && (
                    <tr key={`${a.id}-payouts`}>
                      <td colSpan={6} className="px-6 pb-4">
                        <div className="bg-gray-50 rounded-xl overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-400 uppercase tracking-wide">
                                <th className="px-4 py-2 text-left">Amount</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Bank</th>
                                <th className="px-4 py-2 text-left">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {a.payouts.map((p) => (
                                <tr key={p.id}>
                                  <td className="px-4 py-2 font-semibold">{formatNaira(p.amount_kobo)}</td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      p.status === "paid" ? "bg-green-100 text-green-700" :
                                      p.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                      "bg-red-100 text-red-600"
                                    }`}>{p.status}</span>
                                  </td>
                                  <td className="px-4 py-2 text-gray-500">{p.bank_name ?? "—"} · {p.account_number ?? "—"}</td>
                                  <td className="px-4 py-2 text-gray-400">{new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
