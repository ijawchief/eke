"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

interface Props {
  mode: "create" | "edit";
  productId?: string;
  initial?: {
    name: string;
    slug: string;
    price_kobo: number;
    description: string;
    thumbnail_url: string;
    active: boolean;
  };
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function CreatorProductForm({ mode, productId, initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [priceStr, setPriceStr] = useState(initial ? String(initial.price_kobo / 100) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url ?? "");
  const [active, setActive] = useState(initial?.active ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleNameChange = (v: string) => {
    setName(v);
    if (mode === "create") setSlug(slugify(v));
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim() || !priceStr) { setError("Name, slug and price are required"); return; }
    const price_kobo = Math.round(parseFloat(priceStr) * 100);
    if (isNaN(price_kobo) || price_kobo <= 0) { setError("Enter a valid price"); return; }

    setSaving(true); setError("");
    const url = mode === "create" ? "/api/creator/products" : `/api/creator/products/${productId}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, slug, price_kobo, description, thumbnail_url: thumbnailUrl || null, active }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to save"); setSaving(false); return; }
    setSaved(true);
    setTimeout(() => {
      if (mode === "create") router.push(`/creator/products/${data.id}`);
      else { setSaved(false); router.refresh(); }
    }, 800);
    setSaving(false);
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition";

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Name</label>
        <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Social Media Masterclass" className={inp} />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL Slug</label>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-400">
          <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 whitespace-nowrap">veelage.co/p/</span>
          <input type="text" value={slug} onChange={(e) => setSlug(slugify(e.target.value))}
            className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-white" placeholder="my-product" />
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price (₦)</label>
        <input type="number" value={priceStr} onChange={(e) => setPriceStr(e.target.value)}
          placeholder="5000" min="0" step="100" className={inp} />
      </div>

      {/* Thumbnail URL */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Thumbnail URL <span className="font-normal text-gray-400">(optional)</span></label>
        <input type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://…" className={inp} />
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" className="mt-2 w-24 h-24 object-cover rounded-xl border border-gray-100" onError={(e) => (e.currentTarget.style.display = "none")} />
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description <span className="font-normal text-gray-400">(optional)</span></label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          rows={5} placeholder="Describe what your product includes…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none" />
      </div>

      {/* Status */}
      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm font-semibold text-gray-800">Published</p>
          <p className="text-xs text-gray-400">{active ? "Visible to buyers" : "Hidden — draft only"}</p>
        </div>
        <button type="button" onClick={() => setActive(v => !v)}
          className={`relative w-10 h-6 rounded-full transition-colors ${active ? "bg-orange-600" : "bg-gray-200"}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? "translate-x-5" : "translate-x-1"}`} />
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving || saved}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : null}
          {saving ? "Saving…" : saved ? "Saved!" : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
        <button onClick={() => router.push("/creator/products")}
          className="px-6 py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors font-semibold">
          Cancel
        </button>
      </div>
    </div>
  );
}
