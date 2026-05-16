"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { COUNTRIES, ENERGY_TYPES } from "@/lib/utils/constants";
import { useGetCompareDataQuery } from "@/store/tradeApi";
import { formatNumber } from "@/lib/utils/formatters";
import type { EnergyType } from "@/types/trade";

export function QuickCompareWidget() {
  const [countryA, setCountryA] = useState("usa");
  const [countryB, setCountryB] = useState("china");
  const [energyType, setEnergyType] = useState<EnergyType>("coal");

  const countryAMeta = COUNTRIES.find((c) => c.id === countryA)!;
  const countryBMeta = COUNTRIES.find((c) => c.id === countryB)!;

  const { data, isLoading } = useGetCompareDataQuery({
    countries: [countryAMeta.eiaCode, countryBMeta.eiaCode],
    energyType,
    startYear: 2015,
    endYear: 2023,
  });

  // Build chart data — years × country import values
  const chartData = (() => {
    if (!data) return [];
    const aImports = data[countryAMeta.eiaCode]?.imports ?? [];
    const bImports = data[countryBMeta.eiaCode]?.imports ?? [];
    const years = [...new Set([...aImports.map((d) => d.year), ...bImports.map((d) => d.year)])].sort();
    return years.map((year) => ({
      year,
      [countryAMeta.name]: aImports.find((d) => d.year === year)?.value ?? null,
      [countryBMeta.name]: bImports.find((d) => d.year === year)?.value ?? null,
    }));
  })();

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300"
        style={{ background: "linear-gradient(145deg, var(--color-surface), rgba(255,255,255,0.03))", borderColor: "var(--color-border)" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
              Quick Compare
            </h2>
            <p className="text-sm mt-1.5 font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Side-by-side import trends — select any two countries
            </p>
          </div>
          <Link
            href={`/compare?countries=${countryA},${countryB}&energyType=${energyType}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl border transition-all hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:border-cyan-300 hover:shadow-md group"
            style={{ borderColor: "var(--color-border-2)", color: "var(--color-cyan)" }}
          >
            Full Compare
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8 relative z-10">
          <select
            value={countryA}
            onChange={(e) => setCountryA(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none cursor-pointer transition-all hover:border-cyan-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border-2)",
              color: "var(--color-text-primary)",
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>

          <ArrowRightLeft size={18} className="mx-1" style={{ color: "var(--color-text-muted)" }} />

          <select
            value={countryB}
            onChange={(e) => setCountryB(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none cursor-pointer transition-all hover:border-cyan-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border-2)",
              color: "var(--color-text-primary)",
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>

          <select
            value={energyType}
            onChange={(e) => setEnergyType(e.target.value as EnergyType)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none cursor-pointer transition-all hover:border-cyan-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border-2)",
              color: "var(--color-text-primary)",
            }}
          >
            {ENERGY_TYPES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.icon} {e.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mini chart */}
        {isLoading ? (
          <div
            className="h-48 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-surface-2)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Fetching EIA data…
            </p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="year"
                tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
                tickFormatter={(v) => formatNumber(v)}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
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
                formatter={(v: unknown) => [formatNumber(v as number), ""] as [string, string]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--color-text-secondary)" }}
              />
              <Line
                type="monotone"
                dataKey={countryAMeta.name}
                stroke={countryAMeta.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey={countryBMeta.name}
                stroke={countryBMeta.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div
            className="h-48 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-surface-2)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No data available for this combination
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
}
