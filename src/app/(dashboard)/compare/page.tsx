"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { EnergyFlowSankey } from "@/components/charts/EnergyFlowSankey";
import { TradeHeatmap } from "@/components/charts/TradeHeatmap";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { CountrySelector } from "@/components/filters/CountrySelector";
import { EnergyTypeFilter } from "@/components/filters/EnergyTypeFilter";
import { YearRangePicker } from "@/components/filters/YearRangePicker";
import { TradeDirectionToggle } from "@/components/filters/TradeDirectionToggle";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { useCountryComparison } from "@/hooks/useCountryComparison";
import { formatNumber, formatPercent } from "@/lib/utils/formatters";

function DeltaChip({ value }: { value: number | null }) {
  if (value === null) return <span style={{ color: "var(--color-text-muted)" }}>—</span>;
  const pos = value >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-medium"
      style={{ color: pos ? "var(--color-emerald)" : "var(--color-rose)" }}
    >
      {pos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {formatPercent(value)}
    </span>
  );
}

export default function ComparePage() {
  const { selectedCountries, energyType, yearRange, direction } = useDashboardFilters();
  const { summaries, allYears, heatmapData, sankeyData, isLoading, unit } = useCountryComparison(
    selectedCountries,
    energyType,
    yearRange
  );

  const heatmapCountries = summaries.map((s) => `${s.flag} ${s.name}`);

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Compare Countries
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Side-by-side energy trade metrics for up to 5 countries
        </p>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl border p-4 flex flex-col gap-4"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <EnergyTypeFilter />
          <div className="flex items-center gap-2">
            <TradeDirectionToggle />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Countries (select up to 5)
          </p>
          <CountrySelector />
        </div>
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Year Range
          </p>
          <YearRangePicker />
        </div>
      </div>

      {/* Comparison cards */}
      {summaries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {summaries.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border p-4"
              style={{
                background: "var(--color-surface)",
                borderColor: s.color + "44",
                borderLeftWidth: 3,
                borderLeftColor: s.color,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{s.flag}</span>
                <div>
                  <p className="text-xs font-bold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                    {s.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {s.unit}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Imports ({yearRange[1]})
                  </p>
                  <p className="text-base font-bold" style={{ color: "var(--color-rose)" }}>
                    {s.latestImport !== null ? formatNumber(s.latestImport) : "N/A"}
                  </p>
                  <DeltaChip value={s.importYoY} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Exports ({yearRange[1]})
                  </p>
                  <p className="text-base font-bold" style={{ color: "var(--color-emerald)" }}>
                    {s.latestExport !== null ? formatNumber(s.latestExport) : "N/A"}
                  </p>
                  <DeltaChip value={s.exportYoY} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Trade Balance
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color:
                        s.tradeBalance === null
                          ? "var(--color-text-muted)"
                          : s.tradeBalance >= 0
                          ? "var(--color-emerald)"
                          : "var(--color-rose)",
                    }}
                  >
                    {s.tradeBalance !== null
                      ? `${s.tradeBalance >= 0 ? "+" : ""}${formatNumber(s.tradeBalance)}`
                      : "—"}
                  </p>
                </div>
                <div className="flex gap-3 pt-1 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <div>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Import CAGR</p>
                    <p className="text-xs font-medium" style={{ color: "var(--color-cyan)" }}>
                      {formatPercent(s.importCAGR)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Export CAGR</p>
                    <p className="text-xs font-medium" style={{ color: "var(--color-gold)" }}>
                      {formatPercent(s.exportCAGR)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedCountries.length === 0 && (
        <div
          className="rounded-xl border p-10 flex flex-col items-center gap-2"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <Minus size={24} style={{ color: "var(--color-text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Select countries above to start comparing
          </p>
        </div>
      )}

      {/* Multi-line time series */}
      {summaries.length > 0 && <TimeSeriesChart />}

      {/* Sankey + Heatmap side by side */}
      {summaries.length > 1 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <EnergyFlowSankey data={sankeyData} unit={unit} isLoading={isLoading} />
          <TradeHeatmap
            data={heatmapData}
            years={allYears}
            countries={heatmapCountries}
            unit={unit}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
