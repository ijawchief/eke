import { Resend } from "resend";

let _resend: Resend | null = null;
export function getResend() {
  if (!_resend) _resend = new Resend(process.env.EMAIL_API_KEY);
  return _resend;
}

const FROM = "Veelage <no-reply@veelage.co>";

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
    subject: `You just made a sale — ${params.productName}`,
    html: `
      <div style="background:#FDF6EE;min-height:100vh;padding:40px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <div style="background:#C04B1E;padding:32px 32px 28px;">
            <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.7);letter-spacing:0.05em;text-transform:uppercase;">Veelage</p>
            <h1 style="margin:0;font-size:26px;font-weight:700;color:#fff;line-height:1.2;">Another one! 🚀</h1>
          </div>

          <div style="padding:32px;">
            <p style="margin:0 0 24px;font-size:16px;color:#2C2C2C;line-height:1.6;">
              Someone out there just decided your knowledge was worth paying for.
            </p>

            <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
              <tr style="border-bottom:1px solid #F0E8DF;">
                <td style="padding:12px 0;font-size:13px;color:#999;width:110px;">Product</td>
                <td style="padding:12px 0;font-size:14px;font-weight:600;color:#2C2C2C;">${params.productName}</td>
              </tr>
              <tr style="border-bottom:1px solid #F0E8DF;">
                <td style="padding:12px 0;font-size:13px;color:#999;">Amount</td>
                <td style="padding:12px 0;font-size:16px;font-weight:700;color:#C04B1E;">${amount}</td>
              </tr>
              <tr style="border-bottom:1px solid #F0E8DF;">
                <td style="padding:12px 0;font-size:13px;color:#999;">Customer</td>
                <td style="padding:12px 0;font-size:14px;color:#2C2C2C;">${params.buyerName ?? "—"}</td>
              </tr>
              <tr style="border-bottom:1px solid #F0E8DF;">
                <td style="padding:12px 0;font-size:13px;color:#999;">Email</td>
                <td style="padding:12px 0;font-size:14px;color:#2C2C2C;">${params.buyerEmail}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;font-size:13px;color:#999;">Reference</td>
                <td style="padding:12px 0;font-size:12px;color:#bbb;font-family:monospace;">${params.orderRef}</td>
              </tr>
            </table>

            <p style="margin:0 0 28px;font-size:16px;color:#2C2C2C;">Keep stacking wins. 💪</p>

            <a href="https://veelage.co/creator/dashboard"
              style="display:inline-block;background:#C04B1E;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;">
              View Dashboard →
            </a>
          </div>

          <div style="padding:20px 32px;border-top:1px solid #F0E8DF;background:#FDF6EE;">
            <p style="margin:0;font-size:13px;color:#bbb;text-align:center;">Team Veelage · <a href="https://veelage.co" style="color:#C04B1E;text-decoration:none;">veelage.co</a></p>
          </div>

        </div>
      </div>
    `,
  });
}

export async function sendDeliveryEmail(params: {
  to: string;
  productName: string;
  accessLink: string;
  orderRef: string;
  buyerName?: string | null;
}) {
  await getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `You're in! Your access to ${params.productName}`,
    html: `
      <div style="background:#FDF6EE;min-height:100vh;padding:40px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <div style="background:#C04B1E;padding:32px 32px 28px;">
            <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.7);letter-spacing:0.05em;text-transform:uppercase;">Veelage</p>
            <h1 style="margin:0;font-size:26px;font-weight:700;color:#fff;line-height:1.2;">You're in! 🎉</h1>
          </div>

          <div style="padding:32px;">
            <p style="margin:0 0 8px;font-size:16px;color:#2C2C2C;line-height:1.6;">
              Hey${params.buyerName ? ` ${params.buyerName}` : ""},
            </p>
            <p style="margin:0 0 24px;font-size:16px;color:#2C2C2C;line-height:1.6;">
              Thank you for your purchase. Your access to <strong>${params.productName}</strong> is ready — click the button below to get started.
            </p>

            <div style="text-align:center;margin:32px 0;">
              <a href="${params.accessLink}"
                style="display:inline-block;background:#C04B1E;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 32px;border-radius:12px;letter-spacing:0.01em;">
                Access Your Product Here →
              </a>
            </div>

            <p style="margin:24px 0 8px;font-size:13px;color:#999;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin:0 0 24px;font-size:12px;color:#bbb;word-break:break-all;">${params.accessLink}</p>

            <div style="border-top:1px solid #F0E8DF;padding-top:20px;">
              <p style="margin:0;font-size:13px;color:#bbb;">Order reference: <span style="font-family:monospace;">${params.orderRef}</span></p>
              <p style="margin:6px 0 0;font-size:13px;color:#bbb;">If you have any issues, reply to this email and we'll sort it out.</p>
            </div>
          </div>

          <div style="padding:20px 32px;border-top:1px solid #F0E8DF;background:#FDF6EE;">
            <p style="margin:0;font-size:13px;color:#bbb;text-align:center;">Team Veelage · <a href="https://veelage.co" style="color:#C04B1E;text-decoration:none;">veelage.co</a></p>
          </div>

        </div>
      </div>
    `,
  });
}
