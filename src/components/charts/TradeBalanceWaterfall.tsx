"use client";

import dynamic from "next/dynamic";
import type { EChartsOption, SeriesOption } from "echarts";
import { formatNumber } from "@/lib/utils/formatters";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface WaterfallItem {
  name: string;
  flag: string;
  balance: number | null;
  color: string;
}

interface Props {
  data: WaterfallItem[];
  unit: string;
  isLoading?: boolean;
}

export function TradeBalanceWaterfall({ data, unit, isLoading }: Props) {
  const sorted = [...data]
    .filter((d) => d.balance !== null)
    .sort((a, b) => (b.balance as number) - (a.balance as number));

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
        const p = items[0];
        if (!p) return "";
        const sign = p.value >= 0 ? "+" : "";
        return `<span style="color:${p.color}">${p.name}</span><br/><strong>${sign}${formatNumber(p.value)} ${unit}</strong>`;
      },
    },
    grid: { top: 16, right: 16, bottom: 40, left: 16, containLabel: true },
    xAxis: {
      type: "category",
      data: sorted.map((d) => `${d.flag} ${d.name}`),
      axisLabel: { color: "#64748b", fontSize: 10, rotate: 15 },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#64748b",
        fontSize: 10,
        formatter: (v: number) => formatNumber(v),
      },
      splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
      axisLine: { show: false },
    },
    series: [
      {
        type: "bar" as const,
        barMaxWidth: 44,
        data: sorted.map((d) => ({
          value: d.balance,
          itemStyle: {
            color: (d.balance ?? 0) >= 0 ? "#059669" : "#e11d48",
            borderRadius: [4, 4, 0, 0] as [number, number, number, number],
            opacity: 0.9,
          },
        })),
        label: {
          show: true,
          position: "top" as const,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (p: any) => {
            const v = p.value as number;
            return v >= 0 ? `+${formatNumber(v)}` : formatNumber(v);
          },
          color: "#64748b",
          fontSize: 10,
        },
      },
    ] as unknown as SeriesOption[],
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
        Trade Balance (Exports − Imports)
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
        Green = net exporter · Red = net importer · {unit}
      </p>
      {isLoading ? (
        <div className="h-56 flex items-center justify-center">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="h-56 flex items-center justify-center rounded-lg" style={{ background: "var(--color-surface-2)" }}>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No data</p>
        </div>
      ) : (
        <ReactECharts option={option} style={{ height: 224 }} notMerge />
      )}
    </div>
  );
}
