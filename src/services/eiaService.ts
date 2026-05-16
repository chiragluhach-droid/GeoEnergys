import type { EnergyType, TradeDataPoint } from "@/types/trade";
import { CACHE_TTL } from "@/lib/utils/constants";
import { connectDB } from "@/lib/db/mongoose";
import { Trade } from "@/lib/db/models/Trade";
import { cacheService } from "./cacheService";

/**
 * Query MongoDB for pre-seeded EIA trade data (populated by scripts/fetchEIAData.py).
 * Redis cache-first → MongoDB on miss.
 */
export async function fetchTradeData(
  countryEiaCode: string,
  energyType: EnergyType,
  direction: "import" | "export",
  startYear = 2000,
  endYear = 2023
): Promise<TradeDataPoint[]> {
  const cacheKey = cacheService.keys.trade(
    countryEiaCode, energyType, direction, startYear, endYear
  );

  const cached = await cacheService.get<TradeDataPoint[]>("trade", ...cacheKey);
  if (cached) return cached;

  await connectDB();

  const docs = await Trade.find({
    "metadata.country":    countryEiaCode,
    "metadata.energyType": energyType,
    "metadata.direction":  direction,
    period: {
      $gte: String(startYear),
      $lte: String(endYear),
    },
  })
    .select("period measurements.value metadata.unit")
    .lean();

  const data: TradeDataPoint[] = docs
    .map((d) => ({
      year:       parseInt(d.period, 10),
      value:      (d.measurements as { value: number | null }).value ?? null,
      unit:       (d.metadata as { unit: string }).unit,
      country:    countryEiaCode,
      energyType,
      direction,
    }))
    .filter((d) => !isNaN(d.year))
    .sort((a, b) => a.year - b.year);

  await cacheService.set("trade", cacheKey, data, CACHE_TTL.tradeData);
  return data;
}

export async function fetchMultiCountryTrade(
  countryCodes: string[],
  energyType: EnergyType,
  direction: "import" | "export",
  startYear = 2000,
  endYear = 2023
): Promise<Record<string, TradeDataPoint[]>> {
  const results = await Promise.all(
    countryCodes.map((code) =>
      fetchTradeData(code, energyType, direction, startYear, endYear)
    )
  );
  return Object.fromEntries(countryCodes.map((code, i) => [code, results[i]]));
}
