"use client";

import { CountrySelector } from "@/components/filters/CountrySelector";
import { EnergyTypeFilter } from "@/components/filters/EnergyTypeFilter";
import { YearRangePicker } from "@/components/filters/YearRangePicker";
import { TradeDirectionToggle } from "@/components/filters/TradeDirectionToggle";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { RotateCcw } from "lucide-react";

export function FilterBar() {
  const { reset } = useDashboardFilters();

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-4"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {/* Row 1: Energy type + direction + reset */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <EnergyTypeFilter />
        <div className="flex items-center gap-2">
          <TradeDirectionToggle />
          <button
            onClick={reset}
            title="Reset filters"
            className="p-1.5 rounded-md border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--color-border-2)", color: "var(--color-text-muted)" }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Row 2: Country selector */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
          Countries (select up to 5)
        </p>
        <CountrySelector />
      </div>

      {/* Row 3: Year range */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
          Year Range
        </p>
        <YearRangePicker />
      </div>
    </div>
  );
}
