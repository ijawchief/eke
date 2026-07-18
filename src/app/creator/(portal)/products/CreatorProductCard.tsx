"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, MoreHorizontal, Pencil, ExternalLink, EyeOff, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  name: string;
  slug: string;
  price: string;
  active: boolean;
  earned: string;
  sales: number;
  thumb: string | null;
}

export function CreatorProductCard({ id, name, slug, price, active, earned, sales, thumb }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function togglePublish() {
    setOpen(false);
    await fetch(`/api/creator/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  async function deleteProduct() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setOpen(false);
    setDeleting(true);
    const res = await fetch(`/api/creator/products/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Delete failed: ${data.error ?? res.statusText}`);
      setDeleting(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 sm:py-5 hover:shadow-md transition-shadow ${deleting ? "opacity-40 pointer-events-none" : ""}`}>
      {/* Thumbnail */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100">
        {thumb
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={thumb} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
              <span className="text-2xl font-bold text-orange-600">{name.charAt(0).toUpperCase()}</span>
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug truncate">{name}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            {active ? "Live" : "Draft"}
          </span>
        </div>
        <p className="text-sm font-bold text-orange-600 mb-1">{price}</p>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={11} className="text-green-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-green-600">{earned}</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{sales} {sales === 1 ? "sale" : "sales"}</span>
        </div>
      </div>

      {/* 3-dot menu */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button onClick={() => setOpen((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal size={16} />
        </button>
        {open && (
          <div className="absolute right-0 top-10 z-50 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5">
            <Link href={`/creator/products/${id}`} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <Pencil size={14} className="text-gray-400" /> Edit
            </Link>
            <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <ExternalLink size={14} className="text-gray-400" /> View page
            </a>
            <button onClick={togglePublish}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              {active ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
              {active ? "Unpublish" : "Publish"}
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button onClick={deleteProduct}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
