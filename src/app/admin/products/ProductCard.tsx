"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { GripVertical, Download, TrendingUp, MoreHorizontal, Pencil, ExternalLink, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const PINK = "#e91e8c";

interface Props {
  id: string;
  name: string;
  slug: string;
  price: string;
  active: boolean;
  hasFile: boolean;
  earned: string;
  sales: number;
  thumb: string | null;
}

export function ProductCard({ id, name, slug, price, active, hasFile, earned, sales, thumb }: Props) {
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
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  async function deleteProduct() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setOpen(false);
    setDeleting(true);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 px-5 py-5 hover:shadow-md transition-shadow ${deleting ? "opacity-40 pointer-events-none" : ""}`}>
      <GripVertical size={16} className="text-gray-300 shrink-0 cursor-grab" />

      {/* Thumbnail */}
      <div className="w-[200px] h-[200px] rounded-2xl overflow-hidden shrink-0 border border-gray-100">
        {thumb
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={thumb} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f3f0ff, #fff0f8)" }}>
              <span className="text-4xl font-bold" style={{ color: PINK }}>
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="font-bold text-gray-900 text-base leading-snug">{name}</p>
          {hasFile && <Download size={13} className="text-gray-400 shrink-0" />}
          {!active && (
            <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Draft</span>
          )}
        </div>
        <p className="text-base font-bold mb-2" style={{ color: PINK }}>{price}</p>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-green-500" />
          <span className="text-xs font-semibold text-green-600">{earned} earned</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{sales} {sales === 1 ? "sale" : "sales"}</span>
        </div>
      </div>

      {/* 3-dot menu */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>

        {open && (
          <div className="absolute right-0 top-10 z-50 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 overflow-hidden">
            <Link
              href={`/admin/products/${id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Pencil size={14} className="text-gray-400" /> Edit
            </Link>
            <a
              href={`/p/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={14} className="text-gray-400" /> View page
            </a>
            <button
              onClick={togglePublish}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <EyeOff size={14} className="text-gray-400" />
              {active ? "Unpublish" : "Publish"}
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button
              onClick={deleteProduct}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
