"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CURRENCIES } from "@/lib/currency";

export function RevenueChart({ data, currency }: { data: { label: string; value: number }[]; currency: string }) {
  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
          labelStyle={{ color: "#374151", fontWeight: 600 }}
          itemStyle={{ color: "#ec4899" }}
          formatter={(v) => [`${symbol}${Number(v).toLocaleString()}`, "Revenue"]}
        />
        <Bar dataKey="value" fill="#ec4899" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
