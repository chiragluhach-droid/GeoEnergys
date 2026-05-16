import { z } from "zod";

const energyTypeValues = ["crude-oil", "natural-gas", "lng", "coal", "electricity"] as const;
const directionValues = ["import", "export", "both"] as const;

export const TradeQuerySchema = z.object({
  country: z.union([z.string(), z.array(z.string())]).optional(),
  energyType: z.enum(energyTypeValues).optional().default("coal"),
  direction: z.enum(directionValues).optional().default("both"),
  startYear: z.coerce.number().int().min(1990).max(2030).optional().default(2010),
  endYear: z.coerce.number().int().min(1990).max(2030).optional().default(2023),
});

export const CompareQuerySchema = z.object({
  countries: z.union([z.string(), z.array(z.string())]).transform((v) =>
    Array.isArray(v) ? v : v.split(",")
  ),
  energyType: z.enum(energyTypeValues).optional().default("coal"),
  startYear: z.coerce.number().int().min(1990).max(2030).optional().default(2010),
  endYear: z.coerce.number().int().min(1990).max(2030).optional().default(2023),
});

export const TrendQuerySchema = z.object({
  country: z.string(),
  energyType: z.enum(energyTypeValues).optional().default("coal"),
  direction: z.enum(["import", "export"] as const).optional().default("import"),
  forecastYears: z.coerce.number().int().min(1).max(10).optional().default(5),
});

export const StatsQuerySchema = z.object({
  energyType: z.enum(energyTypeValues).optional().default("coal"),
  year: z.coerce.number().int().min(1990).max(2030).optional().default(2023),
});
