"use client";

import { ENERGY_TYPES } from "@/lib/utils/constants";
import { useDashboardFilters } from "@/store/dashboardFilters";
import type { EnergyType } from "@/types/trade";

export function EnergyTypeFilter() {
  const { energyType, setEnergyType } = useDashboardFilters();

  return (
    <div
      className="flex gap-1 flex-wrap p-1 rounded-lg"
      style={{ background: "var(--color-surface-2)" }}
    >
      {ENERGY_TYPES.map((e) => (
        <button
          key={e.id}
          onClick={() => setEnergyType(e.id as EnergyType)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
          style={{
            background: energyType === e.id ? "var(--color-cyan)" : "transparent",
            color: energyType === e.id ? "#ffffff" : "var(--color-text-secondary)",
          }}
        >
          <span>{e.icon}</span>
          <span className="hidden sm:inline">{e.label}</span>
        </button>
      ))}
    </div>
  );
}
