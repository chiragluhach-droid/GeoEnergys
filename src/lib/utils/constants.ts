import type { CountryMeta, EnergyType } from "@/types/trade";

export const COUNTRIES: CountryMeta[] = [
  {
    id: "usa",
    name: "United States",
    eiaCode: "USA",
    flag: "🇺🇸",
    region: "North America",
    coordinates: [-95.7, 37.1],
    color: "#06b6d4",
  },
  {
    id: "china",
    name: "China",
    eiaCode: "CHN",
    flag: "🇨🇳",
    region: "Asia Pacific",
    coordinates: [104.2, 35.9],
    color: "#f59e0b",
  },
  {
    id: "india",
    name: "India",
    eiaCode: "IND",
    flag: "🇮🇳",
    region: "Asia Pacific",
    coordinates: [78.9, 20.6],
    color: "#10b981",
  },
  {
    id: "russia",
    name: "Russia",
    eiaCode: "RUS",
    flag: "🇷🇺",
    region: "Europe/Asia",
    coordinates: [105.3, 61.5],
    color: "#ef4444",
  },
  {
    id: "saudi-arabia",
    name: "Saudi Arabia",
    eiaCode: "SAU",
    flag: "🇸🇦",
    region: "Middle East",
    coordinates: [45.1, 23.9],
    color: "#8b5cf6",
  },
  {
    id: "germany",
    name: "Germany",
    eiaCode: "DEU",
    flag: "🇩🇪",
    region: "Europe",
    coordinates: [10.5, 51.2],
    color: "#f97316",
  },
  {
    id: "japan",
    name: "Japan",
    eiaCode: "JPN",
    flag: "🇯🇵",
    region: "Asia Pacific",
    coordinates: [138.3, 36.2],
    color: "#ec4899",
  },
  {
    id: "canada",
    name: "Canada",
    eiaCode: "CAN",
    flag: "🇨🇦",
    region: "North America",
    coordinates: [-96.8, 56.1],
    color: "#14b8a6",
  },
  {
    id: "uae",
    name: "UAE",
    eiaCode: "ARE",
    flag: "🇦🇪",
    region: "Middle East",
    coordinates: [53.8, 23.4],
    color: "#a78bfa",
  },
  {
    id: "australia",
    name: "Australia",
    eiaCode: "AUS",
    flag: "🇦🇺",
    region: "Asia Pacific",
    coordinates: [133.8, -25.3],
    color: "#fbbf24",
  },
];

export const COUNTRY_MAP = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, c])
);

export const COUNTRY_BY_EIA = Object.fromEntries(
  COUNTRIES.map((c) => [c.eiaCode, c])
);

export const ENERGY_TYPES: { id: EnergyType; label: string; icon: string; unit: string }[] = [
  { id: "crude-oil", label: "Crude Oil", icon: "🛢️", unit: "thousand barrels/day" },
  { id: "natural-gas", label: "Natural Gas", icon: "🔥", unit: "billion cubic feet" },
  { id: "lng", label: "LNG", icon: "🧊", unit: "billion cubic feet" },
  { id: "coal", label: "Coal", icon: "⚫", unit: "thousand short tons" },
  { id: "electricity", label: "Electricity", icon: "⚡", unit: "billion kWh" },
];

export const ENERGY_TYPE_MAP = Object.fromEntries(
  ENERGY_TYPES.map((e) => [e.id, e])
);

export const EIA_BASE_URL = "https://api.eia.gov/v2";

export const EIA_ROUTES = {
  international: `${EIA_BASE_URL}/international/`,
  petroleum: `${EIA_BASE_URL}/petroleum/`,
  naturalGas: `${EIA_BASE_URL}/natural-gas/`,
  coal: `${EIA_BASE_URL}/coal/`,
  crudeOilImports: `${EIA_BASE_URL}/crude-oil-imports/`,
  electricity: `${EIA_BASE_URL}/electricity/`,
} as const;

// EIA v2 product IDs for international trade
export const EIA_PRODUCT_IDS = {
  "crude-oil": { productId: "57", unit: "TBPD" },
  "natural-gas": { productId: "26", unit: "BCF" },
  "coal": { productId: "7", unit: "TST" },
  "electricity": { productId: "2", unit: "BKWH" },
} as const;

export const DEFAULT_YEAR_RANGE: [number, number] = [2010, 2023];
export const AVAILABLE_YEARS = Array.from(
  { length: 2023 - 2000 + 1 },
  (_, i) => 2000 + i
);

export const CACHE_TTL = {
  tradeData: 3600,      // 1 hour
  stats: 1800,          // 30 min
  countries: 86400,     // 24 hours
  trends: 7200,         // 2 hours
} as const;
