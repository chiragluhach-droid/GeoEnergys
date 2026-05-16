import type { Metadata } from "next";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { ChartGrid } from "@/components/dashboard/ChartGrid";
import { EnergyTradeMap } from "@/components/maps/EnergyTradeMap";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Energy Trade Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Real-time import/export analytics powered by EIA.gov
        </p>
      </div>

      {/* Filters */}
      <FilterBar />

      {/* KPI row */}
      <StatsRow />

      {/* Map */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ height: 380, borderColor: "var(--color-border)" }}
      >
        <EnergyTradeMap />
      </div>

      {/* 2×2 Chart grid */}
      <ChartGrid />
    </div>
  );
}
