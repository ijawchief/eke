import { getServiceClient } from "@/lib/supabase";
import { AffiliatesClient } from "./AffiliatesClient";

export default async function AdminAffiliatesPage() {
  const db = getServiceClient();

  const { data: affiliates } = await db
    .from("affiliate")
    .select("id, name, email, username, balance_kobo, total_earned_kobo, created_at")
    .order("created_at", { ascending: false });

  const affiliateIds = (affiliates ?? []).map((a: { id: string }) => a.id);

  const [{ data: payouts }, { data: commissions }] = await Promise.all([
    affiliateIds.length
      ? db.from("affiliate_payout")
          .select("id, affiliate_id, amount_kobo, status, bank_name, bank_code, account_number, account_name, note, created_at")
          .in("affiliate_id", affiliateIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    affiliateIds.length
      ? db.from("affiliate_commission")
          .select("affiliate_id, amount_kobo, status")
          .in("affiliate_id", affiliateIds)
      : Promise.resolve({ data: [] }),
  ]);

  const enriched = (affiliates ?? []).map((a: {
    id: string; name: string; email: string; username: string;
    balance_kobo: number; total_earned_kobo: number; created_at: string;
  }) => {
    const myPayouts = (payouts ?? []).filter((p: { affiliate_id: string }) => p.affiliate_id === a.id);
    const myCommissions = (commissions ?? []).filter((c: { affiliate_id: string }) => c.affiliate_id === a.id);
    const pending_kobo = myCommissions.filter((c: { status: string }) => c.status === "pending").reduce((s: number, c: { amount_kobo: number }) => s + c.amount_kobo, 0);
    const paid_kobo = myCommissions.filter((c: { status: string }) => c.status === "paid").reduce((s: number, c: { amount_kobo: number }) => s + c.amount_kobo, 0);
    return { ...a, payouts: myPayouts, pending_kobo, paid_kobo };
  });

  return <AffiliatesClient affiliates={enriched} />;
}
