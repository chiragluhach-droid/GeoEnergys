"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useGetStatsQuery } from "@/store/tradeApi";
import { formatNumber } from "@/lib/utils/formatters";
import { COUNTRIES } from "@/lib/utils/constants";
import type { EnergyType } from "@/types/trade";
import { useState } from "react";

const ENERGY_TABS: { id: EnergyType; label: string }[] = [
  { id: "coal", label: "Coal" },
  { id: "natural-gas", label: "Natural Gas" },
  { id: "electricity", label: "Electricity" },
];

function RankingChart({
  title,
  data,
  unit,
}: {
  title: string;
  data: { name: string; flag: string; value: number; color: string }[];
  unit: string;
}) {
  return (
    <div
      className="rounded-3xl p-6 sm:p-8 border flex-1 backdrop-blur-xl shadow-sm transition-all hover:shadow-lg relative overflow-hidden group"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-500" />
      <h3 className="text-lg font-extrabold mb-6 relative z-10" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h3>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Loading data…
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
              tickFormatter={(v) => formatNumber(v)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={({ x, y, payload }) => {
                const entry = data.find((d) => d.name === payload.value);
                return (
                  <text x={x} y={y} dy={4} textAnchor="end" fontSize={11} fill="var(--color-text-secondary)">
                    {entry?.flag} {payload.value}
                  </text>
                );
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-surface-2)', opacity: 0.6 }}
              contentStyle={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                fontSize: 13,
                color: "#1e293b",
                fontWeight: 600,
                padding: "10px 14px",
              }}
              itemStyle={{ color: "#334155", fontWeight: 700 }}
              formatter={(v: unknown) => [`${formatNumber(v as number)} ${unit}`, ""] as [string, string]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function TopCountriesRanking() {
  const [energyType, setEnergyType] = useState<EnergyType>("coal");
  const { data: stats, isLoading } = useGetStatsQuery({ energyType, year: 2023 });

  const toChartData = (items: typeof stats extends undefined ? never : NonNullable<typeof stats>["topImporters"]) =>
    (items ?? []).map((r) => ({
      name: r.country.name,
      flag: r.country.flag,
      value: r.value,
      color: r.country.color,
    }));

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10"
      >
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Top Trading Nations — 2023
          </h2>
          <p className="text-base font-medium mt-2" style={{ color: "var(--color-text-secondary)" }}>
            Leading importers and exporters by energy volume
          </p>
        </div>

        {/* Energy type tabs */}
        <div
          className="flex gap-2 p-1.5 rounded-2xl border shadow-sm relative z-10"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          {ENERGY_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setEnergyType(id)}
              className="relative px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
              style={{
                color: energyType === id ? "#ffffff" : "var(--color-text-secondary)",
              }}
            >
              {energyType === id && (
                <motion.div
                  layoutId="ranking-tab"
                  className="absolute inset-0 rounded-xl shadow-md"
                  style={{ background: "var(--color-cyan)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4">
        <RankingChart
          title="🔽 Top Importers"
          data={isLoading ? [] : toChartData(stats?.topImporters ?? [])}
          unit={stats?.unit ?? ""}
        />
        <RankingChart
          title="🔼 Top Exporters"
          data={isLoading ? [] : toChartData(stats?.topExporters ?? [])}
          unit={stats?.unit ?? ""}
        />
      </div>
    </section>
  );
}
