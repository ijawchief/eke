"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ISO alpha-2 → [longitude, latitude] centroids
const COUNTRY_COORDS: Record<string, [number, number]> = {
  NG: [8.6753, 9.082], US: [-95.7129, 37.0902], GB: [-3.435973, 55.378051],
  GH: [-1.0232, 7.9465], KE: [37.9062, 0.0236], ZA: [22.9375, -30.5595],
  IN: [78.9629, 20.5937], CA: [-106.3468, 56.1304], AU: [133.7751, -25.2744],
  DE: [10.4515, 51.1657], FR: [2.2137, 46.2276], BR: [-51.9253, -14.235],
  EG: [30.8025, 26.8206], ET: [40.4897, 9.145], TZ: [34.8888, -6.369],
  UG: [32.2903, 1.3733], RW: [29.8739, -1.9403], CM: [12.3547, 7.3697],
  SN: [-14.4524, 14.4974], CI: [-5.5471, 7.54], AO: [17.8739, -11.2027],
  MX: [-102.5528, 23.6345], AR: [-63.6167, -38.4161], CO: [-74.2973, 4.5709],
  PH: [121.774, 12.8797], ID: [113.9213, -0.7893], MY: [109.6976, 4.2105],
  SG: [103.8198, 1.3521], PK: [69.3451, 30.3753], BD: [90.3563, 23.685],
  NG2: [8.6753, 9.082], NL: [5.2913, 52.1326], IT: [12.5674, 41.8719],
  ES: [-3.7492, 40.4637], PT: [-8.2245, 39.3999], SE: [18.6435, 60.1282],
  NO: [8.4689, 60.472], DK: [9.5018, 56.2639], FI: [25.7482, 61.9241],
  PL: [19.1451, 51.9194], UA: [31.1656, 48.3794], JP: [138.2529, 36.2048],
  KR: [127.7669, 35.9078], CN: [104.1954, 35.8617], TH: [100.9925, 15.87],
  VN: [108.2772, 14.0583], ZW: [29.1549, -19.0154], ZM: [27.8493, -13.1339],
};

const PERIOD_TABS = [
  { key: "today", label: "Today" },
  { key: "week", label: "7 Days" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
  { key: "lifetime", label: "Lifetime" },
];

interface CountryData {
  count: number;
  cities: Record<string, number>;
}

export function SalesMap() {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState<Record<string, CountryData>>({});
  const [tooltip, setTooltip] = useState<{ country: string; count: number; x: number; y: number } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/globe-data?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [period]);

  const maxCount = Math.max(1, ...Object.values(data).map((d) => d.count));

  const markers = Object.entries(data)
    .filter(([code]) => COUNTRY_COORDS[code])
    .map(([code, d]) => ({
      code,
      coords: COUNTRY_COORDS[code],
      count: d.count,
      topCity: Object.entries(d.cities).sort((a, b) => b[1] - a[1])[0]?.[0],
    }));

  return (
    <div className="bg-[#0f0f1a] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div>
          <h2 className="text-white font-semibold text-sm">Sales by Location</h2>
          <p className="text-white/40 text-xs mt-0.5">{Object.keys(data).filter(k => k !== "Unknown").length} countries</p>
        </div>
        <div className="flex gap-1">
          {PERIOD_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setPeriod(t.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                period === t.key ? "bg-pink-500 text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative" onMouseLeave={() => setTooltip(null)}>
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 140 }}
          style={{ width: "100%", height: "320px" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1e1e35"
                  stroke="#2a2a45"
                  strokeWidth={0.5}
                  style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                />
              ))
            }
          </Geographies>

          {markers.map(({ code, coords, count, topCity }) => {
            const r = 3 + (count / maxCount) * 12;
            return (
              <Marker
                key={code}
                coordinates={coords}
                onMouseEnter={(e: React.MouseEvent) => {
                  const rect = (e.target as SVGElement).closest("svg")!.getBoundingClientRect();
                  setTooltip({ country: code, count, x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
              >
                <circle
                  r={r}
                  fill="#ec4899"
                  fillOpacity={0.85}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                />
                {topCity && count >= 3 && (
                  <text
                    textAnchor="middle"
                    y={-r - 3}
                    style={{ fill: "#ffffff80", fontSize: "6px" }}
                  >
                    {topCity}
                  </text>
                )}
              </Marker>
            );
          })}
        </ComposableMap>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-[#1e1e35] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-white/10"
            style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
          >
            <span className="font-semibold">{tooltip.country}</span>
            <span className="text-pink-400 ml-2">{tooltip.count} sale{tooltip.count !== 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Empty state */}
        {markers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/30 text-sm">No sales data for this period</p>
          </div>
        )}
      </div>

      {/* Legend */}
      {markers.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-x-4 gap-y-1">
          {markers.sort((a, b) => b.count - a.count).slice(0, 5).map(({ code, count }) => (
            <div key={code} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span className="text-white/60 text-xs">{code} <span className="text-white/30">({count})</span></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
