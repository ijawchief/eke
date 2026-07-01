import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { WithdrawalForm } from "./WithdrawalForm";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export default async function WalletPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const creatorId = cookie.match(/creator_id=([^;]+)/)?.[1]!;

  const db = getServiceClient();

  const [{ data: creator }, { data: items }, { data: withdrawals }] = await Promise.all([
    db.from("creator")
      .select("bank_name, account_number, account_name")
      .eq("id", creatorId)
      .single(),
    db.from("order_item")
      .select("price_kobo, order:order_id(status)")
      .eq("creator_id", creatorId),
    db.from("withdrawal_request")
      .select("id, amount_kobo, status, bank_name, account_number, account_name, created_at")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paidItems = (items ?? []).filter((i: any) => {
    const order = Array.isArray(i.order) ? i.order[0] : i.order;
    return order?.status === "paid";
  });
  const totalEarned = paidItems.reduce((s: number, i: { price_kobo: number }) => s + i.price_kobo, 0);
  const totalWithdrawn = (withdrawals ?? [])
    .filter((w: { status: string }) => w.status === "paid")
    .reduce((s: number, w: { amount_kobo: number }) => s + w.amount_kobo, 0);
  const pendingWithdrawals = (withdrawals ?? [])
    .filter((w: { status: string }) => w.status === "pending")
    .reduce((s: number, w: { amount_kobo: number }) => s + w.amount_kobo, 0);
  const available = totalEarned - totalWithdrawn - pendingWithdrawals;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your earnings and withdrawals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-gray-400 mb-2">Total Earned</p>
          <p className="text-3xl font-extrabold text-gray-900">{formatNaira(totalEarned)}</p>
        </div>
        <div className="bg-pink-500 rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-white/70 mb-2">Available Balance</p>
          <p className="text-3xl font-extrabold text-white">{formatNaira(available)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-gray-400 mb-2">Pending Withdrawals</p>
          <p className="text-3xl font-extrabold text-yellow-500">{formatNaira(pendingWithdrawals)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Request Withdrawal</h2>
          <WithdrawalForm
            creatorId={creatorId}
            availableKobo={available}
            bankName={creator?.bank_name ?? ""}
            accountNumber={creator?.account_number ?? ""}
            accountName={creator?.account_name ?? ""}
          />
        </div>

        {/* Withdrawal history */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Withdrawal History</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(withdrawals ?? []).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-10">No withdrawals yet</p>
            )}
            {(withdrawals ?? []).map((w: {
              id: string; amount_kobo: number; status: string;
              bank_name: string | null; account_number: string | null; created_at: string;
            }) => (
              <div key={w.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{formatNaira(w.amount_kobo)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {w.bank_name ?? "—"} · {w.account_number ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(w.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
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
