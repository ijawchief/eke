"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const TABS = [
  { key: "today", label: "Today" },
  { key: "week",  label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

export function PeriodTabs({ period, from, to }: { period: string; from?: string; to?: string }) {
  const router   = useRouter();
  const pathname = usePathname();

  const today = new Date().toISOString().slice(0, 10);
  const [customFrom, setCustomFrom] = useState(from ?? today);
  const [customTo,   setCustomTo]   = useState(to   ?? today);
  const [showCustom, setShowCustom] = useState(period === "custom");

  const go = (key: string, f?: string, t?: string) => {
    const params = new URLSearchParams({ period: key });
    if (key === "custom" && f && t) { params.set("from", f); params.set("to", t); }
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeTab = period === "custom" ? "custom" : period;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              if (key === "custom") { setShowCustom(true); return; }
              setShowCustom(false);
              go(key);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === key
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 shadow-sm"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={customFrom}
            max={customTo}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="date"
            value={customTo}
            min={customFrom}
            max={today}
            onChange={(e) => setCustomTo(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={() => go("custom", customFrom, customTo)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700 transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
