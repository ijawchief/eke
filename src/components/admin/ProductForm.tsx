"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Eye, EyeOff, Upload, Link2, FileText, X, Download } from "lucide-react";
import { Block } from "@/types";

/* ─── design tokens ─────────────────────────────────────────── */
const LAVENDER = "#f0f1ff";
const INDIGO = "#6366f1";

const field =
  `w-full rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 border-0`;
const fieldStyle = { background: LAVENDER };

/* ─── section header ─────────────────────────────────────────── */
function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-gray-500 shrink-0" style={{ background: LAVENDER }}>
          {n}
        </div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─── simple rich text editor ────────────────────────────────── */
function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const ToolBtn = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded hover:bg-indigo-100 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium"
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: LAVENDER }}>
      {/* toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-indigo-100">
        <ToolBtn onClick={() => exec("formatBlock", "p")} title="Normal text">
          <span className="text-xs font-bold border border-gray-400 px-0.5 rounded">A</span>
        </ToolBtn>
        <ToolBtn onClick={() => exec("bold")} title="Bold"><b>B</b></ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Italic"><i>I</i></ToolBtn>
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="Bullet list">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="2" cy="3.5" r="1.5" fill="currentColor"/><rect x="5" y="2.5" width="8" height="2" rx="1" fill="currentColor"/><circle cx="2" cy="7" r="1.5" fill="currentColor"/><rect x="5" y="6" width="8" height="2" rx="1" fill="currentColor"/><circle cx="2" cy="10.5" r="1.5" fill="currentColor"/><rect x="5" y="9.5" width="8" height="2" rx="1" fill="currentColor"/></svg>
        </ToolBtn>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolBtn onClick={() => exec("insertImage", prompt("Image URL") ?? "")} title="Image">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="4.5" cy="4.5" r="1" fill="currentColor"/><path d="M1 10l3-3 2 2 3-4 4 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </ToolBtn>
        <ToolBtn onClick={() => { const u = prompt("Video URL"); if (u) exec("insertHTML", `<br/><a href="${u}">${u}</a><br/>`); }} title="Video">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="9" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M10 5.5l3-2v7l-3-2V5.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
        </ToolBtn>
        <ToolBtn onClick={() => { const u = prompt("URL"); if (u) exec("createLink", u); }} title="Link">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 8.5a3 3 0 004.243 0l1.414-1.414a3 3 0 00-4.243-4.243L5.5 4.257" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8.5 5.5a3 3 0 00-4.243 0L2.843 6.914a3 3 0 004.243 4.243L8.5 9.743" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </ToolBtn>
      </div>
      {/* editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }}
        className="min-h-[160px] px-4 py-3 text-sm text-gray-700 focus:outline-none prose prose-sm max-w-none"
        style={{ lineHeight: 1.6 }}
      />
    </div>
  );
}

/* ─── live preview card ──────────────────────────────────────── */
function PreviewCard({ name, subtitle, price, compareAt, thumbnail, ctaText }: {
  name: string; subtitle: string; price: string; compareAt: string; thumbnail: string; ctaText: string;
}) {
  const fmt = (v: string) => v
    ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(parseFloat(v))
    : "";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm w-[200px]">
      {thumbnail
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={thumbnail} alt="" className="w-full h-28 object-cover" />
        : <div className="w-full h-28 bg-gray-50 flex items-center justify-center"><FileText size={28} className="text-gray-300" /></div>
      }
      <div className="p-3">
        <p className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{name || "Product title"}</p>
        {subtitle && <p className="text-xs text-gray-500 mb-2 leading-snug line-clamp-2">{subtitle}</p>}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-sm font-bold" style={{ color: INDIGO }}>{fmt(price) || "₦0"}</span>
          {compareAt && <span className="text-xs text-gray-400 line-through">{fmt(compareAt)}</span>}
        </div>
        <button className="w-full text-white text-xs font-bold py-2 rounded-xl uppercase tracking-wide" style={{ background: INDIGO }}>
          {ctaText || "PURCHASE"}
        </button>
      </div>
    </div>
  );
}

/* ─── collect field row ──────────────────────────────────────── */
interface CField { id: string; label: string; icon: string; required: boolean; hidden: boolean; locked?: boolean; }

