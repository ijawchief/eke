import { Resend } from "resend";

let _resend: Resend | null = null;
export function getResend() {
  if (!_resend) _resend = new Resend(process.env.EMAIL_API_KEY);
  return _resend;
}

const FROM = "Veelage <no-reply@eke.ng>"; // update domain once verified

export async function sendSaleNotification(params: {
  to: string;
  productName: string;
  buyerName: string | null;
  buyerEmail: string;
  amountKobo: number;
  orderRef: string;
}) {
  const amount = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(params.amountKobo / 100);
  await getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `💰 New sale: ${params.productName} — ${amount}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#C04B1E;margin-bottom:4px;">You just made a sale! 🎉</h2>
        <p style="color:#555;margin-top:0;">Here's a summary of the order:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Product</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${params.productName}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Amount</td><td style="padding:8px 0;font-weight:600;font-size:14px;color:#C04B1E;">${amount}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Buyer</td><td style="padding:8px 0;font-size:14px;">${params.buyerName ? `${params.buyerName} (${params.buyerEmail})` : params.buyerEmail}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px;">Reference</td><td style="padding:8px 0;font-size:13px;color:#aaa;">${params.orderRef}</td></tr>
        </table>
        <p style="font-size:13px;color:#aaa;">View your dashboard at <a href="https://veelage.co/creator/dashboard" style="color:#C04B1E;">veelage.co/creator/dashboard</a></p>
      </div>
    `,
  });
}

export async function sendDeliveryEmail(params: {
  to: string;
  productName: string;
  accessLink: string;
  orderRef: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `Your access to ${params.productName}`,
    html: `
      <h2>You're in! 🎉</h2>
      <p>Thank you for your purchase. Here is your access link:</p>
      <p><a href="${params.accessLink}" style="font-size:18px;font-weight:bold;">${params.accessLink}</a></p>
      <p>Order reference: <code>${params.orderRef}</code></p>
      <p>If you have any issues, reply to this email.</p>
    `,
  });
}
