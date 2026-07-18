import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { WithdrawalForm } from "./WithdrawalForm";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export default async function AffiliatePayoutsPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/affiliate_id=([^;]+)/)?.[1];
  const affiliateId = raw ? decodeURIComponent(raw) : "";

  const db = getServiceClient();

  const [{ data: affiliate }, { data: payouts }] = await Promise.all([
    db.from("affiliate").select("balance_kobo, total_earned_kobo").eq("id", affiliateId).single(),
    db.from("affiliate_payout")
      .select("id, amount_kobo, status, bank_name, account_number, account_name, created_at")
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false }),
  ]);

  const balance = affiliate?.balance_kobo ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
        <p className="text-gray-400 text-sm mt-1">Withdraw your affiliate earnings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0f2a1f] rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-white/70 mb-2">Available Balance</p>
          <p className="text-3xl font-extrabold text-white">{formatNaira(balance)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-gray-400 mb-2">Total Earned</p>
          <p className="text-3xl font-extrabold text-gray-900">{formatNaira(affiliate?.total_earned_kobo ?? 0)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-gray-400 mb-2">Pending Payouts</p>
          <p className="text-3xl font-extrabold text-yellow-500">
            {formatNaira((payouts ?? []).filter((w: { status: string }) => w.status === "pending").reduce((s: number, w: { amount_kobo: number }) => s + w.amount_kobo, 0))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Request Withdrawal</h2>
          <WithdrawalForm availableKobo={balance} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Withdrawal History</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(payouts ?? []).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-10">No withdrawals yet</p>
            )}
            {(payouts ?? []).map((w: {
              id: string; amount_kobo: number; status: string;
              bank_name: string | null; account_number: string | null;
              account_name: string | null; created_at: string;
            }) => (
              <div key={w.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{formatNaira(w.amount_kobo)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{w.bank_name ?? "—"} · {w.account_number ?? "—"}</p>
                  <p className="text-xs text-gray-400">{new Date(w.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  w.status === "paid" ? "bg-green-100 text-green-700" :
                  w.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  w.status === "approved" ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-600"
                }`}>{w.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
