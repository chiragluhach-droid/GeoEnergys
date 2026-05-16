"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { useGetTradeDataQuery } from "@/store/tradeApi";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { COUNTRY_MAP, ENERGY_TYPE_MAP } from "@/lib/utils/constants";
import { formatNumber } from "@/lib/utils/formatters";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function AreaChart() {
  const { selectedCountries, energyType, yearRange } = useDashboardFilters();
  const primaryId = selectedCountries[0] ?? "usa";
  const primaryMeta = COUNTRY_MAP[primaryId];
  const unit = ENERGY_TYPE_MAP[energyType]?.unit ?? "";

  const { data, isLoading } = useGetTradeDataQuery({
    country: primaryMeta?.eiaCode ?? "USA",
    energyType,
    direction: "both",
    startYear: yearRange[0],
    endYear: yearRange[1],
  });

  const eiaCode = primaryMeta?.eiaCode ?? "USA";
  const imports = data?.[eiaCode]?.imports ?? [];
  const exports = data?.[eiaCode]?.exports ?? [];
  const years = [...new Set([...imports.map((d) => d.year), ...exports.map((d) => d.year)])].sort();

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
      data: ["Imports", "Exports"],
      textStyle: { color: "#64748b", fontSize: 11 },
      bottom: 0,
    },
    grid: { top: 16, right: 16, bottom: 40, left: 60 },
    xAxis: {
      type: "category",
      data: years.map(String),
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
        name: "Imports",
        type: "line" as const,
        smooth: true,
        areaStyle: { color: "rgba(244,63,94,0.15)" },
        lineStyle: { color: "#f43f5e", width: 2 },
        itemStyle: { color: "#f43f5e" },
        symbol: "none",
        data: years.map((y) => imports.find((d) => d.year === y)?.value ?? null),
      },
      {
        name: "Exports",
        type: "line" as const,
        smooth: true,
        areaStyle: { color: "rgba(16,185,129,0.15)" },
        lineStyle: { color: "#10b981", width: 2 },
        itemStyle: { color: "#10b981" },
        symbol: "none",
        data: years.map((y) => exports.find((d) => d.year === y)?.value ?? null),
      },
    ],
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
        Import vs Export — {primaryMeta?.flag} {primaryMeta?.name}
      </h3>
      <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>{unit}</p>
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
        </div>
      ) : (
        <ReactECharts option={option} style={{ height: 264 }} notMerge />
      )}
    </div>
  );
}
