import { getServiceClient } from "@/lib/supabase";

export default async function CustomersPage() {
  const db = getServiceClient();
  const { data: customers } = await db
    .from("customer")
    .select("id, email, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const all = customers ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-400 text-sm mt-1">{all.length} total</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left px-6 py-4">Email</th>
              <th className="text-left px-6 py-4">Phone</th>
              <th className="text-left px-6 py-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {all.length === 0 && (
              <tr><td colSpan={3} className="text-center py-12 text-gray-400">No customers yet</td></tr>
            )}
            {all.map((c: { id: string; email: string; phone: string | null; created_at: string }) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-800">{c.email}</td>
                <td className="px-6 py-3 text-gray-400">{c.phone ?? "—"}</td>
                <td className="px-6 py-3 text-gray-400 text-xs">
                  {new Date(c.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
