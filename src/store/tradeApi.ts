import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { EnergyType, TradeDataPoint, GlobalStats, TrendData, EnergyBalancePoint } from "@/types/trade";
import type { ApiResponse } from "@/types/api";

export const tradeApi = createApi({
  reducerPath: "tradeApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Trade", "Stats", "Trends"],
  endpoints: (builder) => ({
    getStats: builder.query<GlobalStats, { energyType?: EnergyType; year?: number }>({
      query: ({ energyType = "coal", year = 2023 }) =>
        `/stats?energyType=${energyType}&year=${year}`,
      transformResponse: (res: ApiResponse<GlobalStats>) => res.data!,
      providesTags: ["Stats"],
      keepUnusedDataFor: 1800,
    }),

    getTradeData: builder.query<
      Record<string, { imports: TradeDataPoint[]; exports: TradeDataPoint[] }>,
      { country: string | string[]; energyType?: EnergyType; direction?: string; startYear?: number; endYear?: number }
    >({
      query: ({ country, energyType = "coal", direction = "both", startYear = 2010, endYear = 2023 }) => {
        const countries = Array.isArray(country) ? country : [country];
        const params = new URLSearchParams({
          energyType,
          direction,
          startYear: String(startYear),
          endYear: String(endYear),
        });
        countries.forEach((c) => params.append("country", c));
        return `/trade?${params}`;
      },
      transformResponse: (res: ApiResponse<Record<string, { imports: TradeDataPoint[]; exports: TradeDataPoint[] }>>) =>
        res.data!,
      providesTags: ["Trade"],
      keepUnusedDataFor: 300,
    }),

    getCompareData: builder.query<
      Record<string, { imports: TradeDataPoint[]; exports: TradeDataPoint[] }>,
      { countries: string[]; energyType?: EnergyType; startYear?: number; endYear?: number }
    >({
      query: ({ countries, energyType = "coal", startYear = 2010, endYear = 2023 }) =>
        `/compare?countries=${countries.join(",")}&energyType=${energyType}&startYear=${startYear}&endYear=${endYear}`,
      transformResponse: (res: ApiResponse<Record<string, { imports: TradeDataPoint[]; exports: TradeDataPoint[] }>>) =>
        res.data!,
      providesTags: ["Trade"],
      keepUnusedDataFor: 300,
    }),

    getTrends: builder.query<TrendData, { country: string; energyType?: EnergyType; direction?: string }>({
      query: ({ country, energyType = "coal", direction = "import" }) =>
        `/trends?country=${country}&energyType=${energyType}&direction=${direction}`,
      transformResponse: (res: ApiResponse<TrendData>) => res.data!,
      providesTags: ["Trends"],
      keepUnusedDataFor: 7200,
    }),

    getEnergyBalance: builder.query<EnergyBalancePoint[], { country: string; startYear?: number; endYear?: number }>({
      query: ({ country, startYear = 2000, endYear = 2023 }) =>
        `/energy-balance?country=${country}&startYear=${startYear}&endYear=${endYear}`,
      transformResponse: (res: ApiResponse<EnergyBalancePoint[]>) => res.data!,
      providesTags: ["Trade"],
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetTradeDataQuery,
  useGetCompareDataQuery,
  useGetTrendsQuery,
  useGetEnergyBalanceQuery,
} = tradeApi;
