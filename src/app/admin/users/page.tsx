import { getServiceClient } from "@/lib/supabase";
import { CreatorsClient } from "./CreatorsClient";

export default async function CreatorsPage() {
  const db = getServiceClient();

  const { data: creators } = await db
    .from("creator")
    .select("id, name, email, username, onboarding_done, email_verified, created_at, is_admin")
    .eq("is_admin", false)
    .order("created_at", { ascending: false });

  if (!creators?.length) return <CreatorsClient creators={[]} />;

  const ids = creators.map((c: { id: string }) => c.id);

  const [{ data: products }, { data: items }] = await Promise.all([
    db.from("product").select("id, creator_id, active").in("creator_id", ids),
    db.from("order_item")
      .select("creator_id, price_kobo, order:order_id(status)")
      .in("creator_id", ids),
  ]);

  const enriched = creators.map((c: {
    id: string; name: string | null; email: string | null; username: string | null;
    onboarding_done: boolean | null; email_verified: boolean | null; created_at: string; is_admin: boolean | null;
  }) => {
    const myProducts = (products ?? []).filter((p: { creator_id: string }) => p.creator_id === c.id);
    const published = myProducts.filter((p: { active: boolean }) => p.active).length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paidItems = (items ?? []).filter((i: any) => {
      if (i.creator_id !== c.id) return false;
      const o = Array.isArray(i.order) ? i.order[0] : i.order;
      return o?.status === "paid";
    });
    const revenue = paidItems.reduce((s: number, i: { price_kobo: number }) => s + i.price_kobo, 0);
    const units = paidItems.length;
    return { ...c, published, revenue, units };
  });

  return <CreatorsClient creators={enriched} />;
}
