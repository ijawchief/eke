import { headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { getCurrencyFromCookie, getRates } from "@/lib/currency";
import { PayoutsClient } from "./PayoutsClient";

export default async function PayoutsPage() {
  const h = await headers();
  const currency = getCurrencyFromCookie(h.get("cookie") ?? "");
  const rates = await getRates();
  const db = getServiceClient();
  const { data: payouts } = await db
    .from("withdrawal_request")
    .select("*, creator:creator_id(name, email)")
    .order("created_at", { ascending: false });

  const totalPending = (payouts ?? [])
    .filter((p: { status: string }) => p.status === "pending")
    .reduce((s: number, p: { amount_kobo: number }) => s + p.amount_kobo, 0);

  const totalPaid = (payouts ?? [])
    .filter((p: { status: string }) => p.status === "paid")
    .reduce((s: number, p: { amount_kobo: number }) => s + p.amount_kobo, 0);

  return <PayoutsClient payouts={payouts ?? []} totalPending={totalPending} totalPaid={totalPaid} currency={currency} rates={rates} />;
}
