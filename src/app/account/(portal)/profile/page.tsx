import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";

export default async function AccountProfilePage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/customer_id=([^;]+)/)?.[1];
  const customerId = raw ? decodeURIComponent(raw) : null;

  const db = getServiceClient();
  const { data: customer } = await db
    .from("customer")
    .select("name, email, phone, created_at")
    .eq("id", customerId)
    .single();

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Your account information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center text-white text-2xl font-bold">
          {(customer?.name ?? customer?.email ?? "?").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{customer?.name ?? "—"}</p>
          <p className="text-sm text-gray-400">{customer?.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
        {[
          { label: "Full name", value: customer?.name },
          { label: "Email", value: customer?.email },
          { label: "Phone", value: customer?.phone },
          { label: "Member since", value: customer?.created_at ? new Date(customer.created_at).toLocaleDateString("en-NG", { month: "long", year: "numeric" }) : "—" },
        ].map((f) => (
          <div key={f.label} className="flex items-center justify-between px-5 py-4">
            <p className="text-sm text-gray-400">{f.label}</p>
            <p className="text-sm font-medium text-gray-800">{f.value ?? "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
