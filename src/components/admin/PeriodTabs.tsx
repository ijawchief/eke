"use client";

import { useRouter, usePathname } from "next/navigation";

export function PeriodTabs({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {["day", "week", "month"].map((p) => (
        <button
          key={p}
          onClick={() => router.push(`${pathname}?period=${p}`)}
          className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
            current === p ? "bg-orange-600 text-white" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );
}
