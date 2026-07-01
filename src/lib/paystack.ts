import crypto from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

function headers() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function initializeTransaction(params: {
  email: string;
  amount: number; // kobo
  reference: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      metadata: params.metadata,
      channels: params.channels ?? ["card", "bank", "ussd", "bank_transfer"],
    }),
  });
  if (!res.ok) throw new Error(`Paystack init failed: ${await res.text()}`);
  const json = await res.json();
  return json.data as { access_code: string; authorization_url: string; reference: string };
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Paystack verify failed: ${await res.text()}`);
  const json = await res.json();
  return json.data;
}

export async function chargeAuthorization(params: {
  authorization_code: string;
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/charge_authorization`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Paystack charge_authorization failed: ${await res.text()}`);
  const json = await res.json();
  return json.data;
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}
