import { Resend } from "resend";

let _resend: Resend | null = null;
export function getResend() {
  if (!_resend) _resend = new Resend(process.env.EMAIL_API_KEY);
  return _resend;
}

const FROM = "Veelage <no-reply@eke.ng>"; // update domain once verified

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
