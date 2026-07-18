import { getServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { ExternalLink, CheckCircle, Radio, Mail } from "lucide-react";

const TOOLS = [
  {
    name: "Zapier",
    logo: "⚡",
    description: "Connect to 7,000+ apps — Mailchimp, Slack, Google Sheets, ActiveCampaign, and more. No code needed.",
    steps: [
      'Go to zapier.com → Create → New Zap',
      'Choose "Webhooks by Zapier" as the trigger → Event: Catch Hook',
      "Copy the webhook URL Zapier gives you",
      "Paste it into the product's Email & Webhooks tab → Webhook URL",
      "Set up your action: add subscriber to Mailchimp list, send Slack alert, log to Sheets, etc.",
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
      "Paste it into the product's Email & Webhooks tab",
      "Add modules: ConvertKit, Klaviyo, ActiveCampaign, email, etc.",
    ],
    color: "bg-purple-50 border-purple-100",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    name: "Klaviyo",
    logo: "📧",
    description: "Purpose-built email & SMS for ecommerce. Best for segmented sequences, abandoned cart flows, and post-purchase nurture.",
    steps: [
      "In Klaviyo: go to Integrations → Custom Source → Create API Key",
      "Go to zapier.com or make.com and connect Klaviyo using the API key",
      'Create a Zap: Webhook trigger → Klaviyo action: "Add to list" or "Track Event"',
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
      "In Zapier/Make: create a Zap with Webhook trigger → ConvertKit action: Add Subscriber",
      "Set the form/tag to your product's sequence",
      "Paste the Zapier webhook URL into your product's Email & Webhooks tab",
    ],
    color: "bg-red-50 border-red-100",
    badge: "bg-red-100 text-red-700",
  },
  {
    name: "Mailchimp",
    logo: "🐵",
    description: "The most popular email marketing tool. Connect to add buyers to an audience and trigger automated journeys.",
    steps: [
      "In Mailchimp: Account → Extras → API Keys → Create",
      "In Zapier: Webhook trigger → Mailchimp action: Add/Update Subscriber",
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

export default async function IntegrationsPage() {
  const db = getServiceClient();
  const { data: products } = await db
    .from("product")
    .select("id, name, slug, meta_pixel_id, tiktok_pixel_id, webhook_url, from_name")
    .order("created_at", { ascending: false });

  const configured = (products ?? []).filter((p: {
    meta_pixel_id?: string | null; tiktok_pixel_id?: string | null; webhook_url?: string | null;
  }) => p.meta_pixel_id || p.tiktok_pixel_id || p.webhook_url);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-400 text-sm mt-1">Connect your products to email marketing tools, ad pixels, and automation platforms.</p>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="font-bold text-gray-800 mb-1">How integrations work</h2>
        <p className="text-sm text-gray-500 mb-4">
          Each product has its own tracking and webhook settings. When a buyer purchases or abandons a checkout,
          Veelage fires a JSON payload to the webhook URL you set on that product. Use Zapier or Make to connect that
          webhook to any email platform in minutes — no code required.
        </p>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🛒</div>
            <p className="text-xs font-semibold text-gray-700">Buyer purchases or abandons</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-xs font-semibold text-gray-700">Veelage fires webhook to your URL</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">📧</div>
            <p className="text-xs font-semibold text-gray-700">Zapier/Make adds them to your email tool</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Webhook payload</p>
          <pre className="bg-gray-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto font-mono">{PAYLOAD_EXAMPLE}</pre>
        </div>
      </div>

      {/* Per-product status */}
      {configured.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="font-bold text-gray-800 mb-4">Products with integrations configured</h2>
          <div className="space-y-3">
            {configured.map((p: {
              id: string; name: string; slug: string; from_name?: string | null;
              meta_pixel_id?: string | null; tiktok_pixel_id?: string | null; webhook_url?: string | null;
            }) => (
              <div key={p.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">/p/{p.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.meta_pixel_id && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                      <CheckCircle size={10} /> Meta
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
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/products/${p.id}?tab=tracking`}
                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-semibold"
                  >
                    <Radio size={12} /> Pixels
                  </Link>
                  <Link
                    href={`/admin/products/${p.id}?tab=email`}
                    className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 font-semibold"
                  >
                    <Mail size={12} /> Email
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products without integrations */}
      {(products ?? []).filter((p: { meta_pixel_id?: string | null; tiktok_pixel_id?: string | null; webhook_url?: string | null }) =>
        !p.meta_pixel_id && !p.tiktok_pixel_id && !p.webhook_url
      ).length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8">
          <p className="text-sm font-semibold text-amber-700 mb-2">Products without tracking</p>
          <div className="flex flex-wrap gap-2">
            {(products ?? [])
              .filter((p: { meta_pixel_id?: string | null; tiktok_pixel_id?: string | null; webhook_url?: string | null }) =>
                !p.meta_pixel_id && !p.tiktok_pixel_id && !p.webhook_url
              )
              .map((p: { id: string; name: string }) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}?tab=tracking`}
                  className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 text-xs font-semibold rounded-xl hover:border-amber-400 transition-colors"
                >
                  {p.name} →
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Integration guides */}
      <h2 className="font-bold text-gray-800 mb-4">Supported platforms</h2>
      <div className="space-y-4">
        {TOOLS.map((tool) => (
          <div key={tool.name} className={`rounded-2xl border p-6 ${tool.color}`}>
            <div className="flex items-start gap-4">
              <div className="text-3xl">{tool.logo}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-800">{tool.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tool.badge}`}>
                    via Webhook
                  </span>
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

      {/* Add pixel CTA */}
      <div className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="font-bold text-lg mb-1">Ready to set up a product?</h3>
        <p className="text-white/80 text-sm mb-4">Go to your product list and click the pixel icon or email icon to open the tracking and webhook settings for each product.</p>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 bg-white text-pink-600 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-pink-50 transition-colors"
        >
          <ExternalLink size={14} />
          Go to Products
        </Link>
      </div>
    </div>
  );
}
