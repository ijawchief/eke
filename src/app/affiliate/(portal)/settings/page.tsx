import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function AffiliateSettingsPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const raw = cookie.match(/affiliate_id=([^;]+)/)?.[1];
  const affiliateId = raw ? decodeURIComponent(raw) : "";

  const db = getServiceClient();
  const { data: affiliate } = await db
    .from("affiliate")
    .select("name, email, username")
    .eq("id", affiliateId)
    .single();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Full Name</p>
              <p className="text-gray-900 font-medium">{affiliate?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Email</p>
              <p className="text-gray-900 font-medium">{affiliate?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Username</p>
              <p className="text-gray-900 font-medium">@{affiliate?.username ?? "—"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Change Password</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
