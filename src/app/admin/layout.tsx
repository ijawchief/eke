import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { CurrencySwitcher } from "@/components/admin/CurrencySwitcher";
import { getCurrencyFromCookie } from "@/lib/currency";
import { getServiceClient } from "@/lib/supabase";

async function requireAdmin(cookie: string) {
  // Check env-based master admin token
  const raw = cookie.match(/admin_token=([^;]+)/)?.[1];
  const token = raw ? decodeURIComponent(raw) : undefined;
  if (token === process.env.ADMIN_SECRET) return;

  // Fallback: check DB admin via creator_id cookie
  const creatorRaw = cookie.match(/creator_id=([^;]+)/)?.[1];
  const creatorId = creatorRaw ? decodeURIComponent(creatorRaw) : null;
  if (creatorId) {
    const db = getServiceClient();
    const { data } = await db.from("creator").select("is_admin").eq("id", creatorId).single();
    if (data?.is_admin) return;
  }

  redirect("/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  await requireAdmin(cookie);
  const currency = getCurrencyFromCookie(cookie);

  return (
    <AdminShell currencySlot={<CurrencySwitcher current={currency} />}>
      {children}
    </AdminShell>
  );
}
