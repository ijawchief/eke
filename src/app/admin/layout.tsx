import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { CurrencySwitcher } from "@/components/admin/CurrencySwitcher";
import { getCurrencyFromCookie } from "@/lib/currency";

async function requireAdmin(cookie: string) {
  const raw = cookie.match(/admin_token=([^;]+)/)?.[1];
  const token = raw ? decodeURIComponent(raw) : undefined;
  if (token !== process.env.ADMIN_SECRET) redirect("/login");
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
