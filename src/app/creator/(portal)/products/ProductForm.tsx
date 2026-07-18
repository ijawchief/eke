"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, EyeOff, Upload, Link2, X, Download, Image as ImageIcon, ShoppingCart, Settings2 } from "lucide-react";
import { Block } from "@/types";
import { cleanHtml } from "@/lib/cleanHtml";

/* ─── tokens ─────────────────────────────────────────────────── */
const PINK = "#ea580c";

const STEP_COLORS = [
  { bg: "#f3f0ff", text: "#7c3aed", border: "#ddd6fe", pill: "#7c3aed" },
  { bg: "#fff7ed", text: "#ea580c", border: "#fff7ed", pill: "#ea580c" },
  { bg: "#ecfeff", text: "#0891b2", border: "#cffafe", pill: "#0891b2" },
];

const SECTION_ACCENT = ["#7c3aed", "#7c3aed", "#ea580c", "#ea580c", "#ea580c", "#ea580c", "#0891b2", "#0891b2", "#0891b2"];

const inp = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white`;

/* ─── step tab bar ───────────────────────────────────────────── */
const STEPS = [
  { id: 0, label: "Thumbnail",       Icon: ImageIcon },
  { id: 1, label: "Product Details", Icon: ShoppingCart },
  { id: 2, label: "Options",         Icon: Settings2 },
] as const;

function StepTabs({ current, unlocked, onSelect }: { current: number; unlocked: number; onSelect: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map(({ id, label, Icon }) => {
        const active = current === id;
        const accessible = id <= unlocked;
        const c = STEP_COLORS[id];
        return (
          <button key={id} onClick={() => accessible && onSelect(id)} disabled={!accessible}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${accessible ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
            style={active ? { background: c.bg, color: c.text, borderColor: c.border } : { background: "transparent", color: "#374151", borderColor: "transparent" }}>
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Label({ n, text }: { n: number; text: string }) {
  const accent = SECTION_ACCENT[n - 1] ?? PINK;
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: accent }}>{n}</div>
      <h2 className="text-sm font-semibold text-gray-800">{text}</h2>
    </div>
  );
}

/* ─── rich text editor ───────────────────────────────────────── */
function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  useEffect(() => {
    if (!htmlMode && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlMode]);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleImgUpload = async (file: File) => {
    setImgUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/creator/upload", { method: "POST", body: form, credentials: "include" });
    const data = await res.json();
    if (data.url) exec("insertImage", data.url);
    setImgUploading(false);
  };

  const Btn = ({ onClick, title, active, children }: { onClick: () => void; title: string; active?: boolean; children: React.ReactNode }) => (
    <button type="button" title={title} onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded text-sm font-medium transition-colors ${active ? "bg-orange-100 text-orange-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}>
      {children}
    </button>
  );

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-white">
        {!htmlMode && (
          <>
            <Btn onClick={() => exec("formatBlock", "p")} title="Normal"><span className="text-[10px] font-bold border border-gray-400 px-0.5 rounded">A</span></Btn>
            <Btn onClick={() => exec("bold")} title="Bold"><b>B</b></Btn>
            <Btn onClick={() => exec("italic")} title="Italic"><i>I</i></Btn>
            <Btn onClick={() => exec("insertUnorderedList")} title="Bullet list">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="2" cy="3.5" r="1.5" fill="currentColor"/><rect x="5" y="2.5" width="8" height="2" rx="1" fill="currentColor"/><circle cx="2" cy="7" r="1.5" fill="currentColor"/><rect x="5" y="6" width="8" height="2" rx="1" fill="currentColor"/><circle cx="2" cy="10.5" r="1.5" fill="currentColor"/><rect x="5" y="9.5" width="8" height="2" rx="1" fill="currentColor"/></svg>
            </Btn>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <Btn onClick={() => imgInputRef.current?.click()} title={imgUploading ? "Uploading…" : "Upload image"}>
              {imgUploading
                ? <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="4.5" cy="4.5" r="1" fill="currentColor"/><path d="M1 10l3-3 2 2 3-4 4 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
            </Btn>
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden"
              onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleImgUpload(f); e.target.value = ""; }} />
            <Btn onClick={() => { const u = prompt("Video URL"); if (u) exec("insertHTML", `<br/><a href="${u}">${u}</a><br/>`); }} title="Video">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="9" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M10 5.5l3-2v7l-3-2V5.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </Btn>
            <Btn onClick={() => { const u = prompt("URL"); if (u) exec("createLink", u); }} title="Link">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5.5 8.5a3 3 0 004.243 0l1.414-1.414a3 3 0 00-4.243-4.243L5.5 4.257" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8.5 5.5a3 3 0 00-4.243 0L2.843 6.914a3 3 0 004.243 4.243L8.5 9.743" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </Btn>
          </>
        )}
        <div className="flex-1" />
        <Btn onClick={() => { if (!htmlMode && editorRef.current) onChange(editorRef.current.innerHTML); setHtmlMode(!htmlMode); }} title={htmlMode ? "Visual editor" : "HTML"} active={htmlMode}>
          <span className="text-[10px] font-bold">&lt;/&gt;</span>
        </Btn>
      </div>
      {htmlMode ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[200px] px-4 py-3 text-xs text-gray-700 focus:outline-none font-mono resize-y bg-transparent"
          placeholder="<p>Enter HTML here…</p>" spellCheck={false} />
      ) : (
        <div ref={editorRef} contentEditable suppressContentEditableWarning
          onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }}
          className="min-h-[160px] px-4 py-3 text-sm text-gray-700 focus:outline-none prose prose-sm max-w-none"
          style={{ lineHeight: 1.6 }} />
      )}
    </div>
  );
}

/* ─── types ──────────────────────────────────────────────────── */
interface CField { id: string; label: string; icon: string; required: boolean; hidden: boolean; locked?: boolean; }

interface CreatorProductFormProps {
  initialData?: {
    id: string; name: string; slug: string; price_kobo: number;
    compare_at_kobo: number | null; external_url: string | null;
    active: boolean; page_blocks: Block[];
    meta_pixel_id?: string | null; meta_capi_token?: string | null;
    tiktok_pixel_id?: string | null; from_name?: string | null;
    from_email?: string | null; webhook_url?: string | null;
  };
}

/* ─── main ───────────────────────────────────────────────────── */
export function CreatorProductForm({ initialData }: CreatorProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [unlocked, setUnlocked] = useState(isEdit ? 2 : 0);

  const [thumbnail, setThumbnail] = useState<string>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "image");
    return b ? (b.data.url as string) ?? "" : "";
  });
  const [thumbUploading, setThumbUploading] = useState(false);
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");

  const [descBody, setDescBody] = useState<string>(() => {
    const t = (initialData?.page_blocks ?? []).find((b) => b.type === "text");
    if (t?.data?.html) return t.data.html as string;
    if (t?.data?.content) return `<p>${t.data.content as string}</p>`;
    return "";
  });
  const [headline, setHeadline] = useState<string>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "hero");
    const stored = b ? (b.data.headline as string) ?? "" : "";
    return stored === (initialData?.name ?? "") ? "" : stored;
  });
  const [subtitle, setSubtitle] = useState<string>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "hero");
    return b ? (b.data.subheadline as string) ?? "" : "";
  });
  const [rating, setRating] = useState<number>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "hero");
    return b ? (b.data.rating as number) ?? 0 : 0;
  });
  const [author, setAuthor] = useState<string>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "hero");
    return b ? (b.data.author as string) ?? "" : "";
  });
  const [ctaText, setCtaText] = useState("PURCHASE");
  const [price, setPrice] = useState(initialData ? String(initialData.price_kobo / 100) : "");
  const [discountEnabled, setDiscountEnabled] = useState(!!initialData?.compare_at_kobo);
  const [compareAt, setCompareAt] = useState(initialData?.compare_at_kobo ? String(initialData.compare_at_kobo / 100) : "");
  const [collectFields, setCollectFields] = useState<CField[]>([
    { id: "name",  label: "Name",        icon: "A", required: false, hidden: false, locked: false },
    { id: "email", label: "Email",        icon: "✉", required: true,  hidden: false, locked: true  },
    { id: "phone", label: "Phone Number", icon: "☎", required: false, hidden: false, locked: false },
  ]);
  const [addingField, setAddingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [deliverMode, setDeliverMode] = useState<"file" | "url">("file");
  const [deliveryUrl, setDeliveryUrl] = useState(initialData?.external_url ?? "");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [faqItems, setFaqItems] = useState<{ id: string; q: string; a: string }[]>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "faq");
    return b ? (b.data.items as { id: string; q: string; a: string }[]) ?? [] : [];
  });

  const [themeColor, setThemeColor] = useState<string>(() => {
    const b = (initialData?.page_blocks ?? []).find((b) => b.type === "theme");
    return b ? (b.data.color as string) ?? PINK : PINK;
  });
  const [active, setActive] = useState(initialData?.active ?? true);
  const [metaPixelId, setMetaPixelId] = useState(initialData?.meta_pixel_id ?? "");
  const [metaCapiToken, setMetaCapiToken] = useState(initialData?.meta_capi_token ?? "");
  const [tiktokPixelId, setTiktokPixelId] = useState(initialData?.tiktok_pixel_id ?? "");
  const [fromName, setFromName] = useState(initialData?.from_name ?? "");
  const [fromEmail, setFromEmail] = useState(initialData?.from_email ?? "");
  const [webhookUrl, setWebhookUrl] = useState(initialData?.webhook_url ?? "");
  const [optionsTab, setOptionsTab] = useState<"Pixels" | "Email & Webhooks">("Pixels");

  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [stepError, setStepError] = useState("");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const buildBlocks = useCallback((): Block[] => {
    const blocks: Block[] = [];
    if (name) blocks.push({ id: crypto.randomUUID(), type: "hero", data: { headline, subheadline: subtitle, badge: "", rating, author } });
    if (descBody.trim()) blocks.push({ id: crypto.randomUUID(), type: "text", data: { html: cleanHtml(descBody), content: stripHtml(descBody) } });
    if (thumbnail) blocks.push({ id: crypto.randomUUID(), type: "image", data: { url: thumbnail, alt: name } });
    if (faqItems.length) blocks.push({ id: crypto.randomUUID(), type: "faq", data: { items: faqItems } });
    blocks.push({ id: crypto.randomUUID(), type: "theme", data: { color: themeColor } });
    return blocks;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, headline, subtitle, rating, author, descBody, thumbnail, faqItems, themeColor]);

  const buildBlocksEdit = useCallback((): Block[] => {
    const existing = initialData?.page_blocks ?? [];
    const others = existing.filter((b) => !["hero", "text", "image", "faq", "theme"].includes(b.type));
    const blocks: Block[] = [];
    if (name) {
      const h = existing.find((b) => b.type === "hero");
      blocks.push({ id: h?.id ?? crypto.randomUUID(), type: "hero", data: { headline, subheadline: subtitle, badge: h?.data.badge ?? "", rating, author } });
    }
    if (descBody.trim()) {
      const t = existing.find((b) => b.type === "text");
      blocks.push({ id: t?.id ?? crypto.randomUUID(), type: "text", data: { html: cleanHtml(descBody), content: stripHtml(descBody) } });
    }
    if (thumbnail) {
      const img = existing.find((b) => b.type === "image");
      blocks.push({ id: img?.id ?? crypto.randomUUID(), type: "image", data: { url: thumbnail, alt: name } });
    }
    if (faqItems.length) blocks.push({ id: crypto.randomUUID(), type: "faq", data: { items: faqItems } });
    return [...blocks, ...others, { id: crypto.randomUUID(), type: "theme", data: { color: themeColor } }];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, name, headline, subtitle, rating, author, descBody, thumbnail, faqItems, themeColor]);

  const handleSave = async (mode: "draft" | "publish") => {
    if (!name) { setStepError("Product title is required"); return; }
    if (!price) { setStepError("Price is required"); return; }
    const priceKobo = Math.round(parseFloat(price) * 100);
    if (!priceKobo || isNaN(priceKobo) || priceKobo <= 0) { setStepError("Please enter a valid price"); return; }
    setStepError("");
    setSaving(mode);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      price_kobo: priceKobo,
      compare_at_kobo: discountEnabled && compareAt ? Math.round(parseFloat(compareAt) * 100) || null : null,
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
      isEdit ? `/api/creator/products/${initialData!.id}` : "/api/creator/products",
      { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) }
    );

    if (res.ok) { router.push("/creator/products"); router.refresh(); }
    else { const d = await res.json(); setStepError(d.error ?? "Save failed"); setSaving(null); }
  };

  const uploadFile = async (file: File, onDone: (url: string) => void) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/creator/upload", { method: "POST", body: form, credentials: "include" });
    const data = await res.json();
    if (data.url) onDone(data.url);
  };

  const advanceStep = () => {
    setStepError("");
    if (step === 0) {
      if (!name.trim()) { setStepError("Product title is required before continuing."); return; }
      if (!thumbnail) { setStepError("Please select a product image before continuing."); return; }
    }
    if (step === 1) {
      if (!price) { setStepError("Please set a price before continuing."); return; }
    }
    const next = step + 1;
    if (next <= 2) { setStep(next); setUnlocked(Math.max(unlocked, next)); }
  };

  const isLastStep = step === 2;

  return (
    <div>
      <StepTabs current={step} unlocked={unlocked} onSelect={setStep} />

      {/* ── STEP 0: Thumbnail ─────────────────────────────────── */}
      {step === 0 && (
        <div>
          {thumbnail && (
            <div className="relative mb-8 rounded-2xl overflow-hidden" style={{ width: 200, height: 200 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#f3f4f6" }} />
              <button onClick={() => setThumbnail("")}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="mb-10">
            <Label n={1} text="Product title" />
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-400">{name.length}/50 characters</span>
            </div>
            <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value.slice(0, 50))}
              placeholder="e.g. The Ultimate Content Playbook" className={inp} />
            {!isEdit && (
              <div className="mt-3 flex items-center rounded-xl overflow-hidden border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
                <span className="px-3 py-3 text-sm text-gray-400 shrink-0 border-r border-gray-200">/p/</span>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-product" className="flex-1 px-3 py-3 text-sm focus:outline-none text-gray-800 placeholder-gray-400 bg-transparent" />
              </div>
            )}
          </div>

          <div className="mb-10">
            <Label n={2} text="Select image" />
            <div className="rounded-2xl cursor-pointer transition-all overflow-hidden border-2 border-dashed border-violet-200 hover:border-violet-400"
              onClick={() => !thumbUploading && thumbInputRef.current?.click()}
              style={{ background: "linear-gradient(135deg, #f3f0ff 0%, #fff7ed 100%)" }}>
              <div className="flex flex-col items-center gap-5 py-12 px-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ea580c)" }}>
                  {thumbUploading
                    ? <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <Upload size={22} className="text-white" />
                  }
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold mb-1" style={{ color: "#7c3aed" }}>
                    {thumbUploading ? "Uploading image…" : "Drop your thumbnail here"}
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP · Recommended 400×400</p>
                </div>
                <button type="button" className="px-5 py-2 rounded-xl text-sm font-semibold text-white pointer-events-none shadow-sm"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ea580c)" }}>
                  Choose Image
                </button>
              </div>
              <input ref={thumbInputRef} type="file" accept="image/*" className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  setThumbUploading(true);
                  await uploadFile(f, setThumbnail);
                  setThumbUploading(false);
                  e.target.value = "";
                }} />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: Product Details ───────────────────────────── */}
      {step === 1 && (
        <div>
          <div className="mb-10">
            <Label n={3} text="Write Description" />
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs text-gray-500">Headline</label>
                  <span className="text-xs text-gray-400">{headline.length}/150</span>
                </div>
                <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value.slice(0, 150))}
                  placeholder={name || "Enter a compelling headline…"} className={inp} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Author / Creator Name</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith" className={inp} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Star Rating (shown on product page)</label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(rating === star ? 0 : star)}
                      style={{ fontSize: 28, color: star <= rating ? "#f59e0b" : "#d1d5db", lineHeight: 1, background: "none", border: "none", cursor: "pointer", padding: "0 2px" }}>
                      ★
                    </button>
                  ))}
                  {rating > 0 && <span className="text-xs text-gray-400 ml-2">{rating}.0 stars</span>}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Description Body</label>
                <RichEditor value={descBody} onChange={setDescBody} />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs text-gray-500">Call-to-Action Button</label>
                  <span className="text-xs text-gray-400">{ctaText.length}/30</span>
                </div>
                <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value.slice(0, 30))}
                  placeholder="PURCHASE" className={inp} />
              </div>
            </div>
          </div>

          <div className="mb-10">
            <Label n={4} text="Set price" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Price (₦) <span className="text-red-400">*</span></label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className={inp} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-gray-500">Discount Price (₦)</label>
                  <button onClick={() => setDiscountEnabled(!discountEnabled)}
                    className="relative w-9 h-5 rounded-full transition-colors"
                    style={{ background: discountEnabled ? PINK : "#d1d5db" }}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${discountEnabled ? "translate-x-4" : ""}`} />
                  </button>
                </div>
                <input type="number" value={compareAt} onChange={(e) => setCompareAt(e.target.value)}
                  placeholder="0.00" disabled={!discountEnabled}
                  className={`${inp} disabled:opacity-40 disabled:cursor-not-allowed`} />
              </div>
            </div>
          </div>

          <div className="mb-10">
            <Label n={5} text="Collect info" />
            <p className="text-xs text-gray-400 mb-3">Fields shown at checkout</p>
            <div className="space-y-2 mb-3">
              {collectFields.map((f) => (
                <div key={f.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 bg-white shadow-sm ${f.hidden ? "opacity-40" : ""}`}
                  style={{ borderLeftColor: PINK, borderTop: "1px solid #fff7ed", borderRight: "1px solid #fff7ed", borderBottom: "1px solid #fff7ed" }}>
                  <span className="w-4 text-center text-xs text-gray-400 shrink-0">{f.icon}</span>
                  <span className="flex-1 text-sm text-gray-700">{f.label}</span>
                  {f.locked
                    ? <span className="text-xs text-gray-400">Required</span>
                    : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Required</span>
                        <button onClick={() => setCollectFields(collectFields.map((x) => x.id === f.id ? { ...x, required: !x.required } : x))}
                          className="relative w-8 h-4 rounded-full transition-colors shrink-0"
                          style={{ background: f.required ? PINK : "#d1d5db" }}>
                          <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${f.required ? "translate-x-4" : ""}`} />
                        </button>
                        <button onClick={() => setCollectFields(collectFields.map((x) => x.id === f.id ? { ...x, hidden: !x.hidden } : x))}
                          className="text-gray-400 hover:text-gray-600">
                          {f.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button onClick={() => setCollectFields(collectFields.filter((x) => x.id !== f.id))}
                          className="text-gray-300 hover:text-red-400"><X size={13} /></button>
                      </div>
                    )
                  }
                </div>
              ))}
            </div>
            {addingField ? (
              <div className="flex gap-2">
                <input type="text" value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="Field label (e.g. Company)" autoFocus className={inp}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newFieldLabel.trim()) {
                      setCollectFields([...collectFields, { id: crypto.randomUUID(), label: newFieldLabel.trim(), icon: "✏", required: false, hidden: false }]);
                      setNewFieldLabel(""); setAddingField(false);
                    }
                    if (e.key === "Escape") setAddingField(false);
                  }} />
                <button onClick={() => {
                  if (newFieldLabel.trim()) setCollectFields([...collectFields, { id: crypto.randomUUID(), label: newFieldLabel.trim(), icon: "✏", required: false, hidden: false }]);
                  setNewFieldLabel(""); setAddingField(false);
                }} className="text-white text-sm px-4 rounded-xl shrink-0" style={{ background: PINK }}>Add</button>
                <button onClick={() => setAddingField(false)} className="text-gray-400 text-sm px-2">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setAddingField(true)}
                className="w-full py-3 rounded-xl text-sm font-medium border border-orange-400 text-orange-600 transition-colors hover:bg-orange-50">
                + Add Field
              </button>
            )}
          </div>

          <div className="mb-10">
            <Label n={6} text="Upload your Digital Product" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400">Files are sent to the customer automatically after purchase</p>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 shrink-0 ml-4">
                <button onClick={() => setDeliverMode("file")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${deliverMode === "file" ? "bg-orange-600 text-white" : "bg-white text-gray-500 hover:text-gray-700"}`}>
                  <Upload size={12} /> Upload File
                </button>
                <button onClick={() => setDeliverMode("url")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${deliverMode === "url" ? "bg-orange-600 text-white" : "bg-white text-gray-500 hover:text-gray-700"}`}>
                  <Link2 size={12} /> Redirect to URL
                </button>
              </div>
            </div>
            {deliverMode === "url" ? (
              <input type="url" value={deliveryUrl} onChange={(e) => setDeliveryUrl(e.target.value)}
                placeholder="https://your-platform.com/your-product" className={inp} />
            ) : (
              <div>
                <div className="rounded-2xl p-8 text-center cursor-pointer transition-all border-2 border-dashed border-orange-300 hover:border-orange-500"
                  style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ecfeff 100%)" }}
                  onClick={() => !fileUploading && fileInputRef.current?.click()}>
                  {fileUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin w-6 h-6" style={{ color: PINK }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <p className="text-sm text-gray-400">Uploading…</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-400 mb-3">Drag your file here</p>
                      <button className="px-4 py-1.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 pointer-events-none">Upload</button>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]; if (!f) return;
                      setFileUploading(true);
                      await uploadFile(f, (url) => setUploadedFile({ name: f.name, url }));
                      setFileUploading(false);
                      e.target.value = "";
                    }} />
                </div>
                {uploadedFile && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3 border border-gray-100 bg-gray-50">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="flex-1 text-sm text-gray-700 truncate">{uploadedFile.name}</span>
                    <a href={uploadedFile.url} download className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-white">
                      <Download size={11} /> Download
                    </a>
                    <button onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-10">
            <Label n={7} text="FAQ (optional)" />
            <p className="text-xs text-gray-400 mb-3">Add questions and answers shown on the product page</p>
            <div className="space-y-3 mb-3">
              {faqItems.map((item, i) => (
                <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="text" value={item.q}
                      onChange={(e) => setFaqItems(faqItems.map((x, j) => j === i ? { ...x, q: e.target.value } : x))}
                      placeholder="Question" className={`${inp} text-sm font-medium`} />
                    <button onClick={() => setFaqItems(faqItems.filter((_, j) => j !== i))}
                      className="text-gray-300 hover:text-red-400 shrink-0"><X size={14} /></button>
                  </div>
                  <textarea value={item.a}
                    onChange={(e) => setFaqItems(faqItems.map((x, j) => j === i ? { ...x, a: e.target.value } : x))}
                    placeholder="Answer" rows={2} className={`${inp} resize-none text-sm`} />
                </div>
              ))}
            </div>
            <button onClick={() => setFaqItems([...faqItems, { id: crypto.randomUUID(), q: "", a: "" }])}
              className="w-full py-3 rounded-xl text-sm font-medium border border-orange-400 text-orange-600 transition-colors hover:bg-orange-50">
              + Add FAQ
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Options ───────────────────────────────────── */}
      {step === 2 && (
        <div>
          <div className="mb-8">
            <Label n={7} text="Page colour" />
            <p className="text-xs text-gray-400 mb-3">Pick an accent colour for your product page</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Orange", color: "#ea580c" },
                { label: "Violet", color: "#7c3aed" },
                { label: "Blue",   color: "#2563eb" },
                { label: "Cyan",   color: "#0891b2" },
                { label: "Green",  color: "#16a34a" },
                { label: "Red",    color: "#dc2626" },
                { label: "Black",  color: "#111827" },
              ].map(({ label, color }) => (
                <button key={color} onClick={() => setThemeColor(color)} title={label}
                  style={{ background: color, width: 36, height: 36, borderRadius: "50%", border: themeColor === color ? `3px solid ${color}` : "3px solid transparent", outline: themeColor === color ? "2px solid #fff" : "none", outlineOffset: 2, boxShadow: themeColor === color ? `0 0 0 3px ${color}55` : "none", transition: "all 0.15s", flexShrink: 0 }} />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <Label n={8} text="Visibility" />
            <div className="flex items-center justify-between rounded-xl px-4 py-4 border border-cyan-100"
              style={{ background: "linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)" }}>
              <div>
                <p className="text-sm font-medium text-gray-700">Product active</p>
                <p className="text-xs text-gray-400 mt-0.5">Visible and purchasable by buyers</p>
              </div>
              <button onClick={() => setActive(!active)} className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: active ? PINK : "#d1d5db" }}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <Label n={9} text="Tracking pixels" />
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Meta Pixel ID</label>
                <input type="text" value={metaPixelId} onChange={(e) => setMetaPixelId(e.target.value)} placeholder="1234567890" className={inp} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Meta CAPI Token</label>
                <input type="password" value={metaCapiToken} onChange={(e) => setMetaCapiToken(e.target.value)} placeholder="••••••••" className={inp} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">TikTok Pixel ID</label>
                <input type="text" value={tiktokPixelId} onChange={(e) => setTiktokPixelId(e.target.value)} placeholder="ABCDE12345" className={inp} />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <Label n={10} text="Email & Webhooks" />
            <div className="flex gap-1 p-1 rounded-xl mb-4 border border-gray-200 bg-gray-50">
              {(["Pixels", "Email & Webhooks"] as const).map((t) => (
                <button key={t} onClick={() => setOptionsTab(t)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${optionsTab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                  {t}
                </button>
              ))}
            </div>
            {optionsTab === "Email & Webhooks" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">From name</label>
                  <input type="text" value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Your name or brand" className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">From email</label>
                  <input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="hello@yourbrand.com" className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Webhook URL</label>
                  <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://hooks.zapier.com/…" className={inp} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom bar ────────────────────────────────────────── */}
      {stepError && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-xl">{stepError}</p>
      )}

      <div className="flex items-center justify-between pt-5 border-t border-gray-100">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.push("/creator/products")}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          {step === 0 ? "Cancel" : "← Back"}
        </button>

        <div className="flex items-center gap-3">
          <button onClick={() => handleSave("draft")} disabled={!!saving}
            className="border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {saving === "draft" ? "Saving…" : "Save Draft"}
          </button>

          {isLastStep ? (
            <button onClick={() => handleSave("publish")} disabled={!!saving}
              className="text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 transition-all shadow-md"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ea580c)", boxShadow: "0 4px 16px #ea580c44" }}>
              {saving === "publish" ? "Publishing…" : isEdit ? "Save Changes" : "🚀 Publish"}
            </button>
          ) : (
            <button onClick={advanceStep}
              className="text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md"
              style={{ background: STEP_COLORS[step].pill, boxShadow: `0 4px 14px ${STEP_COLORS[step].pill}44` }}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
