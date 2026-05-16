import type { EnergyType, TradeDataPoint, TrendData, GlobalStats, SankeyData } from "@/types/trade";
import { COUNTRIES, COUNTRY_BY_EIA, CACHE_TTL } from "@/lib/utils/constants";
import { calculateCAGR, calculateYoY } from "@/lib/utils/formatters";
import { fetchTradeData, fetchMultiCountryTrade } from "./eiaService";
import { cacheService } from "./cacheService";
import { buildSankeyData } from "./normalizationService";

export async function getGlobalStats(
  energyType: EnergyType,
  year: number
): Promise<GlobalStats> {
  const cacheKey = cacheService.keys.stats(energyType, year);
  const cached = await cacheService.get<GlobalStats>("stats", ...cacheKey);
  if (cached) return cached;

  const allCodes = COUNTRIES.map((c) => c.eiaCode);

  const [importData, exportData] = await Promise.all([
    fetchMultiCountryTrade(allCodes, energyType, "import", year, year),
    fetchMultiCountryTrade(allCodes, energyType, "export", year, year),
  ]);

  const toRanked = (data: Record<string, TradeDataPoint[]>) =>
    COUNTRIES.map((c) => ({
      country: c,
      value: data[c.eiaCode]?.[0]?.value ?? 0,
      unit: data[c.eiaCode]?.[0]?.unit ?? "",
    }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

  const topImporters = toRanked(importData);
  const topExporters = toRanked(exportData);

  const totalTradeVolume = topImporters.reduce((s, r) => s + r.value, 0);
  const unit = topImporters[0]?.unit ?? "";

  const stats: GlobalStats = { topImporters, topExporters, totalTradeVolume, unit, latestYear: year };
  await cacheService.set("stats", cacheKey, stats, CACHE_TTL.stats);
  return stats;
}

export async function getTrendData(
  countryEiaCode: string,
  energyType: EnergyType,
  direction: "import" | "export",
  forecastYears = 5
): Promise<TrendData | null> {
  const cacheKey = cacheService.keys.trends(countryEiaCode, energyType, direction);
  const cached = await cacheService.get<TrendData>("trends", ...cacheKey);
  if (cached) return cached;

  const country = COUNTRY_BY_EIA[countryEiaCode];
  if (!country) return null;

  const historical = await fetchTradeData(countryEiaCode, energyType, direction, 2000, 2023);
  const valid = historical.filter((d) => d.value !== null);

  if (valid.length < 2) return null;

  // Linear regression for forecast
  const n = valid.length;
  const xs = valid.map((_, i) => i);
  const ys = valid.map((d) => d.value as number);
  const xMean = xs.reduce((s, x) => s + x, 0) / n;
  const yMean = ys.reduce((s, y) => s + y, 0) / n;
  const slope =
    xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0) /
    xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
  const intercept = yMean - slope * xMean;

  const lastYear = valid[valid.length - 1].year;
  const forecastData: TradeDataPoint[] = Array.from({ length: forecastYears }, (_, i) => ({
    year: lastYear + i + 1,
    value: Math.max(0, intercept + slope * (n + i)),
    unit: valid[0].unit,
    country: countryEiaCode,
    energyType,
    direction,
  }));

  const firstVal = valid[0].value as number;
  const lastVal = valid[valid.length - 1].value as number;
  const cagr = calculateCAGR(firstVal, lastVal, valid.length - 1);
  const yoyChange =
    calculateYoY(
      valid[valid.length - 1].value,
      valid[valid.length - 2]?.value ?? null
    ) ?? 0;

  const result: TrendData = { country, energyType, direction, historicalData: historical, forecastData, cagr, yoyChange };
  await cacheService.set("trends", cacheKey, result, CACHE_TTL.trends);
  return result;
}

export async function getSankeyData(
  energyType: EnergyType,
  year: number
): Promise<SankeyData> {
  // Build a simplified country→energyType→country Sankey using export volumes
  const allCodes = COUNTRIES.map((c) => c.eiaCode);
  const exportData = await fetchMultiCountryTrade(allCodes, energyType, "export", year, year);

  const flows: { exporter: string; importer: string; value: number }[] = [];

  for (const [exporterCode, points] of Object.entries(exportData)) {
    const value = points[0]?.value ?? 0;
    if (value <= 0) continue;

    const exporterName = COUNTRY_BY_EIA[exporterCode]?.name ?? exporterCode;
    const energyLabel = energyType.charAt(0).toUpperCase() + energyType.slice(1);

    // Exporter → energy type node
    flows.push({ exporter: exporterName, importer: energyLabel, value });

    // Energy type node → top importing countries (approximate by import data)
    for (const importer of COUNTRIES.slice(0, 3)) {
      if (importer.eiaCode === exporterCode) continue;
      flows.push({ exporter: energyLabel, importer: importer.name, value: value / 3 });
    }
  }

  return buildSankeyData(flows);
}
