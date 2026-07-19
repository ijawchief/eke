import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sendSaleNotification, getResend } from "@/lib/email";

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

  const emailLog: Record<string, unknown>[] = [];

  const results = await Promise.allSettled([
    ...(products ?? []).map(async (p: { id: string; name: string; delivery_type: string; external_url: string | null; file_ref: string | null }) => {
      const accessLink = p.delivery_type === "magic_link" ? (p.external_url ?? "") : (p.file_ref ?? "");
      emailLog.push({ type: "delivery", to: customer?.email, product: p.name, accessLink, delivery_type: p.delivery_type });
      if (customer?.email) {
        const r = await getResend().emails.send({
          from: "Veelage <no-reply@veelage.co>",
          to: customer.email,
          subject: `Your order is confirmed — ${p.name}`,
          html: `<p>Access your product: <a href="${accessLink}">${accessLink}</a></p>`,
        });
        emailLog.push({ type: "delivery_result", id: r.data?.id, error: r.error });
      }
    }),
    ...(products ?? []).map(async (p: { id: string; name: string; creator_id?: string | null }) => {
      const creatorEmail = p.creator_id ? creatorEmailMap[p.creator_id] : null;
      emailLog.push({ type: "sale_notify", to: creatorEmail, product: p.name });
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

  const errors = results.filter(r => r.status === "rejected").map(r => (r as PromiseRejectedResult).reason?.message);
  return NextResponse.json({ ok: true, message: "Emails resent", emailLog, errors });
}
