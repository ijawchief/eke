"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Eye, EyeOff, Upload, Link2, FileText, X } from "lucide-react";
import { Block } from "@/types";

/* ─── shared input style ────────────────────────────────────── */
const inp =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white";

/* ─── section header ────────────────────────────────────────── */
function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 shrink-0">
          {n}
        </div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─── live preview card ─────────────────────────────────────── */
function PreviewCard({
  name,
  subtitle,
  price,
  compareAt,
  thumbnail,
  ctaText,
}: {
  name: string;
  subtitle: string;
  price: string;
  compareAt: string;
  thumbnail: string;
  ctaText: string;
}) {
  const fmt = (v: string) =>
    v
      ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(parseFloat(v))
      : "";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm w-[220px]">
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnail} alt="" className="w-full h-32 object-cover" />
      ) : (
        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
          <FileText size={32} className="text-gray-300" />
        </div>
      )}
      <div className="p-3">
        <p className="font-bold text-gray-900 text-sm leading-snug mb-1">{name || "Product Title"}</p>
        {subtitle && <p className="text-xs text-gray-500 mb-2 leading-snug">{subtitle}</p>}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-sm font-bold text-indigo-600">{fmt(price) || "₦0"}</span>
          {compareAt && (
            <span className="text-xs text-gray-400 line-through">{fmt(compareAt)}</span>
          )}
        </div>
        <button className="w-full bg-indigo-500 text-white text-xs font-bold py-2 rounded-xl uppercase tracking-wide">
          {ctaText || "Purchase"}
        </button>
      </div>
    </div>
  );
}

/* ─── collect info field row ────────────────────────────────── */
interface CollectField {
  id: string;
  label: string;
  icon: React.ReactNode;
  required: boolean;
  hidden: boolean;
  locked?: boolean;
}

/* ─── types ─────────────────────────────────────────────────── */
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

