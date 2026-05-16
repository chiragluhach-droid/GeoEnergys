export type TradeDirection = "import" | "export" | "both" | "production" | "consumption";

export type EnergyType =
  | "crude-oil"
  | "natural-gas"
  | "lng"
  | "coal"
  | "electricity"
  | "total";

export interface CountryMeta {
  id: string;
  name: string;
  eiaCode: string;
  flag: string;
  region: string;
  coordinates: [number, number]; // [lng, lat]
  color: string;
}

export interface TradeDataPoint {
  year: number;
  value: number | null;
  unit: string;
  country: string;
  energyType: EnergyType;
  direction: "import" | "export" | "production" | "consumption";
}

export interface EnergyBalancePoint {
  year: number;
  production: number | null;
  consumption: number | null;
  unit: string;
  country: string;
}

export interface CountryTradeData {
  country: CountryMeta;
  imports: TradeDataPoint[];
  exports: TradeDataPoint[];
  netBalance: TradeDataPoint[];
}

export interface ComparisonData {
  countries: CountryMeta[];
  energyType: EnergyType;
  yearRange: [number, number];
  series: {
    [countryId: string]: {
      imports: TradeDataPoint[];
      exports: TradeDataPoint[];
    };
  };
}

export interface GlobalStats {
  topImporters: { country: CountryMeta; value: number; unit: string }[];
  topExporters: { country: CountryMeta; value: number; unit: string }[];
  totalTradeVolume: number;
  unit: string;
  latestYear: number;
}

export interface TrendData {
  country: CountryMeta;
  energyType: EnergyType;
  direction: "import" | "export";
  historicalData: TradeDataPoint[];
  forecastData: TradeDataPoint[];
  cagr: number;
  yoyChange: number;
}

export interface SankeyNode {
  name: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}
