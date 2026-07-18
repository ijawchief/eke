"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { CURRENCIES, Currency } from "@/lib/currency";

export function AffiliateCurrencySwitcher({ current }: { current: Currency }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) { setOpen(false); setSearch(""); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (code: string) => {
    document.cookie = `affiliate_currency=${code}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setOpen(false); setSearch("");
    router.refresh();
  };

  const cur = CURRENCIES.find((c) => c.code === current) ?? CURRENCIES[0];
  const filtered = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
      >
        <span>{cur.code} — {cur.label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 z-50 w-64 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search size={13} className="text-gray-400 flex-shrink-0" />
              <input autoFocus type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency…"
                className="bg-transparent text-sm w-full focus:outline-none text-gray-700 placeholder-gray-400" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-64">
            {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-4">No results</p>}
            {filtered.map((c) => (
              <button key={c.code} onClick={() => select(c.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  c.code === current ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                }`}>
                <span className="w-8 text-xs font-bold text-gray-500">{c.code}</span>
                <span>{c.label}</span>
                <span className="ml-auto text-gray-400 text-xs">{c.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
