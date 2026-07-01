import crypto from "crypto";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function sendCapiPurchase(params: {
  eventId: string;
  email: string;
  phone: string | null;
  valueKobo: number;
  currency: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  clientUserAgent?: string;
  sourceUrl?: string;
  pixelId?: string | null;
  accessToken?: string | null;
}) {
  const pixelId = params.pixelId ?? process.env.META_PIXEL_ID;
  const token = params.accessToken ?? process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return;

  const userData: Record<string, string> = {
    em: sha256(params.email),
  };
  if (params.phone) userData.ph = sha256(normalizePhone(params.phone));
  if (params.fbp) userData.fbp = params.fbp;
  if (params.fbc) userData.fbc = params.fbc;
  if (params.clientIp) userData.client_ip_address = params.clientIp;
  if (params.clientUserAgent) userData.client_user_agent = params.clientUserAgent;

  const event = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    event_source_url: params.sourceUrl,
    action_source: "website",
    user_data: userData,
    custom_data: {
      value: (params.valueKobo / 100).toFixed(2),
      currency: params.currency,
    },
  };

  try {
    await fetch(
      `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [event] }),
      }
    );
  } catch {
    // CAPI failure must not break fulfillment
    console.error("CAPI send failed");
  }
}
