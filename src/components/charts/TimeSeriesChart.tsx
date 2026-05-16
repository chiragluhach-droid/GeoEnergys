"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { useTradeData } from "@/hooks/useTradeData";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { ENERGY_TYPE_MAP } from "@/lib/utils/constants";
import { formatNumber } from "@/lib/utils/formatters";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function TimeSeriesChart() {
  const { chartSeries, isLoading } = useTradeData();
  const { yearRange, energyType, direction } = useDashboardFilters();
  const unit = ENERGY_TYPE_MAP[energyType]?.unit ?? "";

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      textStyle: { color: "#0f172a", fontSize: 12 },
      extraCssText: "box-shadow:0 4px 16px rgba(0,0,0,0.1);border-radius:8px;",
      formatter: (params: unknown) => {
        const items = params as { seriesName: string; value: [number, number]; color: string }[];
        const year = items[0]?.value[0];
        const rows = items
          .map((p) => `<div style="display:flex;justify-content:space-between;gap:16px"><span style="color:${p.color}">${p.seriesName}</span><strong>${formatNumber(p.value[1])} ${unit}</strong></div>`)
          .join("");
        return `<div style="font-size:11px"><div style="color:#94a3b8;margin-bottom:4px">${year}</div>${rows}</div>`;
      },
    },
    legend: {
      textStyle: { color: "#64748b", fontSize: 11 },
      bottom: 0,
    },
    grid: { top: 16, right: 16, bottom: 40, left: 60 },
    xAxis: {
      type: "value",
      min: yearRange[0],
      max: yearRange[1],
      axisLabel: { color: "#64748b", fontSize: 10, formatter: (v: number) => String(v) },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#64748b", fontSize: 10, formatter: (v: number) => formatNumber(v) },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
    },
    series: chartSeries.map(({ country, series }) => ({
      name: `${country?.flag ?? ""} ${country?.name ?? ""}`,
      type: "line" as const,
      smooth: true,
      symbol: "circle",
      symbolSize: 4,
      lineStyle: { color: country?.color, width: 2 },
      itemStyle: { color: country?.color },
      areaStyle: { color: country?.color + "18" },
      data: series.filter((d) => d.value !== null).map((d) => [d.year, d.value]),
    })),
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
        {direction === "export" ? "Exports" : "Imports"} Over Time
      </h3>
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