/* ─── main ──────────────────────────────────────────────────── */
export function ProductForm({ initialData, defaultTab = "page" }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* section 1 – image */
  const [thumbnail, setThumbnail] = useState<string>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "image");
    return b ? (b.data.url as string) ?? "" : "";
  });

  /* section 2 – description */
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [subtitle, setSubtitle] = useState<string>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "hero");
    return b ? (b.data.subheadline as string) ?? "" : "";
  });
  const [description, setDescription] = useState<string>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "text");
    return b ? (b.data.content as string) ?? "" : "";
  });
  const [bullets, setBullets] = useState<string[]>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "bullet_list");
    return b ? (b.data.items as string[]) ?? [""] : [""];
  });
  const [ctaText, setCtaText] = useState("PURCHASE");

  /* section 3 – price */
  const [price, setPrice] = useState(initialData ? String(initialData.price_kobo / 100) : "");
  const [discountEnabled, setDiscountEnabled] = useState(!!initialData?.compare_at_kobo);
  const [compareAt, setCompareAt] = useState(
    initialData?.compare_at_kobo ? String(initialData.compare_at_kobo / 100) : ""
  );

  /* section 4 – collect info */
  const [collectFields, setCollectFields] = useState<CollectField[]>([
    { id: "name", label: "Name", icon: <span className="text-xs font-bold text-gray-400">A</span>, required: false, hidden: false, locked: false },
    { id: "email", label: "Email", icon: <span className="text-xs text-gray-400">✉</span>, required: true, hidden: false, locked: true },
    { id: "phone", label: "Phone Number", icon: <span className="text-xs text-gray-400">📞</span>, required: false, hidden: false, locked: false },
  ]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [addingField, setAddingField] = useState(false);

  /* section 5 – deliver */
  const [deliverMode, setDeliverMode] = useState<"url" | "file">("url");
  const [deliveryUrl, setDeliveryUrl] = useState(initialData?.external_url ?? "");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);

  /* settings */
  const [active, setActive] = useState(initialData?.active ?? true);
  const [metaPixelId, setMetaPixelId] = useState(initialData?.meta_pixel_id ?? "");
  const [metaCapiToken, setMetaCapiToken] = useState(initialData?.meta_capi_token ?? "");
  const [tiktokPixelId, setTiktokPixelId] = useState(initialData?.tiktok_pixel_id ?? "");
  const [fromName, setFromName] = useState(initialData?.from_name ?? "");
  const [fromEmail, setFromEmail] = useState(initialData?.from_email ?? "");
  const [webhookUrl, setWebhookUrl] = useState(initialData?.webhook_url ?? "");

  /* edit-mode settings tab */
  const SETTINGS_TABS = ["Pixels", "Email & Webhooks"] as const;
  type SettingsTab = (typeof SETTINGS_TABS)[number];
  const defaultSettingsTab: SettingsTab = defaultTab === "tracking" ? "Pixels" : defaultTab === "email" ? "Email & Webhooks" : "Pixels";
  const [settingsTab, setSettingsTab] = useState<SettingsTab>(defaultSettingsTab);
  const [showSettings, setShowSettings] = useState(defaultTab === "tracking" || defaultTab === "email");

  /* save */
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState("");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit)
      setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  function buildBlocks(): Block[] {
    const blocks: Block[] = [];
    if (name) blocks.push({ id: crypto.randomUUID(), type: "hero", data: { headline: name, subheadline: subtitle, badge: "" } });
    if (description) blocks.push({ id: crypto.randomUUID(), type: "text", data: { content: description } });
    const filled = bullets.filter(Boolean);
    if (filled.length) blocks.push({ id: crypto.randomUUID(), type: "bullet_list", data: { heading: "", items: filled } });
    if (thumbnail) blocks.push({ id: crypto.randomUUID(), type: "image", data: { url: thumbnail, alt: name } });
    return blocks;
  }

  function buildBlocksEdit(): Block[] {
    const existing = initialData?.page_blocks ?? [];
    const others = existing.filter((b) => !["hero", "text", "bullet_list", "image"].includes(b.type));
    const blocks: Block[] = [];
    if (name) {
      const h = existing.find((b) => b.type === "hero");
      blocks.push({ id: h?.id ?? crypto.randomUUID(), type: "hero", data: { headline: name, subheadline: subtitle, badge: h?.data.badge ?? "" } });
    }
    if (description) {
      const t = existing.find((b) => b.type === "text");
      blocks.push({ id: t?.id ?? crypto.randomUUID(), type: "text", data: { content: description } });
    }
    const filled = bullets.filter(Boolean);
    if (filled.length) {
      const bl = existing.find((b) => b.type === "bullet_list");
      blocks.push({ id: bl?.id ?? crypto.randomUUID(), type: "bullet_list", data: { heading: bl?.data.heading ?? "", items: filled } });
    }
    if (thumbnail) {
      const img = existing.find((b) => b.type === "image");
      blocks.push({ id: img?.id ?? crypto.randomUUID(), type: "image", data: { url: thumbnail, alt: name } });
    }
    return [...blocks, ...others];
  }

  const handleSave = async (mode: "draft" | "publish") => {
    if (!name || !price) { setError("Title and price are required"); return; }
    setError("");
    setSaving(mode);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      price_kobo: Math.round(parseFloat(price) * 100),
      compare_at_kobo: discountEnabled && compareAt ? Math.round(parseFloat(compareAt) * 100) : null,
      external_url: deliverMode === "url" ? (deliveryUrl || null) : (uploadedFile?.url || null),
      active: mode === "publish",
      page_blocks: isEdit ? buildBlocksEdit() : buildBlocks(),
      meta_pixel_id: metaPixelId || null,
      meta_capi_token: metaCapiToken || null,
      tiktok_pixel_id: tiktokPixelId || null,
      from_name: fromName || null,
      from_email: fromEmail || null,
      webhook_url: webhookUrl || null,
    };

    const url = isEdit ? `/api/admin/products/${initialData!.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Save failed");
      setSaving(null);
    }
  };

  return (
    <div className="flex gap-10 items-start">
      {/* ── left: form ─────────────────────────────────────────── */}
      <div className="flex-1 max-w-2xl">

        {/* Section 1 – Select image */}
        <Section n={1} title="Select image">
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex items-center gap-6">
            {thumbnail ? (
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnail} alt="" className="w-20 h-20 object-cover rounded-xl" />
                <button
                  onClick={() => setThumbnail("")}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                <Upload size={20} className="text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-400 mb-2">Thumbnail · 400×400</p>
              <input
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="Paste image URL…"
                className={inp}
              />
            </div>
          </div>
        </Section>

        {/* Section 2 – Write Description */}
        <Section n={2} title="Write Description">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Title <span className="text-red-400">*</span></label>
                <span className="text-xs text-gray-400">{name.length}/50</span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value.slice(0, 50))}
                placeholder="e.g. Ultimate Marketing Playbook"
                className={inp}
              />
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">URL slug</label>
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
              </div>
            )}

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Description</label>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what buyers are getting…"
                className={inp}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bullet points</label>
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
                      placeholder={`• Benefit ${i + 1}`}
                      className={inp}
                    />
                    {bullets.length > 1 && (
                      <button onClick={() => setBullets(bullets.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 shrink-0">
                        <Trash2 size={15} />
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

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Subtitle</label>
                <span className="text-xs text-gray-400">{subtitle.length}/100</span>
              </div>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value.slice(0, 100))}
                placeholder="We will deliver this file right to your inbox"
                className={inp}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Call-to-Action Button <span className="text-red-400">*</span></label>
                <span className="text-xs text-gray-400">{ctaText.length}/30</span>
              </div>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value.slice(0, 30))}
                placeholder="PURCHASE"
                className={inp}
              />
            </div>
          </div>
        </Section>

        {/* Section 3 – Set price */}
        <Section n={3} title="Set price">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Price (₦) <span className="text-red-400">*</span></label>
              </div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9999"
                className={inp}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Discount Price (₦)</label>
                <button
                  onClick={() => setDiscountEnabled(!discountEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${discountEnabled ? "bg-indigo-500" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${discountEnabled ? "translate-x-5" : ""}`} />
                </button>
              </div>
              <input
                type="number"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                placeholder="14999"
                disabled={!discountEnabled}
                className={`${inp} disabled:opacity-40 disabled:cursor-not-allowed`}
              />
            </div>
          </div>
        </Section>

        {/* Section 4 – Collect info */}
        <Section n={4} title="Collect info">
          <div className="space-y-2 mb-3">
            {collectFields.map((f) => (
              <div
                key={f.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                  f.hidden ? "bg-gray-50 border-gray-100 opacity-50" : "bg-gray-50 border-gray-200"
                }`}
              >
                <span className="w-5 flex items-center justify-center shrink-0">{f.icon}</span>
                <span className="flex-1 text-sm text-gray-700 font-medium">{f.label}</span>
                {f.locked ? (
                  <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Required</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Required</span>
                    <button
                      onClick={() =>
                        setCollectFields(collectFields.map((x) => x.id === f.id ? { ...x, required: !x.required } : x))
                      }
                      className={`relative w-8 h-4 rounded-full transition-colors ${f.required ? "bg-indigo-500" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${f.required ? "translate-x-4" : ""}`} />
                    </button>
                    <button
                      onClick={() =>
                        setCollectFields(collectFields.map((x) => x.id === f.id ? { ...x, hidden: !x.hidden } : x))
                      }
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {f.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      onClick={() => setCollectFields(collectFields.filter((x) => x.id !== f.id))}
                      className="text-gray-300 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {addingField ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="Field label (e.g. Company)"
                className={inp}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFieldLabel.trim()) {
                    setCollectFields([...collectFields, {
                      id: crypto.randomUUID(),
                      label: newFieldLabel.trim(),
                      icon: <span className="text-xs text-gray-400">✏</span>,
                      required: false,
                      hidden: false,
                    }]);
                    setNewFieldLabel("");
                    setAddingField(false);
                  }
                  if (e.key === "Escape") setAddingField(false);
                }}
              />
              <button
                onClick={() => {
                  if (newFieldLabel.trim()) {
                    setCollectFields([...collectFields, {
                      id: crypto.randomUUID(),
                      label: newFieldLabel.trim(),
                      icon: <span className="text-xs text-gray-400">✏</span>,
                      required: false,
                      hidden: false,
                    }]);
                    setNewFieldLabel("");
                  }
                  setAddingField(false);
                }}
                className="bg-indigo-500 text-white text-sm px-4 rounded-xl"
              >
                Add
              </button>
              <button onClick={() => setAddingField(false)} className="text-gray-400 hover:text-gray-600 text-sm px-2">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingField(true)}
              className="w-full border border-indigo-300 text-indigo-500 hover:bg-indigo-50 text-sm font-medium py-3 rounded-xl transition-colors"
            >
              + Add Field
            </button>
          )}
        </Section>

        {/* Section 5 – Deliver product */}
        <Section n={5} title="Upload your Digital Product">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setDeliverMode("file")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                deliverMode === "file"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Upload size={14} /> Upload File
            </button>
            <button
              onClick={() => setDeliverMode("url")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                deliverMode === "url"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Link2 size={14} /> Redirect to URL
            </button>
          </div>

          {deliverMode === "url" ? (
            <input
              type="url"
              value={deliveryUrl}
              onChange={(e) => setDeliveryUrl(e.target.value)}
              placeholder="https://your-platform.com/your-product"
              className={inp}
            />
          ) : (
            <div>
              <div
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-300 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Drag your file(s) here</p>
                <button className="mt-3 px-4 py-1.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFile({ name: file.name, url: URL.createObjectURL(file) });
                    }
                  }}
                />
              </div>
              {uploadedFile && (
                <div className="mt-3 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{uploadedFile.name}</span>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Advanced settings (edit mode) */}
        {isEdit && (
          <div className="mb-10">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium mb-4"
            >
              <span>{showSettings ? "▾" : "▸"}</span> Advanced settings (Pixels, Webhooks)
            </button>
            {showSettings && (
              <div>
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
                  {SETTINGS_TABS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSettingsTab(t)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        settingsTab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {settingsTab === "Pixels" && (
                  <div className="space-y-5">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-0.5">Meta (Facebook) Pixel</p>
                        <p className="text-xs text-gray-400 mb-3">Per-product — overrides any global setting.</p>
                        <div className="space-y-3">
                          <input type="text" value={metaPixelId} onChange={(e) => setMetaPixelId(e.target.value)} placeholder="Pixel ID" className={inp} />
                          <input type="password" value={metaCapiToken} onChange={(e) => setMetaCapiToken(e.target.value)} placeholder="Conversions API Token" className={inp} />
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-gray-800 mb-0.5">TikTok Pixel</p>
                        <p className="text-xs text-gray-400 mb-3">PageView + Purchase events.</p>
                        <input type="text" value={tiktokPixelId} onChange={(e) => setTiktokPixelId(e.target.value)} placeholder="Pixel ID" className={inp} />
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === "Email & Webhooks" && (
                  <div className="space-y-5">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-0.5">Cart abandonment sender</p>
                        <p className="text-xs text-gray-400 mb-3">Recovery emails appear to come from this name and address.</p>
                        <div className="space-y-3">
                          <input type="text" value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="From name" className={inp} />
                          <input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="From email" className={inp} />
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-gray-800 mb-0.5">Email marketing webhook</p>
                        <p className="text-xs text-gray-400 mb-3">POST on purchase and cart abandonment — works with Zapier, Make, Klaviyo, and more.</p>
                        <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://hooks.zapier.com/…" className={inp} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
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
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl mb-4">{error}</p>
        )}

        {/* Bottom actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={() => router.push("/admin/products")}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave("draft")}
              disabled={!!saving}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {saving === "draft" ? "Saving…" : "💾 Save As Draft"}
            </button>
            <button
              onClick={() => handleSave("publish")}
              disabled={!!saving}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              {saving === "publish" ? "Publishing…" : isEdit ? "Save Changes" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* ── right: live preview ─────────────────────────────────── */}
      <div className="hidden lg:block sticky top-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Preview</p>
        <PreviewCard
          name={name}
          subtitle={subtitle}
          price={price}
          compareAt={discountEnabled ? compareAt : ""}
          thumbnail={thumbnail}
          ctaText={ctaText}
        />
      </div>
    </div>
  );
}
