"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  data: { value: number }[];
  color?: string;
  startLabel?: string;
  endLabel?: string;
}

export function MiniSparkline({ data, color = "#ea580c", startLabel, endLabel }: Props) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#sg-${color.replace("#", "")})`}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            contentStyle={{ background: "#1e1e35", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }}
            itemStyle={{ color: "#fff" }}
            formatter={(v) => [Number(v).toLocaleString(), ""]}
            labelFormatter={() => ""}
          />
        </AreaChart>
      </ResponsiveContainer>
      {(startLabel || endLabel) && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">{startLabel}</span>
          <span className="text-xs text-gray-400">{endLabel}</span>
        </div>
      )}
    </div>
  );
}
