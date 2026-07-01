"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { Block } from "@/types";

/* ─── helpers ─────────────────────────────────────────────── */
const PRODUCT_TYPES = [
  {
    id: "digital",
    label: "Digital Product",
    icon: "📦",
    desc: "File, link, or access delivered automatically after purchase.",
  },
  {
    id: "external",
    label: "External Link",
    icon: "🔗",
    desc: "Redirect buyer to an external platform (Teachable, Notion, etc.).",
  },
] as const;

type ProductType = (typeof PRODUCT_TYPES)[number]["id"];

interface CollectField {
  key: string;
  label: string;
  required: boolean;
  enabled: boolean;
}

const DEFAULT_FIELDS: CollectField[] = [
  { key: "name", label: "Full Name", required: false, enabled: true },
  { key: "email", label: "Email Address", required: true, enabled: true },
  { key: "phone", label: "Phone Number", required: false, enabled: true },
];

/* ─── step indicator ───────────────────────────────────────── */
const STEPS = ["Type", "Display", "Pricing", "Content", "Collect Info"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                i < current
                  ? "bg-indigo-500 text-white"
                  : i === current
                  ? "bg-indigo-500 text-white ring-4 ring-indigo-100"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < current ? <Check size={14} strokeWidth={3} /> : i + 1}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                i === current ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-12 mx-1 mb-5 transition-colors ${
                i < current ? "bg-indigo-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── reusable field components ────────────────────────────── */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white";

/* ─── main form ────────────────────────────────────────────── */
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
  defaultTab?: "page" | "tracking" | "email";
}

