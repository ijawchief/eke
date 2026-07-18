import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

export default async function AffiliateEarningsPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/affiliate_id=([^;]+)/)?.[1];
  const affiliateId = raw ? decodeURIComponent(raw) : "";

  const db = getServiceClient();

  const [{ data: commissions }, { data: affiliate }] = await Promise.all([
    db.from("affiliate_commission")
      .select("id, amount_kobo, status, created_at, product:product_id(name)")
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false }),
    db.from("affiliate").select("total_earned_kobo, balance_kobo").eq("id", affiliateId).single(),
  ]);

  const all = commissions ?? [];
  const pending_kobo = all.filter((c: { status: string }) => c.status === "pending").reduce((s: number, c: { amount_kobo: number }) => s + c.amount_kobo, 0);
  const approved_kobo = all.filter((c: { status: string }) => c.status === "approved").reduce((s: number, c: { amount_kobo: number }) => s + c.amount_kobo, 0);
  const paid_kobo = all.filter((c: { status: string }) => c.status === "paid").reduce((s: number, c: { amount_kobo: number }) => s + c.amount_kobo, 0);
  const total_earned = affiliate?.total_earned_kobo ?? 0;

  const stats = [
    { label: "Total Earned", value: formatNaira(total_earned), color: "text-gray-900" },
    { label: "Pending", value: formatNaira(pending_kobo), color: "text-yellow-600" },
    { label: "Approved", value: formatNaira(approved_kobo), color: "text-blue-600" },
    { label: "Paid Out", value: formatNaira(paid_kobo), color: "text-emerald-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-400 text-sm mt-1">All your commission records</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-2">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Commission History</h2>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {all.length === 0 && <p className="text-gray-400 text-sm text-center py-10">No commissions yet</p>}
          {all.map((c: { id: string; amount_kobo: number; status: string; created_at: string; product: { name: string } | { name: string }[] | null }) => {
            const productName = Array.isArray(c.product) ? (c.product[0]?.name ?? "—") : (c.product?.name ?? "—");
            return (
              <div key={c.id} className="px-4 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{productName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(c.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">{formatNaira(c.amount_kobo)}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    c.status === "paid" ? "bg-green-100 text-green-700" :
                    c.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    c.status === "approved" ? "bg-blue-100 text-blue-700" :
                    "bg-red-100 text-red-600"
                  }`}>{c.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {all.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">No commissions yet</td></tr>}
              {all.map((c: { id: string; amount_kobo: number; status: string; created_at: string; product: { name: string } | { name: string }[] | null }) => {
                const productName = Array.isArray(c.product) ? (c.product[0]?.name ?? "—") : (c.product?.name ?? "—");
                return (
                  <tr key={c.id}>
                    <td className="px-6 py-4 font-medium text-gray-800">{productName}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatNaira(c.amount_kobo)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.status === "paid" ? "bg-green-100 text-green-700" :
                        c.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        c.status === "approved" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-600"
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(c.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
