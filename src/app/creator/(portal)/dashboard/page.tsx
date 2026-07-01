import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import Link from "next/link";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export default async function CreatorDashboard() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const creatorId = cookie.match(/creator_id=([^;]+)/)?.[1]!;

  const db = getServiceClient();

  const [{ data: creator }, { data: items }, { data: withdrawals }] = await Promise.all([
    db.from("creator").select("name, email").eq("id", creatorId).single(),
    db.from("order_item")
      .select("id, price_kobo, kind, created_at, product:product_id(name), order:order_id(status, created_at, customer:customer_id(email))")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })
      .limit(50),
    db.from("withdrawal_request")
      .select("id, amount_kobo, status, created_at")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const allItems = items ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paidItems = allItems.filter((i: any) => {
    const order = Array.isArray(i.order) ? i.order[0] : i.order;
    return order?.status === "paid";
  });

  const totalEarned = paidItems.reduce((s: number, i: { price_kobo: number }) => s + i.price_kobo, 0);
  const totalWithdrawn = (withdrawals ?? [])
    .filter((w: { status: string }) => w.status === "paid")
    .reduce((s: number, w: { amount_kobo: number }) => s + w.amount_kobo, 0);
  const walletBalance = totalEarned - totalWithdrawn;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, <span className="font-extrabold">{creator?.name ?? "Creator"}</span>! 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">{creator?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-gray-400 mb-2">Total Earned</p>
          <p className="text-3xl font-extrabold text-gray-900">{formatNaira(totalEarned)}</p>
          <p className="text-xs text-gray-400 mt-1">{paidItems.length} paid sales</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-gray-400 mb-2">Wallet Balance</p>
          <p className="text-3xl font-extrabold text-pink-500">{formatNaira(walletBalance)}</p>
          <p className="text-xs text-gray-400 mt-1">Available to withdraw</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-gray-400 mb-2">Total Withdrawn</p>
          <p className="text-3xl font-extrabold text-gray-900">{formatNaira(totalWithdrawn)}</p>
          <Link href="/creator/wallet" className="text-xs text-pink-500 hover:underline mt-1 inline-block">
            Withdraw funds →
          </Link>
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Sales</h2>
          <Link href="/creator/orders" className="text-sm text-pink-500 hover:underline font-medium">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="text-left px-6 py-3">Product</th>
              <th className="text-left px-6 py-3">Customer</th>
              <th className="text-left px-6 py-3">Amount</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allItems.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No sales yet</td></tr>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {allItems.slice(0, 8).map((item: any) => {
              const order = Array.isArray(item.order) ? item.order[0] : item.order;
              const customerRaw = order?.customer;
              const email = Array.isArray(customerRaw) ? customerRaw[0]?.email : customerRaw?.email;
              const status = order?.status ?? "—";
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-800">{(Array.isArray(item.product) ? item.product[0] : item.product)?.name ?? "—"}</td>
                  <td className="px-6 py-3 text-gray-500">{email ?? "—"}</td>
                  <td className="px-6 py-3 font-semibold">{formatNaira(item.price_kobo)}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      status === "paid" ? "bg-green-100 text-green-700" :
                      status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{status}</span>
                  </td>
                  <td className="px-6 py-3 text-gray-400 text-xs">
                    {new Date(item.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
