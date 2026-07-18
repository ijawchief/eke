import { getServiceClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

const TOOLS = [
  {
    name: "Zapier",
    logo: "⚡",
    description: "Connect to 7,000+ apps — Mailchimp, Slack, Google Sheets, ActiveCampaign, and more. No code needed.",
    steps: [
      'Go to zapier.com → Create → New Zap',
      'Choose "Webhooks by Zapier" as the trigger → Event: Catch Hook',
      "Copy the webhook URL Zapier gives you",
      "Paste it into your product's Email & Webhooks tab → Webhook URL",
      "Set up your action: add subscriber to Mailchimp, send Slack alert, log to Sheets, etc.",
    ],
    color: "bg-orange-50 border-orange-100",
    badge: "bg-orange-100 text-orange-700",
  },
  {
    name: "Make (formerly Integromat)",
    logo: "🔧",
    description: "Visual automation builder with deep filtering, branching logic, and 1,000+ app connectors.",
    steps: [
      "Go to make.com → Create a new scenario",
      'Add a "Webhooks" module → Custom webhook → Add',
      "Copy the webhook URL",
      "Paste it into your product's Email & Webhooks tab",
      "Add modules: ConvertKit, Klaviyo, ActiveCampaign, email, etc.",
    ],
    color: "bg-purple-50 border-purple-100",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    name: "Klaviyo",
    logo: "📧",
    description: "Purpose-built email & SMS for ecommerce. Best for segmented sequences and post-purchase nurture.",
    steps: [
      "In Klaviyo: go to Integrations → Custom Source → Create API Key",
      "Go to zapier.com or make.com and connect Klaviyo using the API key",
      'Create a Zap: Webhook trigger → Klaviyo: "Add to list" or "Track Event"',
      "Use the Zapier/Make webhook URL in your product's Email & Webhooks tab",
      "Map the fields: email → email, name → first_name, product_name → custom property",
    ],
    color: "bg-green-50 border-green-100",
    badge: "bg-green-100 text-green-700",
  },
  {
    name: "ConvertKit",
    logo: "✉️",
    description: "Creator-focused email platform. Great for tagging subscribers by product and triggering automations.",
    steps: [
      "In ConvertKit: Settings → Advanced → API Key (copy it)",
      "In Zapier/Make: Webhook trigger → ConvertKit: Add Subscriber",
      "Set the form/tag to your product's sequence",
      "Paste the Zapier webhook URL into your product's Email & Webhooks tab",
    ],
    color: "bg-red-50 border-red-100",
    badge: "bg-red-100 text-red-700",
  },
  {
    name: "Mailchimp",
    logo: "🐵",
    description: "The most popular email marketing tool. Add buyers to an audience and trigger automated journeys.",
    steps: [
      "In Mailchimp: Account → Extras → API Keys → Create",
      "In Zapier: Webhook trigger → Mailchimp: Add/Update Subscriber",
      "Pick your audience and map fields (email, first_name, etc.)",
      "Copy the Zapier webhook URL into your product's Email & Webhooks tab",
    ],
    color: "bg-yellow-50 border-yellow-100",
    badge: "bg-yellow-100 text-yellow-700",
  },
  {
    name: "ActiveCampaign",
    logo: "🎯",
    description: "CRM + email automation. Add contacts, tag them by product, and trigger automation sequences.",
    steps: [
      "In ActiveCampaign: Settings → Developer → API Access → copy URL and Key",
      "In Zapier/Make: Webhook trigger → ActiveCampaign: Add Contact",
      "Map fields and select the list/tag",
      "Paste the Zapier/Make webhook URL into your product",
    ],
    color: "bg-blue-50 border-blue-100",
    badge: "bg-blue-100 text-blue-700",
  },
];

const PAYLOAD_EXAMPLE = `{
  "event": "purchase",          // or "cart_abandoned"
  "email": "buyer@email.com",
  "name": "Buyer Name",
  "phone": "08012345678",
  "product_id": "uuid",
  "product_name": "My Course",
  "amount_kobo": 1999900,
  "currency": "NGN",
  "order_ref": "eke_abc123"
}`;

export default async function CreatorIntegrationsPage() {
  const cookieStore = await cookies();
  const creatorId = cookieStore.get("creator_id")?.value ?? null;

  const db = getServiceClient();
  const { data: products } = await db
    .from("product")
    .select("id, name, slug, meta_pixel_id, tiktok_pixel_id, webhook_url")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  const configured = (products ?? []).filter((p: {
    meta_pixel_id?: string | null; tiktok_pixel_id?: string | null; webhook_url?: string | null;
  }) => p.meta_pixel_id || p.tiktok_pixel_id || p.webhook_url);

  const unconfigured = (products ?? []).filter((p: {
    meta_pixel_id?: string | null; tiktok_pixel_id?: string | null; webhook_url?: string | null;
  }) => !p.meta_pixel_id && !p.tiktok_pixel_id && !p.webhook_url);

  return (
    <div className="max-w-4xl w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-400 mt-1">Connect your products to email marketing tools, ad pixels, and automation platforms.</p>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-1">How it works</h2>
        <p className="text-sm text-gray-500 mb-5">
          Each product has its own tracking and webhook settings. When a buyer purchases or abandons a checkout,
          Veelage fires a JSON payload to the webhook URL you set on that product. Use Zapier or Make to connect
          that webhook to any email platform in minutes — no code required.
        </p>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-5">
          {[
            { icon: "🛒", text: "Buyer purchases or abandons" },
            { icon: "⚡", text: "Veelage fires webhook to your URL" },
            { icon: "📧", text: "Zapier/Make adds them to your email tool" },
          ].map((s) => (
            <div key={s.text} className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-xs font-semibold text-gray-700">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Webhook payload example</p>
        <pre className="bg-gray-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto font-mono">{PAYLOAD_EXAMPLE}</pre>
      </div>

      {/* Products with integrations */}
      {configured.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Your products with integrations</h2>
          <div className="space-y-3">
            {configured.map((p: {
              id: string; name: string; slug: string;
              meta_pixel_id?: string | null; tiktok_pixel_id?: string | null; webhook_url?: string | null;
            }) => (
              <div key={p.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 flex-wrap sm:flex-nowrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">/p/{p.slug}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {p.meta_pixel_id && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                      <CheckCircle size={10} /> Meta Pixel
                    </span>
                  )}
                  {p.tiktok_pixel_id && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-black text-white text-xs font-semibold rounded-full">
                      <CheckCircle size={10} /> TikTok
                    </span>
                  )}
                  {p.webhook_url && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full">
                      <CheckCircle size={10} /> Webhook
                    </span>
                  )}
                </div>
                <Link href={`/creator/products/${p.id}`}
                  className="text-xs text-orange-600 hover:underline font-semibold flex-shrink-0">
                  Edit →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products without integrations */}
      {unconfigured.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <p className="text-sm font-semibold text-amber-700 mb-2">
            {unconfigured.length} product{unconfigured.length > 1 ? "s" : ""} without tracking or webhooks
          </p>
          <div className="flex flex-wrap gap-2">
            {unconfigured.map((p: { id: string; name: string }) => (
              <Link key={p.id} href={`/creator/products/${p.id}`}
                className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 text-xs font-semibold rounded-xl hover:border-amber-400 transition-colors">
                {p.name} →
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No products at all */}
      {(products ?? []).length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔌</p>
          <p className="font-semibold text-gray-600 mb-1">No products yet</p>
          <p className="text-sm mb-4">Create a product first, then come back to set up integrations.</p>
          <Link href="/creator/products" className="text-sm text-orange-600 hover:underline font-semibold">
            Go to Products →
          </Link>
        </div>
      )}

      {/* Integration guides */}
      <div>
        <h2 className="font-bold text-gray-800 mb-4">Supported platforms</h2>
        <div className="space-y-4">
          {TOOLS.map((tool) => (
            <div key={tool.name} className={`rounded-2xl border p-6 ${tool.color}`}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{tool.logo}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-800">{tool.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tool.badge}`}>via Webhook</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{tool.description}</p>
                  <div className="space-y-1.5">
                    {tool.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/70 text-gray-500 text-xs flex items-center justify-center font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-gray-600">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
