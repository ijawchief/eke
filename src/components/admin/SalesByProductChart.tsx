"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#ea580c", "#f97316", "#3b82f6", "#10b981", "#8b5cf6"];

export function SalesByProductChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const topPct = total > 0 ? Math.round((data[0]?.value ?? 0) / total * 100) : 0;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10 }}
            formatter={(v) => [`₦${(Number(v) / 100).toLocaleString()}`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{topPct}%</p>
          <p className="text-xs text-gray-400">of Sales</p>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-2 space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-gray-600 truncate">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
