"use client";

import { useMemo } from "react";
import { useGetCompareDataQuery } from "@/store/tradeApi";
import { COUNTRIES, COUNTRY_MAP, ENERGY_TYPE_MAP } from "@/lib/utils/constants";
import { calculateCAGR, calculateYoY } from "@/lib/utils/formatters";
import type { EnergyType, TradeDataPoint } from "@/types/trade";
import type { SankeyData } from "@/types/trade";

export interface CountrySummary {
  id: string;
  eiaCode: string;
  name: string;
  flag: string;
  color: string;
  latestImport: number | null;
  latestExport: number | null;
  tradeBalance: number | null;
  importCAGR: number;
  exportCAGR: number;
  importYoY: number | null;
  exportYoY: number | null;
  unit: string;
  importSeries: TradeDataPoint[];
  exportSeries: TradeDataPoint[];
}

export function useCountryComparison(
  countryIds: string[],
  energyType: EnergyType,
  yearRange: [number, number]
) {
  const eiaCodes = countryIds.map((id) => COUNTRY_MAP[id]?.eiaCode ?? id.toUpperCase());
  const unit = ENERGY_TYPE_MAP[energyType]?.unit ?? "";
  const latestYear = yearRange[1];

  const { data, isLoading, isError } = useGetCompareDataQuery({
    countries: eiaCodes,
    energyType,
    startYear: yearRange[0],
    endYear: yearRange[1],
  });

  const summaries: CountrySummary[] = useMemo(() => {
    if (!data) return [];

    return countryIds.map((id) => {
      const meta = COUNTRY_MAP[id] ?? COUNTRIES.find((c) => c.eiaCode === id.toUpperCase());
      const eiaCode = meta?.eiaCode ?? id.toUpperCase();

      const importSeries = data[eiaCode]?.imports ?? [];
      const exportSeries = data[eiaCode]?.exports ?? [];

      const validImports = importSeries.filter((d) => d.value !== null);
      const validExports = exportSeries.filter((d) => d.value !== null);

      const latestImport =
        (importSeries.find((d) => d.year === latestYear) ?? importSeries[importSeries.length - 1])?.value ?? null;
      const latestExport =
        (exportSeries.find((d) => d.year === latestYear) ?? exportSeries[exportSeries.length - 1])?.value ?? null;

      const prevImport = validImports[validImports.length - 2]?.value ?? null;
      const prevExport = validExports[validExports.length - 2]?.value ?? null;

      return {
        id,
        eiaCode,
        name: meta?.name ?? id,
        flag: meta?.flag ?? "🌐",
        color: meta?.color ?? "#888",
        latestImport: latestImport as number | null,
        latestExport: latestExport as number | null,
        tradeBalance:
          latestImport !== null && latestExport !== null
            ? (latestExport as number) - (latestImport as number)
            : null,
        importCAGR:
          validImports.length > 1
            ? calculateCAGR(
                validImports[0].value as number,
                validImports[validImports.length - 1].value as number,
                validImports.length - 1
              )
            : 0,
        exportCAGR:
          validExports.length > 1
            ? calculateCAGR(
                validExports[0].value as number,
                validExports[validExports.length - 1].value as number,
                validExports.length - 1
              )
            : 0,
        importYoY: calculateYoY(latestImport as number, prevImport as number),
        exportYoY: calculateYoY(latestExport as number, prevExport as number),
        unit,
        importSeries,
        exportSeries,
      };
    });
  }, [data, countryIds, latestYear, unit]);

  // Build all years from all series
  const allYears: number[] = useMemo(() => {
    const yrs = new Set<number>();
    summaries.forEach((s) => {
      s.importSeries.forEach((d) => yrs.add(d.year));
      s.exportSeries.forEach((d) => yrs.add(d.year));
    });
    return Array.from(yrs).sort();
  }, [summaries]);

  // Heatmap: rows = countries, cols = years, value = import volume
  const heatmapData: { country: string; year: number; value: number | null }[] = useMemo(() => {
    const rows: { country: string; year: number; value: number | null }[] = [];
    for (const s of summaries) {
      for (const year of allYears) {
        const pt = s.importSeries.find((d) => d.year === year);
        rows.push({ country: `${s.flag} ${s.name}`, year, value: pt?.value ?? null });
      }
    }
    return rows;
  }, [summaries, allYears]);

  // Sankey: net-exporters → energy label → net-importers (each country on one side only to avoid DAG cycles)
  const sankeyData: SankeyData = useMemo(() => {
    const energyLabel = ENERGY_TYPE_MAP[energyType]?.label ?? energyType;
    const flowNode = `${energyLabel} Flow`;
    const nodes = new Set<string>();
    const links: { source: string; target: string; value: number }[] = [];

    for (const s of summaries) {
      const exp = s.latestExport ?? 0;
      const imp = s.latestImport ?? 0;
      if (exp <= 0 && imp <= 0) continue;

      if (exp >= imp) {
        // Net exporter: country → flow
        if (exp > 0) {
          nodes.add(s.name);
          nodes.add(flowNode);
          links.push({ source: s.name, target: flowNode, value: exp });
        }
      } else {
        // Net importer: flow → country
        nodes.add(flowNode);
        nodes.add(s.name);
        links.push({ source: flowNode, target: s.name, value: imp });
      }
    }

    // Need at least one link on each side to render the Sankey
    const hasExporter = links.some((l) => l.target === flowNode);
    const hasImporter = links.some((l) => l.source === flowNode);
    if (!hasExporter || !hasImporter) {
      return { nodes: [], links: [] };
    }

    return {
      nodes: Array.from(nodes).map((name) => ({ name })),
      links,
    };
  }, [summaries, energyType]);

  return { summaries, allYears, heatmapData, sankeyData, isLoading, isError, unit };
}
