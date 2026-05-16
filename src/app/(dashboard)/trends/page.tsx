"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { COUNTRIES, ENERGY_TYPES, ENERGY_TYPE_MAP, COUNTRY_MAP } from "@/lib/utils/constants";
import { useGetTrendsQuery } from "@/store/tradeApi";
import { formatNumber, formatPercent } from "@/lib/utils/formatters";
import type { EnergyType } from "@/types/trade";
import { TrendingUp, TrendingDown } from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

function ForecastChart({
  countryId,
  energyType,
  direction,
}: {
  countryId: string;
  energyType: EnergyType;
  direction: "import" | "export";
}) {
  const meta = COUNTRY_MAP[countryId];
  const { data, isLoading } = useGetTrendsQuery({
    country: meta?.eiaCode ?? countryId.toUpperCase(),
    energyType,
    direction,
  });

  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center" style={{ background: "var(--color-surface-2)", borderRadius: 12 }}>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading forecast…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-72 flex items-center justify-center" style={{ background: "var(--color-surface-2)", borderRadius: 12 }}>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No trend data available</p>
      </div>
    );
  }

  const historical = data.historicalData.filter((d) => d.value !== null);
  const forecast = data.forecastData;
  const unit = ENERGY_TYPE_MAP[energyType]?.unit ?? "";
  const color = meta?.color ?? "var(--color-cyan)";

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      textStyle: { color: "#0f172a", fontSize: 12 },
      extraCssText: "box-shadow:0 4px 16px rgba(0,0,0,0.1);border-radius:8px;",
    },
    legend: {
      data: ["Historical", "Forecast"],
      textStyle: { color: "#64748b", fontSize: 11 },
      bottom: 0,
    },
    grid: { top: 16, right: 16, bottom: 40, left: 60 },
    xAxis: {
      type: "category",
      data: [
        ...historical.map((d) => String(d.year)),
        ...forecast.map((d) => String(d.year)),
      ],
      axisLabel: { color: "#64748b", fontSize: 10 },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#64748b", fontSize: 10, formatter: (v: number) => formatNumber(v) },
      splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
    },
    series: [
      {
        name: "Historical",
        type: "line" as const,
        smooth: true,
        symbol: "none",
        data: [
          ...historical.map((d) => d.value),
          ...forecast.map(() => null),
        ],
        lineStyle: { color, width: 2 },
        areaStyle: { color: color + "18" },
        itemStyle: { color },
      },
      {
        name: "Forecast",
        type: "line" as const,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        data: [
          ...historical.map(() => null),
          // Overlap at last historical point for continuity
          historical[historical.length - 1]?.value ?? null,
          ...forecast.slice(1).map((d) => d.value),
        ],
        lineStyle: { color, width: 2, type: "dashed" },
        itemStyle: { color },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 288 }} notMerge />;
}

export default function TrendsPage() {
  const [selectedCountry, setSelectedCountry] = useState("usa");
  const [energyType, setEnergyType] = useState<EnergyType>("coal");
  const [direction, setDirection] = useState<"import" | "export">("import");

  const meta = COUNTRY_MAP[selectedCountry];
  const { data: trendData } = useGetTrendsQuery({
    country: meta?.eiaCode ?? "USA",
    energyType,
    direction,
  });

  // CAGR cards — all countries for selected energy type + direction
  const cagrCards = COUNTRIES.map((c) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useGetTrendsQuery({ country: c.eiaCode, energyType, direction });
    return { meta: c, cagr: data?.cagr ?? null, yoy: data?.yoyChange ?? null };
  });

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Trends & Forecasts
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Historical trends with 5-year linear regression forecast
        </p>
      </div>

      {/* Controls */}
      <div
        className="rounded-xl border p-4 flex flex-wrap gap-4"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {/* Country */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Country</p>
          <div className="flex flex-wrap gap-1.5">
            {COUNTRIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCountry(c.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
                style={{
                  background: selectedCountry === c.id ? c.color + "22" : "transparent",
                  borderColor: selectedCountry === c.id ? c.color : "var(--color-border)",
                  color: selectedCountry === c.id ? c.color : "var(--color-text-secondary)",
                }}
              >
                {c.flag} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {/* Energy type */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Energy Type</p>
            <select
              value={energyType}
              onChange={(e) => setEnergyType(e.target.value as EnergyType)}
              className="px-3 py-1.5 rounded-lg text-xs border outline-none"
              style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border-2)", color: "var(--color-text-primary)" }}
            >
              {ENERGY_TYPES.map((e) => (
                <option key={e.id} value={e.id}>{e.icon} {e.label}</option>
              ))}
            </select>
          </div>

          {/* Direction */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Direction</p>
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--color-surface-2)" }}>
              {(["import", "export"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize"
                  style={{
                    background: direction === d ? "var(--color-cyan)" : "transparent",
                    color: direction === d ? "#ffffff" : "var(--color-text-muted)",
                  }}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main forecast chart */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {meta?.flag} {meta?.name} — {ENERGY_TYPE_MAP[energyType]?.label} {direction === "import" ? "Imports" : "Exports"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Dashed line = 5-year linear regression forecast
            </p>
          </div>
          {trendData && (
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>CAGR</p>
                <p className="text-sm font-bold" style={{ color: "var(--color-cyan)" }}>
                  {formatPercent(trendData.cagr)}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>YoY</p>
                <p className="text-sm font-bold" style={{ color: trendData.yoyChange >= 0 ? "var(--color-emerald)" : "var(--color-rose)" }}>
                  {formatPercent(trendData.yoyChange)}
                </p>
              </div>
            </div>
          )}
        </div>
        <ForecastChart countryId={selectedCountry} energyType={energyType} direction={direction} />
      </div>

      {/* All-country CAGR cards */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
          Growth Rates — All Countries ({ENERGY_TYPE_MAP[energyType]?.label} {direction === "import" ? "Imports" : "Exports"})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {cagrCards.map(({ meta: c, cagr, yoy }, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedCountry(c.id)}
              className="rounded-xl border p-3 text-left transition-all hover:scale-[1.02]"
              style={{
                background: selectedCountry === c.id ? c.color + "18" : "var(--color-surface)",
                borderColor: selectedCountry === c.id ? c.color : "var(--color-border)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span>{c.flag}</span>
                <span className="text-xs font-medium truncate" style={{ color: "var(--color-text-primary)" }}>{c.name}</span>
              </div>
              <p className="text-lg font-bold" style={{ color: c.color }}>
                {cagr !== null ? formatPercent(cagr) : "…"}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>CAGR</p>
              {yoy !== null && (
                <p
                  className="text-xs mt-0.5 flex items-center gap-0.5"
                  style={{ color: yoy >= 0 ? "var(--color-emerald)" : "var(--color-rose)" }}
                >
                  {yoy >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {formatPercent(yoy)} YoY
                </p>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
