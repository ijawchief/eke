import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { AffiliateShell } from "@/components/affiliate/AffiliateShell";

async function getAffiliate(cookie: string) {
  const raw = cookie.match(/affiliate_id=([^;]+)/)?.[1];
  const affiliateId = raw ? decodeURIComponent(raw) : null;
  if (!affiliateId) redirect("/affiliate/login");
  const db = getServiceClient();
  const { data } = await db
    .from("affiliate")
    .select("id, name, email, username, balance_kobo, total_earned_kobo")
    .eq("id", affiliateId)
    .single();
  if (!data) redirect("/affiliate/login");
  return data;
}

export default async function AffiliatePortalLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const affiliate = await getAffiliate(cookie);
  const initials = (affiliate.name ?? "A").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AffiliateShell affiliate={{ name: affiliate.name, email: affiliate.email, initials }}>
      {children}
    </AffiliateShell>
  );
}
