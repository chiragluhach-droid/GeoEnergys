"use client";

import { useTradeData } from "@/hooks/useTradeData";
import { formatNumber, formatPercent } from "@/lib/utils/formatters";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { ENERGY_TYPE_MAP } from "@/lib/utils/constants";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function StatsRow() {
  const { summaryStats, isLoading } = useTradeData();
  const { energyType, direction } = useDashboardFilters();
  const energyLabel = ENERGY_TYPE_MAP[energyType]?.label ?? energyType;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border p-4 animate-pulse h-24"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          />
        ))}
      </div>
    );
  }

  const cards = summaryStats.slice(0, 4).map(({ country, latest, cagr, yoy, unit }) => ({
    label: `${country?.flag ?? ""} ${country?.name ?? ""}`,
    value: formatNumber(latest as number),
    unit,
    cagr: formatPercent(cagr),
    yoy: formatPercent(yoy),
    yoyPositive: (yoy ?? 0) >= 0,
    color: country?.color ?? "var(--color-cyan)",
  }));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, unit, cagr, yoy, yoyPositive, color }) => (
        <div
          key={label}
          className="rounded-xl border p-4"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <p className="text-xs mb-1 truncate" style={{ color: "var(--color-text-secondary)" }}>
            {label}
          </p>
          <p className="text-xl font-bold" style={{ color }}>
            {value}
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {unit}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs flex items-center gap-0.5" style={{ color: yoyPositive ? "var(--color-emerald)" : "var(--color-rose)" }}>
              {yoyPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {yoy} YoY
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              · {cagr} CAGR
            </span>
          </div>
        </div>
      ))}

      {/* Empty placeholders if fewer than 4 countries */}
      {cards.length === 0 && (
        <div
          className="col-span-4 rounded-xl border p-6 flex items-center justify-center"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <Minus size={14} className="mr-2" style={{ color: "var(--color-text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Select countries above to see statistics
          </p>
        </div>
      )}
    </div>
  );
}
