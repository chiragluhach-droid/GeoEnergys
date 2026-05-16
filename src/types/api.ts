import type { EnergyType, TradeDirection } from "./trade";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}

export interface TradeQueryParams {
  country?: string | string[];
  energyType?: EnergyType;
  direction?: TradeDirection;
  startYear?: number;
  endYear?: number;
}

export interface CompareQueryParams {
  countries: string[];
  energyType: EnergyType;
  startYear?: number;
  endYear?: number;
}

export interface TrendQueryParams {
  country: string;
  energyType: EnergyType;
  direction: "import" | "export";
  forecastYears?: number;
}
