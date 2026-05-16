"use client";

import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { BarComparisonChart } from "@/components/charts/BarComparisonChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { AreaChart } from "@/components/charts/AreaChart";

export function ChartGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TimeSeriesChart />
      <BarComparisonChart />
      <AreaChart />
      <DonutChart />
    </div>
  );
}
