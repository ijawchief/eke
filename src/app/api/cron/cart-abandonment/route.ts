import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getResend } from "@/lib/email";

// Protect with a shared secret set in env (CRON_SECRET)
function authorized(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  return secret === process.env.CRON_SECRET;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getServiceClient();

  // Find pending orders older than 60 min that haven't had abandonment email sent
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: orders } = await db
    .from("order")
    .select(`
      id, paystack_reference, total_kobo, currency, created_at,
      customer:customer_id(email, name, phone),
      items:order_item(product_id)
    `)
    .eq("status", "pending")
    .lt("created_at", cutoff)
    .is("abandonment_sent_at", null)
    .limit(50);

  if (!orders?.length) return NextResponse.json({ processed: 0 });

  const resend = getResend();
  let sent = 0;

  for (const order of orders) {
    const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer;
    if (!customer?.email) continue;

    const productIds = (order.items ?? []).map((i: { product_id: string }) => i.product_id);
    if (!productIds.length) continue;

    const { data: products } = await db
      .from("product")
      .select("id, name, slug, from_name, from_email, webhook_url")
      .in("id", productIds);

    const primaryProduct = (products ?? [])[0] as {
      id: string; name: string; slug: string;
      from_name: string | null; from_email: string | null; webhook_url: string | null;
    } | undefined;

    if (!primaryProduct) continue;

    const fromName = primaryProduct.from_name ?? "Eke Store";
    const fromEmail = primaryProduct.from_email ?? "no-reply@eke.ng";
    const productUrl = `${process.env.APP_URL ?? "https://eke.ng"}/p/${primaryProduct.slug}`;

    // Send cart abandonment email
    try {
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: customer.email,
        subject: `You left something behind — ${primaryProduct.name}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
            <h2 style="font-size:22px;margin-bottom:8px;">Hey${customer.name ? ` ${customer.name.split(" ")[0]}` : ""}! 👋</h2>
            <p style="color:#555;font-size:16px;">You were so close to getting <strong>${primaryProduct.name}</strong>.</p>
            <p style="color:#555;font-size:16px;">Your spot is still reserved — complete your order now before it's gone.</p>
            <a href="${productUrl}"
               style="display:inline-block;margin:20px 0;background:#e91e8c;color:#fff;font-weight:bold;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;">
              Complete My Order →
            </a>
            <p style="color:#999;font-size:13px;">If you have any questions, just reply to this email.</p>
          </div>
        `,
      });
    } catch {
      // Don't block other orders if one email fails
      continue;
    }

    // Fire webhook if configured
    if (primaryProduct.webhook_url) {
      fetch(primaryProduct.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "cart_abandoned",
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          product_id: primaryProduct.id,
          product_name: primaryProduct.name,
          amount_kobo: order.total_kobo,
          currency: order.currency,
          order_ref: order.paystack_reference,
        }),
      }).catch(() => {});
    }

    // Mark abandonment email sent
    await db
      .from("order")
      .update({ abandonment_sent_at: new Date().toISOString() })
      .eq("id", order.id);

    sent++;
  }

  return NextResponse.json({ processed: sent });
}

// Allow GET for easy cron service calls (some services use GET)
export async function GET(req: NextRequest) {
  return POST(req);
}
