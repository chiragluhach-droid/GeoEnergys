"use client";

import { useState, useCallback } from "react";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { COUNTRIES } from "@/lib/utils/constants";

export function useMapInteractions() {
  const { toggleCountry, selectedCountries } = useDashboardFilters();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [viewport, setViewport] = useState({
    longitude: 78,
    latitude: 22,
    zoom: 1.5,
  });

  const handleCountryClick = useCallback(
    (countryId: string) => {
      toggleCountry(countryId);
      const meta = COUNTRIES.find((c) => c.id === countryId);
      if (meta) {
        setViewport((v) => ({
          ...v,
          longitude: meta.coordinates[0],
          latitude: meta.coordinates[1],
          zoom: 3.5,
        }));
      }
    },
    [toggleCountry]
  );

  const resetView = useCallback(() => {
    setViewport({ longitude: -20, latitude: 25, zoom: 1.5 });
  }, []);

  return {
    viewport,
    setViewport,
    hoveredCountry,
    setHoveredCountry,
    selectedCountries,
    handleCountryClick,
    resetView,
  };
}
