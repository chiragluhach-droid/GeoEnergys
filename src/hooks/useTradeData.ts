"use client";

import { useMemo } from "react";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { useGetTradeDataQuery, useGetCompareDataQuery, useGetStatsQuery } from "@/store/tradeApi";
import { COUNTRY_MAP } from "@/lib/utils/constants";
import { calculateCAGR } from "@/lib/utils/formatters";

export function useTradeData() {
  const { selectedCountries, energyType, direction, yearRange } = useDashboardFilters();

  const eiaCodes = selectedCountries.map(
    (id) => COUNTRY_MAP[id]?.eiaCode ?? id.toUpperCase()
  );

  const { data: compareData, isLoading: isLoadingCompare } = useGetCompareDataQuery({
    countries: eiaCodes,
    energyType,
    startYear: yearRange[0],
    endYear: yearRange[1],
  });

  const { data: stats, isLoading: isLoadingStats } = useGetStatsQuery({
    energyType,
    year: yearRange[1],
  });

  const chartSeries = useMemo(() => {
    if (!compareData) return [];
    return eiaCodes.map((code) => {
      const country = Object.values(COUNTRY_MAP).find((c) => c.eiaCode === code);
      const series =
        direction === "export"
          ? compareData[code]?.exports ?? []
          : compareData[code]?.imports ?? [];
      return { code, country, series };
    });
  }, [compareData, eiaCodes, direction]);

  const summaryStats = useMemo(() => {
    return chartSeries.map(({ code, country, series }) => {
      const validSeries = series.filter((d) => d.value !== null);
      const latest = validSeries[validSeries.length - 1]?.value ?? 0;
      const first = validSeries[0]?.value ?? 0;
      const cagr = calculateCAGR(first, latest as number, Math.max(1, validSeries.length - 1));
      const prev = validSeries[validSeries.length - 2]?.value ?? latest;
      const yoy = prev ? (((latest as number) - (prev as number)) / Math.abs(prev as number)) * 100 : 0;
      return { code, country, latest, cagr, yoy, unit: series[0]?.unit ?? "" };
    });
  }, [chartSeries]);

  return {
    compareData,
    chartSeries,
    summaryStats,
    stats,
    isLoading: isLoadingCompare || isLoadingStats,
  };
}
