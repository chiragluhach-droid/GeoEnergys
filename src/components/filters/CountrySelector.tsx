"use client";

import { COUNTRIES } from "@/lib/utils/constants";
import { useDashboardFilters } from "@/store/dashboardFilters";

export function CountrySelector() {
  const { selectedCountries, toggleCountry } = useDashboardFilters();

  return (
    <div className="flex flex-wrap gap-2">
      {COUNTRIES.map((c) => {
        const active = selectedCountries.includes(c.id);
        return (
          <button
            key={c.id}
            onClick={() => toggleCountry(c.id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
            style={{
              background: active ? c.color + "22" : "transparent",
              borderColor: active ? c.color : "var(--color-border)",
              color: active ? c.color : "var(--color-text-secondary)",
            }}
          >
            <span>{c.flag}</span>
            <span>{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}
