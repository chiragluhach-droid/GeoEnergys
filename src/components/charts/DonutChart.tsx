"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { useTradeData } from "@/hooks/useTradeData";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { formatNumber } from "@/lib/utils/formatters";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function DonutChart() {
  const { chartSeries, isLoading } = useTradeData();
  const { yearRange, direction } = useDashboardFilters();
  const latestYear = yearRange[1];

  const pieData = chartSeries
    .map(({ country, series }) => {
      const point = series.find((d) => d.year === latestYear) ?? series[series.length - 1];
      return {
        name: `${country?.flag ?? ""} ${country?.name ?? ""}`,
        value: point?.value ?? 0,
        itemStyle: { color: country?.color ?? "#888" },
      };
    })
    .filter((d) => d.value > 0);

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      textStyle: { color: "#0f172a", fontSize: 12 },
      extraCssText: "box-shadow:0 4px 16px rgba(0,0,0,0.1);border-radius:8px;",
      formatter: (p: unknown) => {
        const param = p as { name: string; value: number; percent: number; color: string };
        return `<span style="color:${param.color}">${param.name}</span><br/><strong>${formatNumber(param.value)}</strong> (${param.percent}%)`;
      },
    },
    legend: {
      orient: "vertical",
      right: 8,
      top: "center",
      textStyle: { color: "#64748b", fontSize: 10 },
    },
    series: [
      {
        type: "pie" as const,
        radius: ["40%", "70%"],
        center: ["38%", "50%"],
        label: { show: false },
        data: pieData,
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" },
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
        Share of {direction === "export" ? "Exports" : "Imports"} — {latestYear}
      </h3>
      {isLoading || pieData.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {isLoading ? "Loading…" : "No data"}
          </p>
        </div>
      ) : (
        <ReactECharts option={option} style={{ height: 264 }} notMerge />
      )}
    </div>
  );
}
