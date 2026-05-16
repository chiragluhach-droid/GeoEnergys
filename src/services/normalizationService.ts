import type { EIAResponseItem } from "@/types/eia";
import type { EnergyType, TradeDataPoint } from "@/types/trade";
import { parseEIAValue } from "@/lib/utils/formatters";
import { ENERGY_TYPES } from "@/lib/utils/constants";

function periodToYear(period: string): number {
  // Handles "2023", "202301", "2023Q1"
  return parseInt(period.slice(0, 4), 10);
}

function getUnit(energyType: EnergyType): string {
  return ENERGY_TYPES.find((e) => e.id === energyType)?.unit ?? "units";
}

export function normalizeEIAItems(
  items: EIAResponseItem[],
  country: string,
  energyType: EnergyType,
  direction: "import" | "export"
): TradeDataPoint[] {
  const byYear = new Map<number, number | null>();

  for (const item of items) {
    const year = periodToYear(item.period);
    const value = parseEIAValue(item.value);

    // If multiple rows per year, sum them (e.g. monthly data aggregated)
    if (byYear.has(year)) {
      const existing = byYear.get(year) ?? null;
      if (existing !== null && value !== null) {
        byYear.set(year, existing + value);
      }
    } else {
      byYear.set(year, value);
    }
  }

  const unit = getUnit(energyType);

  return Array.from(byYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, value]) => ({ year, value, unit, country, energyType, direction }));
}

export function buildSankeyData(
  allData: { exporter: string; importer: string; value: number }[]
) {
  const nodeSet = new Set<string>();
  for (const d of allData) {
    nodeSet.add(d.exporter);
    nodeSet.add(d.importer);
  }
  const nodes = Array.from(nodeSet).map((name) => ({ name }));
  const links = allData
    .filter((d) => d.value > 0)
    .map((d) => ({ source: d.exporter, target: d.importer, value: d.value }));

  return { nodes, links };
}
