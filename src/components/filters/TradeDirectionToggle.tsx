"use client";

import { useDashboardFilters } from "@/store/dashboardFilters";

const OPTIONS = [
  { value: "import", label: "Imports" },
  { value: "export", label: "Exports" },
] as const;

export function TradeDirectionToggle() {
  const { direction, setDirection } = useDashboardFilters();

  return (
    <div
      className="flex gap-1 p-1 rounded-lg"
      style={{ background: "var(--color-surface-2)" }}
    >
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setDirection(value)}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          style={{
            background: direction === value ? "var(--color-surface)" : "transparent",
            color: direction === value ? "var(--color-text-primary)" : "var(--color-text-muted)",
            boxShadow: direction === value ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