export function ProductForm({ initialData, defaultTab = "page" }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  /* wizard step */
  const [step, setStep] = useState(isEdit ? -1 : 0);

  /* step 1 – type */
  const [productType, setProductType] = useState<ProductType>("digital");

  /* step 2 – display */
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [thumbnail, setThumbnail] = useState<string>(() => {
    const imgBlock = (initialData?.page_blocks ?? []).find((b) => b.type === "image");
    return imgBlock ? (imgBlock.data.url as string) ?? "" : "";
  });
  const [subtitle, setSubtitle] = useState<string>(() => {
    const heroBlock = (initialData?.page_blocks ?? []).find((b) => b.type === "hero");
    return heroBlock ? (heroBlock.data.subheadline as string) ?? "" : "";
  });
  const [ctaText, setCtaText] = useState("Get Instant Access");

  /* step 3 – pricing */
  const [price, setPrice] = useState(initialData ? String(initialData.price_kobo / 100) : "");
  const [discountEnabled, setDiscountEnabled] = useState(!!initialData?.compare_at_kobo);
  const [compareAt, setCompareAt] = useState(
    initialData?.compare_at_kobo ? String(initialData.compare_at_kobo / 100) : ""
  );
  const [deliveryLink, setDeliveryLink] = useState(initialData?.external_url ?? "");

  /* step 4 – content */
  const [description, setDescription] = useState<string>(() => {
    const textBlock = (initialData?.page_blocks ?? []).find((b) => b.type === "text");
    return textBlock ? (textBlock.data.content as string) ?? "" : "";
  });
  const [bullets, setBullets] = useState<string[]>(() => {
    const bulletBlock = (initialData?.page_blocks ?? []).find((b) => b.type === "bullet_list");
    return bulletBlock ? (bulletBlock.data.items as string[]) ?? [""] : [""];
  });
  const [bulletsHeading, setBulletsHeading] = useState<string>(() => {
    const bulletBlock = (initialData?.page_blocks ?? []).find((b) => b.type === "bullet_list");
    return bulletBlock ? (bulletBlock.data.heading as string) ?? "" : "";
  });

  /* step 5 – collect info */
  const [collectFields, setCollectFields] = useState<CollectField[]>(DEFAULT_FIELDS);

  /* settings (edit mode) */
  const [active, setActive] = useState(initialData?.active ?? true);
  const [metaPixelId, setMetaPixelId] = useState(initialData?.meta_pixel_id ?? "");
  const [metaCapiToken, setMetaCapiToken] = useState(initialData?.meta_capi_token ?? "");
  const [tiktokPixelId, setTiktokPixelId] = useState(initialData?.tiktok_pixel_id ?? "");
  const [fromName, setFromName] = useState(initialData?.from_name ?? "");
  const [fromEmail, setFromEmail] = useState(initialData?.from_email ?? "");
  const [webhookUrl, setWebhookUrl] = useState(initialData?.webhook_url ?? "");

  /* edit-mode tabs */
  const EDIT_TABS = ["Display", "Pricing", "Content", "Collect Info", "Pixels", "Email & Webhooks"] as const;
  type EditTab = (typeof EDIT_TABS)[number];
  const defaultEditTab: EditTab =
    defaultTab === "tracking" ? "Pixels" : defaultTab === "email" ? "Email & Webhooks" : "Display";
  const [editTab, setEditTab] = useState<EditTab>(defaultEditTab);

  /* save */
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit)
      setSlug(
        v
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
  };

  function buildBlocks(): Block[] {
    const blocks: Block[] = [];
    if (name) {
      blocks.push({
        id: crypto.randomUUID(),
        type: "hero",
        data: { headline: name, subheadline: subtitle, badge: "" },
      });
    }
    if (description) {
      blocks.push({ id: crypto.randomUUID(), type: "text", data: { content: description } });
    }
    const filledBullets = bullets.filter(Boolean);
    if (filledBullets.length) {
      blocks.push({
        id: crypto.randomUUID(),
        type: "bullet_list",
        data: { heading: bulletsHeading, items: filledBullets },
      });
    }
    if (thumbnail) {
      blocks.push({ id: crypto.randomUUID(), type: "image", data: { url: thumbnail, alt: name } });
    }
    return blocks;
  }

  function buildBlocksForEdit(): Block[] {
    const existing = initialData?.page_blocks ?? [];
    const otherBlocks = existing.filter(
      (b) => !["hero", "text", "bullet_list", "image"].includes(b.type)
    );

    const blocks: Block[] = [];
    if (name) {
      const existing_hero = existing.find((b) => b.type === "hero");
      blocks.push({
        id: existing_hero?.id ?? crypto.randomUUID(),
        type: "hero",
        data: { headline: name, subheadline: subtitle, badge: existing_hero?.data.badge ?? "" },
      });
    }
    if (description) {
      const existing_text = existing.find((b) => b.type === "text");
      blocks.push({
        id: existing_text?.id ?? crypto.randomUUID(),
        type: "text",
        data: { content: description },
      });
    }
    const filledBullets = bullets.filter(Boolean);
    if (filledBullets.length) {
      const existing_bullet = existing.find((b) => b.type === "bullet_list");
      blocks.push({
        id: existing_bullet?.id ?? crypto.randomUUID(),
        type: "bullet_list",
        data: { heading: bulletsHeading, items: filledBullets },
      });
    }
    if (thumbnail) {
      const existing_img = existing.find((b) => b.type === "image");
      blocks.push({
        id: existing_img?.id ?? crypto.randomUUID(),
        type: "image",
        data: { url: thumbnail, alt: name },
      });
    }
    return [...blocks, ...otherBlocks];
  }

  const handleSave = async () => {
    if (!name || !slug || !price) {
      setError("Name, slug, and price are required");
      return;
    }
    setError("");
    setSaving(true);

    const page_blocks = isEdit ? buildBlocksForEdit() : buildBlocks();

    const payload = {
      name,
      slug,
      price_kobo: Math.round(parseFloat(price) * 100),
      compare_at_kobo:
        discountEnabled && compareAt ? Math.round(parseFloat(compareAt) * 100) : null,
      external_url: deliveryLink || null,
      active,
      page_blocks,
      meta_pixel_id: metaPixelId || null,
      meta_capi_token: metaCapiToken || null,
      tiktok_pixel_id: tiktokPixelId || null,
      from_name: fromName || null,
      from_email: fromEmail || null,
      webhook_url: webhookUrl || null,
    };

    const url = isEdit
      ? `/api/admin/products/${initialData!.id}`
      : "/api/admin/products";
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

  /* ── WIZARD (new product) ─────────────────────────────────── */
  if (!isEdit) {
    return (
      <div className="max-w-2xl">
        <StepIndicator current={step} />

        {/* Step 0 – Type */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Choose product type</h2>
            <p className="text-sm text-gray-500 mb-6">What are you selling?</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {PRODUCT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setProductType(t.id)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all ${
                    productType === t.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="text-3xl mb-3">{t.icon}</div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{t.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Continue <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 1 – Display */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Customize display</h2>
            <p className="text-sm text-gray-500 mb-6">How your product appears to buyers.</p>
            <div className="space-y-5 mb-8">
              <Field label="Product title" hint="This is the headline buyers see first.">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Ultimate Marketing Playbook"
                  className={inputCls}
                />
              </Field>
              <Field label="URL slug">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 bg-white">
                  <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 shrink-0">/p/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-product"
                    className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>
              </Field>
              <Field label="Thumbnail image URL" hint="Shown at the top of your product page. Paste an image link.">
                <input type="url" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://…/image.jpg" className={inputCls} />
                {thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt="" className="mt-2 h-24 w-full object-cover rounded-xl" />
                )}
              </Field>
              <Field label="Subtitle" hint="One-line tagline shown below the title.">
                <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. The fastest path to results — backed by 500+ students" className={inputCls} />
              </Field>
              <Field label="Button text">
                <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Get Instant Access" className={inputCls} />
              </Field>
            </div>
            <NavButtons onBack={() => setStep(0)} onNext={() => setStep(2)} nextDisabled={!name} />
          </div>
        )}

        {/* Step 2 – Pricing */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Set your price</h2>
            <p className="text-sm text-gray-500 mb-6">How much does this product cost?</p>
            <div className="space-y-5 mb-8">
              <Field label="Price (₦)">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 bg-white">
                  <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">₦</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="5000"
                    className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>
              </Field>

              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Discount price</p>
                  <p className="text-xs text-gray-400">Show a strikethrough original price</p>
                </div>
                <button
                  onClick={() => setDiscountEnabled(!discountEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${discountEnabled ? "bg-indigo-500" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${discountEnabled ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {discountEnabled && (
                <Field label="Original price (₦)" hint="This shows as a strikethrough above the sale price.">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 bg-white">
                    <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">₦</span>
                    <input
                      type="number"
                      value={compareAt}
                      onChange={(e) => setCompareAt(e.target.value)}
                      placeholder="9000"
                      className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </Field>
              )}

              <Field
                label={productType === "external" ? "Redirect URL" : "Delivery link"}
                hint={productType === "external" ? "Buyers are sent here after purchase." : "Link, file URL, or course access sent to buyers after purchase."}
              >
                <input type="url" value={deliveryLink} onChange={(e) => setDeliveryLink(e.target.value)} placeholder="https://…" className={inputCls} />
              </Field>
            </div>
            <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!price} />
          </div>
        )}

        {/* Step 3 – Content */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Add content</h2>
            <p className="text-sm text-gray-500 mb-6">Describe what buyers are getting.</p>
            <div className="space-y-5 mb-8">
              <Field label="Description" hint="A few sentences about what this product includes.">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="This template includes the following sections…"
                  className={inputCls}
                />
              </Field>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bullet points</label>
                <Field label="" hint="List the key benefits or features.">
                  <input
                    type="text"
                    value={bulletsHeading}
                    onChange={(e) => setBulletsHeading(e.target.value)}
                    placeholder="This is for you if you want to:"
                    className={`${inputCls} mb-3`}
                  />
                  <div className="space-y-2">
                    {bullets.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const next = [...bullets];
                            next[i] = e.target.value;
                            setBullets(next);
                          }}
                          placeholder={`Benefit ${i + 1}`}
                          className={inputCls}
                        />
                        {bullets.length > 1 && (
                          <button
                            onClick={() => setBullets(bullets.filter((_, j) => j !== i))}
                            className="text-gray-300 hover:text-red-400 shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setBullets([...bullets, ""])}
                      className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium mt-1"
                    >
                      <Plus size={13} /> Add bullet
                    </button>
                  </div>
                </Field>
              </div>
            </div>
            <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} />
          </div>
        )}

        {/* Step 4 – Collect Info */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Collect info</h2>
            <p className="text-sm text-gray-500 mb-6">Which fields should buyers fill in at checkout?</p>
            <div className="space-y-3 mb-8">
              {collectFields.map((f) => (
                <div
                  key={f.key}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{f.label}</p>
                    {f.required && (
                      <p className="text-xs text-gray-400">Always required</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (f.required) return;
                      setCollectFields(
                        collectFields.map((x) =>
                          x.key === f.key ? { ...x, enabled: !x.enabled } : x
                        )
                      );
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      f.enabled ? "bg-indigo-500" : "bg-gray-200"
                    } ${f.required ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        f.enabled ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl mb-4">{error}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                {saving ? "Saving…" : "Save Product"}
                {!saving && <Check size={16} strokeWidth={3} />}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── EDIT MODE ───────────────────────────────────────────── */
  return (
    <div className="max-w-2xl">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 overflow-x-auto">
        {EDIT_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setEditTab(t)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              editTab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Display tab */}
      {editTab === "Display" && (
        <div className="space-y-5">
          <Field label="Product title">
            <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Product title" className={inputCls} />
          </Field>
          <Field label="URL slug">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 bg-white">
              <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 shrink-0">/p/</span>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white text-gray-800 placeholder-gray-400" />
            </div>
          </Field>
          <Field label="Thumbnail image URL">
            <input type="url" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://…/image.jpg" className={inputCls} />
            {thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnail} alt="" className="mt-2 h-24 w-full object-cover rounded-xl" />
            )}
          </Field>
          <Field label="Subtitle">
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="One-line tagline" className={inputCls} />
          </Field>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Active</p>
              <p className="text-xs text-gray-400">Visible to buyers when on</p>
            </div>
            <button
              onClick={() => setActive(!active)}
              className={`relative w-11 h-6 rounded-full transition-colors ${active ? "bg-indigo-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? "translate-x-5" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {/* Pricing tab */}
      {editTab === "Pricing" && (
        <div className="space-y-5">
          <Field label="Price (₦)">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 bg-white">
              <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">₦</span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="5000" className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white text-gray-800 placeholder-gray-400" />
            </div>
          </Field>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Discount price</p>
              <p className="text-xs text-gray-400">Show a strikethrough original price</p>
            </div>
            <button
              onClick={() => setDiscountEnabled(!discountEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${discountEnabled ? "bg-indigo-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${discountEnabled ? "translate-x-5" : ""}`} />
            </button>
          </div>
          {discountEnabled && (
            <Field label="Original price (₦)">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 bg-white">
                <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">₦</span>
                <input type="number" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} placeholder="9000" className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white text-gray-800 placeholder-gray-400" />
              </div>
            </Field>
          )}
          <Field label="Delivery link" hint="URL or file link sent to buyers after purchase.">
            <input type="url" value={deliveryLink} onChange={(e) => setDeliveryLink(e.target.value)} placeholder="https://…" className={inputCls} />
          </Field>
        </div>
      )}

      {/* Content tab */}
      {editTab === "Content" && (
        <div className="space-y-5">
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe what buyers get…" className={inputCls} />
          </Field>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bullet points</label>
            <input
              type="text"
              value={bulletsHeading}
              onChange={(e) => setBulletsHeading(e.target.value)}
              placeholder="This is for you if you want to:"
              className={`${inputCls} mb-3`}
            />
            <div className="space-y-2">
              {bullets.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const next = [...bullets];
                      next[i] = e.target.value;
                      setBullets(next);
                    }}
                    placeholder={`Benefit ${i + 1}`}
                    className={inputCls}
                  />
                  {bullets.length > 1 && (
                    <button onClick={() => setBullets(bullets.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 shrink-0">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setBullets([...bullets, ""])}
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium mt-1"
              >
                <Plus size={13} /> Add bullet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Info tab */}
      {editTab === "Collect Info" && (
        <div className="space-y-3">
          {collectFields.map((f) => (
            <div key={f.key} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-gray-800">{f.label}</p>
                {f.required && <p className="text-xs text-gray-400">Always required</p>}
              </div>
              <button
                onClick={() => {
                  if (f.required) return;
                  setCollectFields(collectFields.map((x) => x.key === f.key ? { ...x, enabled: !x.enabled } : x));
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${f.enabled ? "bg-indigo-500" : "bg-gray-200"} ${f.required ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${f.enabled ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pixels tab */}
      {editTab === "Pixels" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-0.5">Meta (Facebook) Pixel</h3>
            <p className="text-xs text-gray-400 mb-4">Per-product pixel — overrides any global setting.</p>
            <div className="space-y-3">
              <Field label="Pixel ID">
                <input type="text" value={metaPixelId} onChange={(e) => setMetaPixelId(e.target.value)} placeholder="123456789012345" className={inputCls} />
              </Field>
              <Field label="Conversions API Access Token">
                <input type="password" value={metaCapiToken} onChange={(e) => setMetaCapiToken(e.target.value)} placeholder="EAAG… (from Events Manager → Settings)" className={inputCls} />
              </Field>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-0.5">TikTok Pixel</h3>
            <p className="text-xs text-gray-400 mb-4">PageView + ViewContent fires on load. Purchase fires on payment.</p>
            <Field label="Pixel ID">
              <input type="text" value={tiktokPixelId} onChange={(e) => setTiktokPixelId(e.target.value)} placeholder="C9ABC1234567890" className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {/* Email & Webhooks tab */}
      {editTab === "Email & Webhooks" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-0.5">Cart abandonment sender</h3>
            <p className="text-xs text-gray-400 mb-4">Recovery emails appear to come from this name and address.</p>
            <div className="space-y-3">
              <Field label="From name">
                <input type="text" value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Tunde from DigitalCourse" className={inputCls} />
              </Field>
              <Field label="From email">
                <input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="tunde@yourdomain.com" className={inputCls} />
              </Field>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-0.5">Email marketing webhook</h3>
            <p className="text-xs text-gray-400 mb-4">
              We POST a JSON payload here on purchase and cart abandonment — works with Zapier, Make, Klaviyo, ConvertKit, and more.
            </p>
            <Field label="Webhook URL">
              <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://hooks.zapier.com/hooks/catch/…" className={inputCls} />
            </Field>
            <div className="mt-3 bg-gray-900 rounded-xl p-3 text-xs text-green-400 font-mono leading-relaxed">
              {`{ event: "purchase" | "cart_abandoned", email, name, phone, product_id, product_name, amount_kobo, currency, order_ref }`}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl mt-6">{error}</p>
      )}

      <div className="flex gap-3 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          onClick={() => router.push("/admin/products")}
          className="text-gray-500 hover:text-gray-700 text-sm px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── nav buttons ──────────────────────────────────────────── */
function NavButtons({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft size={16} /> Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
      >
        Continue <ChevronRight size={16} />
      </button>
    </div>
  );
}
