import { create } from "zustand";
import type { EnergyType } from "@/types/trade";

interface DashboardFiltersState {
  selectedCountries: string[];
  energyType: EnergyType;
  direction: "import" | "export" | "both";
  yearRange: [number, number];
  setSelectedCountries: (countries: string[]) => void;
  toggleCountry: (countryId: string) => void;
  setEnergyType: (type: EnergyType) => void;
  setDirection: (dir: "import" | "export" | "both") => void;
  setYearRange: (range: [number, number]) => void;
  reset: () => void;
}

const DEFAULTS = {
  selectedCountries: ["usa", "china", "india"],
  energyType: "coal" as EnergyType,
  direction: "import" as const,
  yearRange: [2010, 2023] as [number, number],
};

export const useDashboardFilters = create<DashboardFiltersState>((set) => ({
  ...DEFAULTS,

  setSelectedCountries: (countries) => set({ selectedCountries: countries }),

  toggleCountry: (id) =>
    set((state) => ({
      selectedCountries: state.selectedCountries.includes(id)
        ? state.selectedCountries.filter((c) => c !== id)
        : [...state.selectedCountries, id].slice(0, 5),
    })),

  setEnergyType: (energyType) => set({ energyType }),

  setDirection: (direction) => set({ direction }),

  setYearRange: (yearRange) => set({ yearRange }),

  reset: () => set(DEFAULTS),
}));
