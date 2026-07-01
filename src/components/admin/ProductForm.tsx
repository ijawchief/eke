"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Block, BlockType } from "@/types";

const BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: "hero", label: "Hero" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "video", label: "Video" },
  { type: "bullet_list", label: "Bullet List" },
  { type: "testimonial", label: "Testimonial" },
  { type: "faq", label: "FAQ" },
  { type: "countdown", label: "Countdown" },
  { type: "divider", label: "Divider" },
];

function defaultData(type: BlockType): Record<string, unknown> {
  switch (type) {
    case "hero": return { headline: "", subheadline: "", badge: "" };
    case "text": return { content: "" };
    case "image": return { url: "", alt: "", caption: "" };
    case "video": return { url: "" };
    case "bullet_list": return { heading: "", items: [""] };
    case "testimonial": return { quote: "", name: "", title: "", avatar: "" };
    case "faq": return { heading: "FAQ", items: [{ q: "", a: "" }] };
    case "countdown": return { deadline: "", label: "" };
    case "divider": return {};
    default: return {};
  }
}

function BlockEditor({ block, onChange, onRemove }: {
  block: Block;
  onChange: (data: Record<string, unknown>) => void;
  onRemove: () => void;
}) {
  const { type, data } = block;
  const str = (key: string) => (data[key] as string) ?? "";
  const arr = <T,>(key: string) => (data[key] as T[]) ?? [];

  const field = (key: string, label: string, multiline = false) => (
    <div key={key}>
      <label className="block text-xs text-white/50 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={str(key)}
          onChange={(e) => onChange({ ...data, [key]: e.target.value })}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      ) : (
        <input
          type="text"
          value={str(key)}
          onChange={(e) => onChange({ ...data, [key]: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      )}
    </div>
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-white/20" />
          <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
            {BLOCK_TYPES.find((b) => b.type === type)?.label ?? type}
          </span>
        </div>
        <button onClick={onRemove} className="text-white/30 hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {type === "hero" && (
          <>
            {field("headline", "Headline")}
            {field("subheadline", "Subheadline")}
            {field("badge", "Badge (optional)")}
          </>
        )}
        {type === "text" && field("content", "Content", true)}
        {type === "image" && (
          <>
            {field("url", "Image URL")}
            {field("alt", "Alt text")}
            {field("caption", "Caption (optional)")}
          </>
        )}
        {type === "video" && field("url", "Video URL (YouTube / Vimeo / direct)")}
        {type === "bullet_list" && (
          <>
            {field("heading", "Heading (optional)")}
            <div>
              <label className="block text-xs text-white/50 mb-2">Items</label>
              <div className="space-y-2">
                {arr<string>("items").map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const items = [...arr<string>("items")];
                        items[i] = e.target.value;
                        onChange({ ...data, items });
                      }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        const items = arr<string>("items").filter((_, j) => j !== i);
                        onChange({ ...data, items });
                      }}
                      className="text-white/30 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onChange({ ...data, items: [...arr<string>("items"), ""] })}
                  className="text-xs text-blue-400 hover:underline"
                >
                  + Add item
                </button>
              </div>
            </div>
          </>
        )}
        {type === "testimonial" && (
          <>
            {field("quote", "Quote", true)}
            {field("name", "Name")}
            {field("title", "Title / Role")}
            {field("avatar", "Avatar URL (optional)")}
          </>
        )}
        {type === "faq" && (
          <>
            {field("heading", "Section heading")}
            <div>
              <label className="block text-xs text-white/50 mb-2">Questions</label>
              <div className="space-y-3">
                {arr<{ q: string; a: string }>("items").map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Question"
                      value={item.q}
                      onChange={(e) => {
                        const items = [...arr<{ q: string; a: string }>("items")];
                        items[i] = { ...items[i], q: e.target.value };
                        onChange({ ...data, items });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <textarea
                      placeholder="Answer"
                      value={item.a}
                      rows={2}
                      onChange={(e) => {
                        const items = [...arr<{ q: string; a: string }>("items")];
                        items[i] = { ...items[i], a: e.target.value };
                        onChange({ ...data, items });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        const items = arr<{ q: string; a: string }>("items").filter((_, j) => j !== i);
                        onChange({ ...data, items });
                      }}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onChange({ ...data, items: [...arr<{ q: string; a: string }>("items"), { q: "", a: "" }] })}
                  className="text-xs text-blue-400 hover:underline"
                >
                  + Add question
                </button>
              </div>
            </div>
          </>
        )}
        {type === "countdown" && (
          <>
            <div>
              <label className="block text-xs text-white/50 mb-1">Deadline</label>
              <input
                type="datetime-local"
                value={str("deadline")}
                onChange={(e) => onChange({ ...data, deadline: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            {field("label", "Label (e.g. Offer ends in)")}
          </>
        )}
      </div>
    </div>
  );
}

interface ProductFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    price_kobo: number;
    compare_at_kobo: number | null;
    external_url: string | null;
    active: boolean;
    page_blocks: Block[];
    meta_pixel_id?: string | null;
    meta_capi_token?: string | null;
    tiktok_pixel_id?: string | null;
    from_name?: string | null;
    from_email?: string | null;
    webhook_url?: string | null;
  };
}

export function ProductForm({ initialData, defaultTab = "page" }: ProductFormProps & { defaultTab?: "page" | "tracking" | "email" }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [price, setPrice] = useState(initialData ? String(initialData.price_kobo / 100) : "");
  const [compareAt, setCompareAt] = useState(initialData?.compare_at_kobo ? String(initialData.compare_at_kobo / 100) : "");
  const [externalUrl, setExternalUrl] = useState(initialData?.external_url ?? "");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [blocks, setBlocks] = useState<Block[]>(initialData?.page_blocks ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [addingBlock, setAddingBlock] = useState(false);
  const [activeTab, setActiveTab] = useState<"page" | "tracking" | "email">(defaultTab);
  // Tracking
  const [metaPixelId, setMetaPixelId] = useState(initialData?.meta_pixel_id ?? "");
  const [metaCapiToken, setMetaCapiToken] = useState(initialData?.meta_capi_token ?? "");
  const [tiktokPixelId, setTiktokPixelId] = useState(initialData?.tiktok_pixel_id ?? "");
  // Email / abandonment
  const [fromName, setFromName] = useState(initialData?.from_name ?? "");
  const [fromEmail, setFromEmail] = useState(initialData?.from_email ?? "");
  const [webhookUrl, setWebhookUrl] = useState(initialData?.webhook_url ?? "");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const addBlock = (type: BlockType) => {
    const block: Block = { id: crypto.randomUUID(), type, data: defaultData(type) };
    setBlocks((prev) => [...prev, block]);
    setAddingBlock(false);
  };

  const updateBlock = (id: string, data: Record<string, unknown>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, data } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSave = async () => {
    if (!name || !slug || !price) { setError("Name, slug, and price are required"); return; }
    setError("");
    setSaving(true);

    const payload = {
      name,
      slug,
      price_kobo: Math.round(parseFloat(price) * 100),
      compare_at_kobo: compareAt ? Math.round(parseFloat(compareAt) * 100) : null,
      external_url: externalUrl || null,
      active,
      page_blocks: blocks,
      meta_pixel_id: metaPixelId || null,
      meta_capi_token: metaCapiToken || null,
      tiktok_pixel_id: tiktokPixelId || null,
      from_name: fromName || null,
      from_email: fromEmail || null,
      webhook_url: webhookUrl || null,
    };

    const url = isEdit ? `/api/admin/products/${initialData!.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Save failed");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Basic info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-white/60 mb-4">Basic Info</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g. Digital Marketing Masterclass"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Slug (URL)</label>
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-sm">/p/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="my-product"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Price (₦)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="19999"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Compare-at Price (₦)</label>
              <input
                type="number"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="29999 (optional)"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Course / Delivery Link</label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="https://your-course-platform.com/your-course"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActive(!active)}
              className={`relative w-10 h-5 rounded-full transition-colors ${active ? "bg-blue-600" : "bg-white/20"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${active ? "translate-x-5" : ""}`} />
            </button>
            <span className="text-sm text-white/60">{active ? "Active (visible to buyers)" : "Inactive (hidden)"}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
        {(["page", "tracking", "email"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${
              activeTab === t ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
            }`}
          >
            {t === "page" ? "Page Builder" : t === "tracking" ? "Pixel & CAPI" : "Email & Webhooks"}
          </button>
        ))}
      </div>

      {/* Tracking tab */}
      {activeTab === "tracking" && (
        <div className="space-y-6 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Meta (Facebook) Pixel</h2>
            <p className="text-xs text-white/40 mb-4">These override any global Meta pixel for this product specifically.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/50 mb-1">Pixel ID</label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="e.g. 123456789012345"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Conversions API Access Token</label>
                <input
                  type="password"
                  value={metaCapiToken}
                  onChange={(e) => setMetaCapiToken(e.target.value)}
                  placeholder="EAAG… (from Events Manager → Settings)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-1">TikTok Pixel</h2>
            <p className="text-xs text-white/40 mb-4">PageView + ViewContent fires on load. InitiateCheckout fires when buyer opens the form. Purchase fires via TikTok Events API on payment (coming soon).</p>
            <div>
              <label className="block text-xs text-white/50 mb-1">Pixel ID</label>
              <input
                type="text"
                value={tiktokPixelId}
                onChange={(e) => setTiktokPixelId(e.target.value)}
                placeholder="e.g. C9ABC1234567890"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Email & Webhooks tab */}
      {activeTab === "email" && (
        <div className="space-y-6 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Cart Abandonment Sender</h2>
            <p className="text-xs text-white/40 mb-4">Recovery emails will appear to come from this name and email address. Leave blank to use the system default.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/50 mb-1">From Name</label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="e.g. Tunde from DigitalCourse"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">From Email</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="tunde@yourdomain.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Email Marketing Webhook</h2>
            <p className="text-xs text-white/40 mb-4">
              When a purchase completes or a cart is abandoned, we POST a JSON payload to this URL — works with Mailchimp, ConvertKit, Klaviyo, ActiveCampaign, Zapier, Make, and any tool that accepts webhooks.
            </p>
            <div>
              <label className="block text-xs text-white/50 mb-1">Webhook URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mt-4 bg-black/20 rounded-lg p-3 text-xs text-white/40 font-mono leading-relaxed">
              <p className="text-white/60 font-semibold not-italic mb-1">Payload shape (purchase):</p>
              {`{ event: "purchase" | "cart_abandoned", email, name, phone, product_id, product_name, amount_kobo, currency, order_ref }`}
            </div>
          </div>
        </div>
      )}

      {/* Page blocks */}
      {activeTab === "page" && (
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white/60 mb-4">Page Blocks</h2>
        <div className="space-y-3">
          {blocks.map((block) => (
            <BlockEditor
              key={block.id}
              block={block}
              onChange={(data) => updateBlock(block.id, data)}
              onRemove={() => removeBlock(block.id)}
            />
          ))}
        </div>

        {addingBlock ? (
          <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/50 mb-3">Choose a block type:</p>
            <div className="flex flex-wrap gap-2">
              {BLOCK_TYPES.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-blue-600 text-sm rounded-lg transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => setAddingBlock(false)} className="text-xs text-white/30 mt-3 hover:text-white">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingBlock(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-blue-500 text-white/40 hover:text-blue-400 rounded-xl py-3 text-sm transition-colors"
          >
            <Plus size={16} />
            Add Block
          </button>
        )}
      </div>
      )}

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button
          onClick={() => router.push("/admin/products")}
          className="text-white/40 hover:text-white text-sm px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
