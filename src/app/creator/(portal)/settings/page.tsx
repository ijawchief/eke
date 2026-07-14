import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";

export default async function CreatorSettingsPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/creator_id=([^;]+)/)?.[1];
  const creatorId = raw ? decodeURIComponent(raw) : null;

  const db = getServiceClient();
  const { data: creator } = await db
    .from("creator")
    .select("name, email, username, phone, bank_name, account_number, account_name")
    .eq("id", creatorId)
    .single();

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Your account details</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
        {[
          { label: "Full name", value: creator?.name },
          { label: "Email", value: creator?.email },
          { label: "Username", value: creator?.username },
          { label: "Phone", value: creator?.phone },
          { label: "Bank", value: creator?.bank_name },
          { label: "Account number", value: creator?.account_number },
          { label: "Account name", value: creator?.account_name },
        ].map((f) => (
          <div key={f.label} className="flex items-center justify-between px-6 py-4">
            <p className="text-sm text-gray-400">{f.label}</p>
            <p className="text-sm font-medium text-gray-800">{f.value ?? "—"}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        To update your details, contact your admin.
      </p>
    </div>
  );
}
