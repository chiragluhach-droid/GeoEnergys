"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { formatNumber } from "@/lib/utils/formatters";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface HeatmapRow {
  country: string;
  year: number;
  value: number | null;
}

interface Props {
  data: HeatmapRow[];
  years: number[];
  countries: string[];
  unit: string;
  isLoading?: boolean;
}

export function TradeHeatmap({ data, years, countries, unit, isLoading }: Props) {
  // Normalise to 0-100 for color scale
  const values = data.map((d) => d.value ?? 0).filter(Boolean);
  const maxVal = Math.max(...values, 1);

  const cellData = data.map((row) => [
    years.indexOf(row.year),
    countries.indexOf(row.country),
    row.value ?? 0,
  ]);

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      position: "top",
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      textStyle: { color: "#0f172a", fontSize: 12 },
      extraCssText: "box-shadow:0 4px 16px rgba(0,0,0,0.1);border-radius:8px;",
      formatter: (p: unknown) => {
        const param = p as { value: [number, number, number] };
        const [xi, yi, val] = param.value;
        return `<strong>${countries[yi]}</strong><br/>${years[xi]}: ${formatNumber(val)} ${unit}`;
      },
    },
    grid: { top: 16, right: 24, bottom: 56, left: 110 },
    xAxis: {
      type: "category",
      data: years.map(String),
      axisLabel: { color: "#64748b", fontSize: 10, rotate: 30 },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      splitArea: { show: true, areaStyle: { color: ["rgba(241,245,249,0.8)", "transparent"] } },
    },
    yAxis: {
      type: "category",
      data: countries,
      axisLabel: { color: "#475569", fontSize: 10 },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      splitArea: { show: true, areaStyle: { color: ["rgba(241,245,249,0.8)", "transparent"] } },
    },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      textStyle: { color: "#64748b", fontSize: 10 },
      inRange: {
        color: ["#f0f9ff", "#bae6fd", "#38bdf8", "#0284c7", "#0c4a6e"],
      },
    },
    series: [
      {
        type: "heatmap" as const,
        data: cellData,
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: "rgba(6,182,212,0.4)" },
        },
      },
    ],
  };

  const height = Math.max(200, countries.length * 36 + 80);

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
        Import Volume Heatmap
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
        Countries × years — colour intensity = trade volume
      </p>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center rounded-lg" style={{ background: "var(--color-surface-2)" }}>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No data</p>
        </div>
      ) : (
        <ReactECharts option={option} style={{ height }} notMerge />
      )}
    </div>
  );
}
