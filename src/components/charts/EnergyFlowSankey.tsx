"use client";

import dynamic from "next/dynamic";
import type { EChartsOption, SeriesOption } from "echarts";
import type { SankeyData } from "@/types/trade";
import { formatNumber } from "@/lib/utils/formatters";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface Props {
  data: SankeyData;
  unit: string;
  isLoading?: boolean;
}

export function EnergyFlowSankey({ data, unit, isLoading }: Props) {
  const hasData = data.nodes.length > 1 && data.links.length > 0;

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      textStyle: { color: "#0f172a", fontSize: 12 },
      extraCssText: "box-shadow:0 4px 16px rgba(0,0,0,0.1);border-radius:8px;",
      formatter: (params: unknown) => {
        const p = params as { data: { source?: string; target?: string; value?: number; name?: string } };
        if (p.data.source !== undefined) {
          return `<strong>${p.data.source}</strong> → <strong>${p.data.target}</strong><br/>${formatNumber(p.data.value ?? 0)} ${unit}`;
        }
        return `<strong>${p.data.name}</strong>`;
      },
    },
    series: [
      {
        type: "sankey" as const,
        layout: "none" as const,
        emphasis: { focus: "adjacency" },
        nodeWidth: 16,
        nodeGap: 12,
        left: "2%",
        right: "2%",
        top: "8%",
        bottom: "8%",
        label: {
          color: "#475569",
          fontSize: 11,
          fontFamily: "var(--font-geist-sans)",
        },
        lineStyle: {
          color: "gradient",
          opacity: 0.3,
          curveness: 0.5,
        },
        data: data.nodes.map((n, i) => ({
          name: n.name,
          itemStyle: {
            color: [
              "#06b6d4", "#f59e0b", "#10b981", "#ef4444",
              "#8b5cf6", "#f97316", "#ec4899", "#14b8a6",
              "#a78bfa", "#fbbf24",
            ][i % 10],
          },
        })),
        links: data.links,
      },
    ] as unknown as SeriesOption[],
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
        Energy Flow (Sankey)
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
        How energy flows between selected countries via this energy type
      </p>

      {isLoading ? (
        <div className="h-72 flex items-center justify-center">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
        </div>
      ) : !hasData ? (
        <div className="h-72 flex items-center justify-center rounded-lg" style={{ background: "var(--color-surface-2)" }}>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Select more countries to see flow
          </p>
        </div>
      ) : (
        <ReactECharts option={option} style={{ height: 288 }} notMerge />
      )}
    </div>
  );
}