/* ─── types ──────────────────────────────────────────────────── */
interface ProductFormProps {
  initialData?: {
    id: string; name: string; slug: string; price_kobo: number;
    compare_at_kobo: number | null; external_url: string | null;
    active: boolean; page_blocks: Block[];
    meta_pixel_id?: string | null; meta_capi_token?: string | null;
    tiktok_pixel_id?: string | null; from_name?: string | null;
    from_email?: string | null; webhook_url?: string | null;
  };
  defaultTab?: "page" | "tracking" | "email";
}

/* ─── main ───────────────────────────────────────────────────── */
export function ProductForm({ initialData, defaultTab = "page" }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  /* s1 – image */
  const [thumbnail, setThumbnail] = useState<string>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "image");
    return b ? (b.data.url as string) ?? "" : "";
  });
  const [thumbUploading, setThumbUploading] = useState(false);

  /* s2 – description */
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [descBody, setDescBody] = useState<string>(() => {
    const t = (initialData?.page_blocks ?? []).find((b) => b.type === "text");
    const bl = (initialData?.page_blocks ?? []).find((b) => b.type === "bullet_list");
    const hero = (initialData?.page_blocks ?? []).find((b) => b.type === "hero");
    let html = t ? `<p>${t.data.content as string}</p>` : "";
    if (bl) {
      const items = (bl.data.items as string[]).map((i) => `<li>${i}</li>`).join("");
      html += `<ul>${items}</ul>`;
    }
    if (!html && hero) html = `<p>${(hero.data.subheadline as string) ?? ""}</p>`;
    return html;
  });
  const [subtitle, setSubtitle] = useState<string>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "hero");
    return b ? (b.data.subheadline as string) ?? "" : "";
  });
  const [ctaText, setCtaText] = useState("PURCHASE");

  /* s3 – price */
  const [price, setPrice] = useState(initialData ? String(initialData.price_kobo / 100) : "");
  const [discountEnabled, setDiscountEnabled] = useState(!!initialData?.compare_at_kobo);
  const [compareAt, setCompareAt] = useState(initialData?.compare_at_kobo ? String(initialData.compare_at_kobo / 100) : "");

  /* s4 – collect info */
  const [collectFields, setCollectFields] = useState<CField[]>([
    { id: "name", label: "Name", icon: "A", required: false, hidden: false, locked: false },
    { id: "email", label: "Email", icon: "✉", required: true, hidden: false, locked: true },
    { id: "phone", label: "Phone Number", icon: "☎", required: false, hidden: false, locked: false },
  ]);
  const [addingField, setAddingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");

  /* s5 – deliver */
  const [deliverMode, setDeliverMode] = useState<"file" | "url">("file");
  const [deliveryUrl, setDeliveryUrl] = useState(initialData?.external_url ?? "");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  /* settings */
  const [active, setActive] = useState(initialData?.active ?? true);
  const [metaPixelId, setMetaPixelId] = useState(initialData?.meta_pixel_id ?? "");
  const [metaCapiToken, setMetaCapiToken] = useState(initialData?.meta_capi_token ?? "");
  const [tiktokPixelId, setTiktokPixelId] = useState(initialData?.tiktok_pixel_id ?? "");
  const [fromName, setFromName] = useState(initialData?.from_name ?? "");
  const [fromEmail, setFromEmail] = useState(initialData?.from_email ?? "");
  const [webhookUrl, setWebhookUrl] = useState(initialData?.webhook_url ?? "");
  const [showSettings, setShowSettings] = useState(defaultTab === "tracking" || defaultTab === "email");
  const [settingsTab, setSettingsTab] = useState<"Pixels" | "Email & Webhooks">(
    defaultTab === "email" ? "Email & Webhooks" : "Pixels"
  );

  /* save */
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState("");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const buildBlocks = useCallback((): Block[] => {
    const blocks: Block[] = [];
    if (name) blocks.push({ id: crypto.randomUUID(), type: "hero", data: { headline: name, subheadline: subtitle, badge: "" } });
    const text = stripHtml(descBody);
    if (text) blocks.push({ id: crypto.randomUUID(), type: "text", data: { content: text } });
    if (thumbnail) blocks.push({ id: crypto.randomUUID(), type: "image", data: { url: thumbnail, alt: name } });
    return blocks;
  }, [name, subtitle, descBody, thumbnail]);

  const buildBlocksEdit = useCallback((): Block[] => {
    const existing = initialData?.page_blocks ?? [];
    const others = existing.filter((b) => !["hero", "text", "image"].includes(b.type));
    const blocks: Block[] = [];
    if (name) {
      const h = existing.find((b) => b.type === "hero");
      blocks.push({ id: h?.id ?? crypto.randomUUID(), type: "hero", data: { headline: name, subheadline: subtitle, badge: h?.data.badge ?? "" } });
    }
    const text = stripHtml(descBody);
    if (text) {
      const t = existing.find((b) => b.type === "text");
      blocks.push({ id: t?.id ?? crypto.randomUUID(), type: "text", data: { content: text } });
    }
    if (thumbnail) {
      const img = existing.find((b) => b.type === "image");
      blocks.push({ id: img?.id ?? crypto.randomUUID(), type: "image", data: { url: thumbnail, alt: name } });
    }
    return [...blocks, ...others];
  }, [initialData, name, subtitle, descBody, thumbnail]);

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
      active: isEdit ? active : mode === "publish",
      page_blocks: isEdit ? buildBlocksEdit() : buildBlocks(),
      meta_pixel_id: metaPixelId || null,
      meta_capi_token: metaCapiToken || null,
      tiktok_pixel_id: tiktokPixelId || null,
      from_name: fromName || null,
      from_email: fromEmail || null,
      webhook_url: webhookUrl || null,
    };

    const res = await fetch(
      isEdit ? `/api/admin/products/${initialData!.id}` : "/api/admin/products",
      { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );

    if (res.ok) { router.push("/admin/products"); router.refresh(); }
    else { const d = await res.json(); setError(d.error ?? "Save failed"); setSaving(null); }
  };

  const uploadFile = async (file: File, onDone: (url: string) => void) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) onDone(data.url);
  };

  return (
    <div className="flex gap-12 items-start">
      {/* ── left ─────────────────────────────────────────────── */}
      <div className="flex-1 max-w-2xl">

        {/* 1 – Select image */}
        <Section n={1} title="Select image">
          <div
            className="border border-dashed border-gray-200 rounded-2xl p-5 flex items-center gap-5 cursor-pointer hover:border-indigo-300 transition-colors"
            onClick={() => !thumbUploading && thumbInputRef.current?.click()}
          >
            {thumbnail ? (
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnail} alt="" className="w-20 h-20 object-cover rounded-xl" />
                <button onClick={(e) => { e.stopPropagation(); setThumbnail(""); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center">
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0" style={{ background: LAVENDER }}>
                {thumbUploading
                  ? <svg className="animate-spin w-5 h-5" style={{ color: INDIGO }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : <Upload size={18} className="text-gray-400" />
                }
              </div>
            )}
            <div>
              <p className="text-sm text-gray-400 mb-3">Thumbnail · 400×400</p>
              <button className="px-4 py-1.5 rounded-xl text-sm text-gray-600 pointer-events-none border border-gray-200 hover:bg-gray-50">
                {thumbUploading ? "Uploading…" : "Choose Image"}
              </button>
            </div>
            <input ref={thumbInputRef} type="file" accept="image/*" className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                setThumbUploading(true);
                await uploadFile(f, setThumbnail);
                setThumbUploading(false);
                e.target.value = "";
              }}
            />
          </div>
        </Section>

        {/* 2 – Write Description */}
        <Section n={2} title="Write Description">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm text-gray-500">Description Title <span className="text-red-400">*</span></label>
                <span className="text-xs text-gray-400">{name.length}/50</span>
              </div>
              <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value.slice(0, 50))}
                placeholder="Get My Template Now!" className={field} style={fieldStyle} />
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">URL slug</label>
                <div className="flex items-center rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400" style={{ background: LAVENDER }}>
                  <span className="px-3 py-3 text-sm text-gray-400 shrink-0">/p/</span>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-product" className="flex-1 px-2 py-3 text-sm focus:outline-none text-gray-800 placeholder-gray-400 bg-transparent" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Description Body <span className="text-red-400">*</span></label>
              <RichEditor value={descBody} onChange={setDescBody} />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm text-gray-500">Bottom Title <span className="text-red-400">*</span></label>
                <span className="text-xs text-gray-400">{subtitle.length}/100</span>
              </div>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value.slice(0, 100))}
                placeholder="Get My Guide" className={field} style={fieldStyle} />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm text-gray-500">Call-to-Action Button <span className="text-red-400">*</span></label>
                <span className="text-xs text-gray-400">{ctaText.length}/30</span>
              </div>
              <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value.slice(0, 30))}
                placeholder="PURCHASE" className={field} style={fieldStyle} />
            </div>
          </div>
        </Section>

        {/* 3 – Set price */}
        <Section n={3} title="Set price">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm text-gray-500">Price (₦) <span className="text-red-400">*</span></label>
              </div>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="9.99" className={field} style={fieldStyle} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-gray-500">Discount Price (₦)</label>
                <button onClick={() => setDiscountEnabled(!discountEnabled)}
                  className="relative w-10 h-5 rounded-full transition-colors"
                  style={{ background: discountEnabled ? INDIGO : "#d1d5db" }}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${discountEnabled ? "translate-x-5" : ""}`} />
                </button>
              </div>
              <input type="number" value={compareAt} onChange={(e) => setCompareAt(e.target.value)}
                placeholder="7" disabled={!discountEnabled}
                className={`${field} disabled:opacity-40 disabled:cursor-not-allowed`} style={fieldStyle} />
            </div>
          </div>
        </Section>

        {/* 4 – Collect info */}
        <Section n={4} title="Collect info">
          <p className="text-xs text-gray-400 mb-3">Fields</p>
          <div className="space-y-2 mb-3">
            {collectFields.map((f) => (
              <div key={f.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-opacity ${f.hidden ? "opacity-40" : ""}`} style={{ background: LAVENDER }}>
                <span className="w-5 text-center text-xs text-gray-400 shrink-0">{f.icon}</span>
                <span className="flex-1 text-sm text-gray-700">{f.label}</span>
                {f.locked ? (
                  <span className="text-xs text-gray-400">Required</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Required</span>
                    <button onClick={() => setCollectFields(collectFields.map((x) => x.id === f.id ? { ...x, required: !x.required } : x))}
                      className="relative w-8 h-4 rounded-full transition-colors shrink-0"
                      style={{ background: f.required ? INDIGO : "#d1d5db" }}>
                      <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${f.required ? "translate-x-4" : ""}`} />
                    </button>
                    <button onClick={() => setCollectFields(collectFields.map((x) => x.id === f.id ? { ...x, hidden: !x.hidden } : x))}
                      className="text-gray-400 hover:text-gray-600">
                      {f.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => setCollectFields(collectFields.filter((x) => x.id !== f.id))}
                      className="text-gray-300 hover:text-red-400">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {addingField ? (
            <div className="flex gap-2">
              <input type="text" value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="Field label (e.g. Company)" autoFocus
                className={field} style={fieldStyle}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFieldLabel.trim()) {
                    setCollectFields([...collectFields, { id: crypto.randomUUID(), label: newFieldLabel.trim(), icon: "✏", required: false, hidden: false }]);
                    setNewFieldLabel(""); setAddingField(false);
                  }
                  if (e.key === "Escape") setAddingField(false);
                }}
              />
              <button onClick={() => { if (newFieldLabel.trim()) { setCollectFields([...collectFields, { id: crypto.randomUUID(), label: newFieldLabel.trim(), icon: "✏", required: false, hidden: false }]); setNewFieldLabel(""); } setAddingField(false); }}
                className="text-white text-sm px-4 rounded-xl shrink-0" style={{ background: INDIGO }}>
                Add
              </button>
              <button onClick={() => setAddingField(false)} className="text-gray-400 text-sm px-2">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setAddingField(true)}
              className="w-full py-3 rounded-xl text-sm font-medium border transition-colors hover:bg-indigo-50"
              style={{ borderColor: INDIGO, color: INDIGO }}>
              + Add Field
            </button>
          )}
        </Section>

        {/* 5 – Upload digital product */}
        <Section n={5} title="Upload your Digital Product">
          <div className="mb-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-gray-700 font-medium">Digital Product <span className="text-red-400">*</span></p>
                <p className="text-xs text-gray-400 mt-0.5">We will send these files automatically to your customer upon purchase!</p>
              </div>
              <div className="flex rounded-xl overflow-hidden border shrink-0" style={{ borderColor: INDIGO }}>
                <button onClick={() => setDeliverMode("file")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{ background: deliverMode === "file" ? INDIGO : "white", color: deliverMode === "file" ? "white" : INDIGO }}>
                  <Upload size={13} /> Upload File
                </button>
                <button onClick={() => setDeliverMode("url")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{ background: deliverMode === "url" ? INDIGO : "white", color: deliverMode === "url" ? "white" : INDIGO }}>
                  <Link2 size={13} /> Redirect to URL
                </button>
              </div>
            </div>

            {deliverMode === "url" ? (
              <input type="url" value={deliveryUrl} onChange={(e) => setDeliveryUrl(e.target.value)}
                placeholder="https://your-platform.com/your-product"
                className={`${field} mt-3`} style={fieldStyle} />
            ) : (
              <div>
                <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-300 transition-colors mt-3"
                  onClick={() => !fileUploading && fileInputRef.current?.click()}>
                  {fileUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin w-6 h-6" style={{ color: INDIGO }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <p className="text-sm text-gray-400">Uploading…</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-400 mb-3">Drag Your File(s) Here</p>
                      <button className="px-4 py-1.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 pointer-events-none">
                        Upload
                      </button>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]; if (!f) return;
                      setFileUploading(true);
                      await uploadFile(f, (url) => setUploadedFile({ name: f.name, url }));
                      setFileUploading(false);
                      e.target.value = "";
                    }}
                  />
                </div>

                {uploadedFile && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3 border border-gray-100" style={{ background: LAVENDER }}>
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="flex-1 text-sm text-gray-700 truncate">{uploadedFile.name}</span>
                    <a href={uploadedFile.url} download className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-white">
                      <Download size={12} /> Download
                    </a>
                    <button onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* Advanced (edit mode) */}
        {isEdit && (
          <div className="mb-10">
            <button onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium mb-4">
              <span>{showSettings ? "▾" : "▸"}</span> Advanced settings
            </button>
            {showSettings && (
              <div>
                <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: LAVENDER }}>
                  {(["Pixels", "Email & Webhooks"] as const).map((t) => (
                    <button key={t} onClick={() => setSettingsTab(t)}
                      className="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
                      style={{ background: settingsTab === t ? "white" : "transparent", color: settingsTab === t ? "#111" : "#9ca3af" }}>
                      {t}
                    </button>
                  ))}
                </div>
                {settingsTab === "Pixels" && (
                  <div className="space-y-3">
                    <input type="text" value={metaPixelId} onChange={(e) => setMetaPixelId(e.target.value)} placeholder="Meta Pixel ID" className={field} style={fieldStyle} />
                    <input type="password" value={metaCapiToken} onChange={(e) => setMetaCapiToken(e.target.value)} placeholder="Meta CAPI Token" className={field} style={fieldStyle} />
                    <input type="text" value={tiktokPixelId} onChange={(e) => setTiktokPixelId(e.target.value)} placeholder="TikTok Pixel ID" className={field} style={fieldStyle} />
                  </div>
                )}
                {settingsTab === "Email & Webhooks" && (
                  <div className="space-y-3">
                    <input type="text" value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="From name" className={field} style={fieldStyle} />
                    <input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="From email" className={field} style={fieldStyle} />
                    <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="Webhook URL" className={field} style={fieldStyle} />
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-3" style={{ background: LAVENDER }}>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Active</p>
                    <p className="text-xs text-gray-400">Visible to buyers</p>
                  </div>
                  <button onClick={() => setActive(!active)} className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ background: active ? INDIGO : "#d1d5db" }}>
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

        {/* Bottom actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 italic mr-auto">
            <button onClick={() => router.push("/admin/products")} className="hover:underline">Cancel</button>
          </p>
          <button onClick={() => handleSave("draft")} disabled={!!saving}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {saving === "draft" ? "Saving…" : "💾 Save As Draft"}
          </button>
          <button onClick={() => handleSave("publish")} disabled={!!saving}
            className="text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors"
            style={{ background: INDIGO }}>
            {saving === "publish" ? "Publishing…" : isEdit ? "Save Changes" : "Publish"}
          </button>
        </div>
      </div>

      {/* ── right: preview ───────────────────────────────────── */}
      <div className="hidden lg:block sticky top-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Preview</p>
        <PreviewCard name={name} subtitle={subtitle} price={price}
          compareAt={discountEnabled ? compareAt : ""} thumbnail={thumbnail} ctaText={ctaText} />
      </div>
    </div>
  );
}
