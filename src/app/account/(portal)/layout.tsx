import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { AccountShell } from "@/components/account/AccountShell";

async function getCustomer(cookie: string) {
  const raw = cookie.match(/customer_id=([^;]+)/)?.[1];
  const customerId = raw ? decodeURIComponent(raw) : null;
  if (!customerId) redirect("/account/login");
  const db = getServiceClient();
  const { data } = await db.from("customer").select("id, name, email").eq("id", customerId).single();
  if (!data) redirect("/account/login");
  return data;
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const customer = await getCustomer(cookie);
  const initials = (customer.name ?? customer.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <AccountShell customer={{ name: customer.name, email: customer.email, initials }}>
      {children}
    </AccountShell>
  );
}
