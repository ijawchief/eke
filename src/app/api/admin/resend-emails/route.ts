import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sendDeliveryEmail, sendSaleNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const rawToken = cookie.match(/admin_token=([^;]+)/)?.[1];
  const adminToken = rawToken ? decodeURIComponent(rawToken) : req.cookies.get("admin_token")?.value;
  const creatorRaw = cookie.match(/creator_id=([^;]+)/)?.[1];
  const creatorId = creatorRaw ? decodeURIComponent(creatorRaw) : req.cookies.get("creator_id")?.value;

  let authorized = adminToken === process.env.ADMIN_SECRET;
  if (!authorized && creatorId) {
    const db = getServiceClient();
    const { data } = await db.from("creator").select("is_admin").eq("id", creatorId).single();
    authorized = !!data?.is_admin;
  }
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { order_id } = await req.json();
  const db = getServiceClient();

  const { data: order } = await db
    .from("order")
    .select("id, total_kobo, currency, customer_id, paystack_reference")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const { data: items } = await db.from("order_item").select("product_id").eq("order_id", order.id);
  const { data: customer } = await db.from("customer").select("email, name, phone").eq("id", order.customer_id).single();
  const productIds = (items ?? []).map((i: { product_id: string }) => i.product_id);

  const { data: products } = await db
    .from("product")
    .select("id, name, external_url, delivery_type, file_ref, creator_id")
    .in("id", productIds);

  const creatorIds = [...new Set((products ?? []).map((p: { creator_id?: string | null }) => p.creator_id).filter(Boolean))] as string[];
  const { data: creators } = creatorIds.length
    ? await db.from("creator").select("id, email").in("id", creatorIds)
    : { data: [] };
  const creatorEmailMap = Object.fromEntries((creators ?? []).map((c: { id: string; email: string }) => [c.id, c.email]));

  await Promise.allSettled([
    ...(products ?? []).map(async (p: { id: string; name: string; delivery_type: string; external_url: string | null; file_ref: string | null }) => {
      if (customer?.email) {
        await sendDeliveryEmail({
          to: customer.email,
          productName: p.name,
          accessLink: p.delivery_type === "magic_link" ? (p.external_url ?? "") : (p.file_ref ?? ""),
          orderRef: order.paystack_reference,
          buyerName: customer.name ?? null,
          amountKobo: order.total_kobo,
        });
      }
    }),
    ...(products ?? []).map(async (p: { id: string; name: string; creator_id?: string | null }) => {
      const creatorEmail = p.creator_id ? creatorEmailMap[p.creator_id] : null;
      if (creatorEmail && customer?.email) {
        await sendSaleNotification({
          to: creatorEmail,
          productName: p.name,
          buyerName: customer.name ?? null,
          buyerEmail: customer.email,
          amountKobo: order.total_kobo,
          orderRef: order.paystack_reference,
        });
      }
    }),
  ]);

  return NextResponse.json({ ok: true, message: "Emails resent" });
}
