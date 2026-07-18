"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const TABS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

export function DashboardPeriodTabs({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  const go = (period: string, f?: string, t?: string) => {
    const p = new URLSearchParams({ period });
    if (period === "custom" && f) p.set("from", f);
    if (period === "custom" && t) p.set("to", t);
    router.push(`/admin?${p.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => go(tab.key, from, to)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            current === tab.key
              ? "bg-orange-600 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
      {current === "custom" && (
        <div className="flex items-center gap-2 ml-1">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onBlur={() => go("custom", from, to)}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <span className="text-gray-400 text-xs">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onBlur={() => go("custom", from, to)}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      )}
    </div>
  );
}
