"use client";

import { useDashboardFilters } from "@/store/dashboardFilters";
import { AVAILABLE_YEARS } from "@/lib/utils/constants";

export function YearRangePicker() {
  const { yearRange, setYearRange } = useDashboardFilters();
  const [start, end] = yearRange;
  const min = AVAILABLE_YEARS[0];
  const max = AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
        {start}
      </span>
      <div className="relative flex-1 min-w-[120px]">
        <input
          type="range"
          min={min}
          max={max}
          value={start}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < end) setYearRange([v, end]);
          }}
          className="w-full h-1 appearance-none rounded-full cursor-pointer"
          style={{ accentColor: "var(--color-cyan)" }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={end}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > start) setYearRange([start, v]);
          }}
          className="w-full h-1 appearance-none rounded-full cursor-pointer mt-1"
          style={{ accentColor: "var(--color-gold)" }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
        {end}
      </span>
    </div>
  );
}
