import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const cookieStore = await cookies();
  let creatorId = cookieStore.get("creator_id")?.value ?? null;
  let cookieSource = creatorId ? "cookies()" : "none";

  if (!creatorId) {
    const h = await headers();
    const raw = h.get("cookie")?.match(/creator_id=([^;]+)/)?.[1];
    creatorId = raw ? decodeURIComponent(raw) : null;
    if (creatorId) cookieSource = "headers()";
  }

  if (!creatorId) {
    return NextResponse.json({ error: "no creatorId found in any cookie source" });
  }

  const db = getServiceClient();

  const [{ data: creator }, { data: items, error: itemsErr }, nullItems] = await Promise.all([
    db.from("creator").select("id, name").eq("id", creatorId).single(),
    db.from("order_item")
      .select("id, price_kobo, creator_id, order:order_id(id, status, paid_at)")
      .eq("creator_id", creatorId)
      .limit(20),
    db.from("order_item")
      .select("id, creator_id, order:order_id(status)")
      .is("creator_id", null)
      .limit(5),
  ]);

  return NextResponse.json({
    cookieSource,
    creatorId,
    creator,
    orderItems: items,
    orderItemsError: itemsErr?.message,
    nullCreatorIdSample: nullItems.data,
  });
}
