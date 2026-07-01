import { getServiceClient } from "@/lib/supabase";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const token = cookie.match(/admin_token=([^;]+)/)?.[1];
  if (token !== process.env.ADMIN_SECRET) redirect("/admin/login");
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

export default async function AdminDashboard() {
  await requireAdmin();
  const db = getServiceClient();

  const [{ data: orders }, { data: ledger }, { data: products }] = await Promise.all([
    db
      .from("order")
      .select("id, status, total_kobo, currency, paystack_reference, attribution, created_at, paid_at, customer:customer_id(email, phone)")
      .order("created_at", { ascending: false })
      .limit(50),
    db.from("ledger_entry").select("direction, amount_kobo, entry_type"),
    db.from("product").select("id, name, slug, price_kobo, active"),
  ]);

  const revenue = (ledger ?? [])
    .filter((e: { direction: string; entry_type: string }) => e.direction === "credit" && e.entry_type === "sale")
    .reduce((sum: number, e: { amount_kobo: number }) => sum + e.amount_kobo, 0);

  const refunds = (ledger ?? [])
    .filter((e: { direction: string; entry_type: string }) => e.direction === "debit" && e.entry_type === "refund")
    .reduce((sum: number, e: { amount_kobo: number }) => sum + e.amount_kobo, 0);

  const paidOrders = (orders ?? []).filter((o: { status: string }) => o.status === "paid");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Eke Admin</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Gross Revenue", value: formatNaira(revenue) },
            { label: "Refunds", value: formatNaira(refunds) },
            { label: "Net Revenue", value: formatNaira(revenue - refunds) },
            { label: "Paid Orders", value: paidOrders.length.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold mb-4">Products</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Slug</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(products ?? []).map((p: { id: string; name: string; slug: string; price_kobo: number; active: boolean }) => (
                <tr key={p.id}>
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="py-2 text-gray-500">/p/{p.slug}</td>
                  <td className="py-2">{formatNaira(p.price_kobo)}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Reference</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Source</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(orders ?? []).map((o: {
                  id: string;
                  paystack_reference: string;
                  status: string;
                  total_kobo: number;
                  attribution: Record<string, string | null>;
                  created_at: string;
                  // Supabase returns joined row as array
                  customer: { email: string; phone?: string }[] | { email: string; phone?: string } | null;
                }) => {
                  const customerEmail = Array.isArray(o.customer) ? o.customer[0]?.email : o.customer?.email;
                  return (
                  <tr key={o.id}>
                    <td className="py-2 font-mono text-xs">{o.paystack_reference.slice(0, 20)}…</td>
                    <td className="py-2">{customerEmail ?? "—"}</td>
                    <td className="py-2">{formatNaira(o.total_kobo)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        o.status === "paid" ? "bg-green-100 text-green-700" :
                        o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        o.status === "refunded" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500 text-xs">
                      {(o.attribution as Record<string, string | null>)?.utm_campaign ?? (o.attribution as Record<string, string | null>)?.utm_source ?? "direct"}
                    </td>
                    <td className="py-2 text-gray-500 text-xs">
                      {new Date(o.created_at).toLocaleDateString("en-NG")}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
