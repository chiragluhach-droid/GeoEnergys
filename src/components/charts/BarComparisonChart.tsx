"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { useTradeData } from "@/hooks/useTradeData";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { ENERGY_TYPE_MAP } from "@/lib/utils/constants";
import { formatNumber } from "@/lib/utils/formatters";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function BarComparisonChart() {
  const { chartSeries, isLoading } = useTradeData();
  const { yearRange, energyType, direction } = useDashboardFilters();
  const unit = ENERGY_TYPE_MAP[energyType]?.unit ?? "";
  const latestYear = yearRange[1];

  const latestValues = chartSeries.map(({ country, series }) => {
    const point = series.find((d) => d.year === latestYear) ?? series[series.length - 1];
    return { name: `${country?.flag ?? ""} ${country?.name ?? ""}`, value: point?.value ?? 0, color: country?.color ?? "#888" };
  });

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      textStyle: { color: "#0f172a", fontSize: 12 },
      extraCssText: "box-shadow:0 4px 16px rgba(0,0,0,0.1);border-radius:8px;",
      formatter: (params: unknown) => {
        const items = params as { name: string; value: number; color: string }[];
        return items.map((p) => `<span style="color:${p.color}">${p.name}: <strong>${formatNumber(p.value)} ${unit}</strong></span>`).join("<br/>");
      },
    },
    grid: { top: 16, right: 16, bottom: 40, left: 16, containLabel: true },
    xAxis: {
      type: "category",
      data: latestValues.map((d) => d.name),
      axisLabel: { color: "#64748b", fontSize: 10, rotate: 15 },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#64748b", fontSize: 10, formatter: (v: number) => formatNumber(v) },
      splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
    },
    series: [
      {
        type: "bar" as const,
        barMaxWidth: 48,
        data: latestValues.map((d) => ({
          value: d.value,
          itemStyle: { color: d.color, opacity: 0.9, borderRadius: [4, 4, 0, 0] as [number,number,number,number] },
        })),
        label: {
          show: true,
          position: "top" as const,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (p: any) => formatNumber(p.value as number),
          color: "#64748b",
          fontSize: 10,
        },
      },
    ],
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
        {direction === "export" ? "Exports" : "Imports"} — {latestYear}
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
