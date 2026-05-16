"use client";

import { useTradeData } from "@/hooks/useTradeData";
import { formatNumber, formatPercent } from "@/lib/utils/formatters";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { ENERGY_TYPE_MAP } from "@/lib/utils/constants";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

export function StatsRow() {
  const { summaryStats, isLoading } = useTradeData();
  const { energyType } = useDashboardFilters();
  const energyLabel = ENERGY_TYPE_MAP[energyType]?.label ?? energyType;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border p-4 animate-pulse h-28"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          />
        ))}
      </div>
    );
  }

  if (summaryStats.length === 0) {
    return (
      <div
        className="rounded-xl border p-6 flex items-center justify-center"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <Minus size={14} className="mr-2" style={{ color: "var(--color-text-muted)" }} />
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Select countries above to see statistics
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {summaryStats.slice(0, 4).map(({ country, first, latest, cagr, yoy, unit, startYear, endYear }) => {
        const cagrPositive = cagr >= 0;
        const color = country?.color ?? "var(--color-cyan)";

        return (
          <div
            key={country?.id}
            className="rounded-xl border p-4 flex flex-col gap-2"
            style={{
              background:      "var(--color-surface)",
              borderColor:     "var(--color-border)",
              borderTopColor:  color,
              borderTopWidth:  2,
            }}
          >
            {/* Country label */}
            <p className="text-xs font-medium truncate" style={{ color: "var(--color-text-secondary)" }}>
              {country?.flag} {country?.name}
            </p>

            {/* Start → End values */}
            <div className="flex items-center gap-1.5">
              <div className="flex flex-col items-start">
                <span className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                  {startYear}
                </span>
                <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                  {formatNumber(first as number)}
                </span>
              </div>

              <ArrowRight size={13} className="shrink-0 mt-3" style={{ color: "var(--color-text-muted)" }} />

              <div className="flex flex-col items-start">
                <span className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                  {endYear}
                </span>
                <span className="text-lg font-bold tabular-nums" style={{ color }}>
                  {formatNumber(latest as number)}
                </span>
              </div>
            </div>

            {/* Unit */}
            <p className="text-xs -mt-1 truncate" style={{ color: "var(--color-text-muted)" }}>
              {unit}
            </p>

            {/* CAGR + YoY */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  background: cagrPositive ? "var(--color-emerald)18" : "var(--color-rose)18",
                  color:      cagrPositive ? "var(--color-emerald)"   : "var(--color-rose)",
                }}
              >
                {cagrPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {formatPercent(cagr)} CAGR
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {formatPercent(yoy)} YoY
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
