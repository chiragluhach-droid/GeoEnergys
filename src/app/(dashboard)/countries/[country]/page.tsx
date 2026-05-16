"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { EChartsOption, SeriesOption } from "echarts";
import { COUNTRY_MAP, ENERGY_TYPES, ENERGY_TYPE_MAP } from "@/lib/utils/constants";
import { useGetTradeDataQuery } from "@/store/tradeApi";
import { formatNumber, formatPercent, calculateCAGR, calculateYoY } from "@/lib/utils/formatters";
import type { EnergyType } from "@/types/trade";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

function AreaImportExportChart({ eiaCode, energyType, color }: { eiaCode: string; energyType: EnergyType; color: string }) {
  const { data, isLoading } = useGetTradeDataQuery({ country: eiaCode, energyType, direction: "both", startYear: 2000, endYear: 2023 });
  const imports = data?.[eiaCode]?.imports ?? [];
  const exports = data?.[eiaCode]?.exports ?? [];
  const years = [...new Set([...imports.map((d) => d.year), ...exports.map((d) => d.year)])].sort();
  const unit = ENERGY_TYPE_MAP[energyType]?.unit ?? "";

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: "#ffffff", borderColor: "#e2e8f0", textStyle: { color: "#0f172a", fontSize: 12 }, extraCssText: "box-shadow:0 4px 16px rgba(0,0,0,0.1);border-radius:8px;" },
    legend: { data: ["Imports", "Exports"], textStyle: { color: "#64748b", fontSize: 11 }, bottom: 0 },
    grid: { top: 8, right: 8, bottom: 36, left: 54 },
    xAxis: { type: "category", data: years.map(String), axisLabel: { color: "#64748b", fontSize: 10 }, axisLine: { lineStyle: { color: "#e2e8f0" } } },
    yAxis: { type: "value", axisLabel: { color: "#64748b", fontSize: 10, formatter: (v: number) => formatNumber(v) }, splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } } },
    series: [
      { name: "Imports", type: "line" as const, smooth: true, symbol: "none", lineStyle: { color: "#f43f5e", width: 2 }, areaStyle: { color: "#f43f5e18" }, data: years.map((y) => imports.find((d) => d.year === y)?.value ?? null) },
      { name: "Exports", type: "line" as const, smooth: true, symbol: "none", lineStyle: { color: color, width: 2 }, areaStyle: { color: color + "18" }, data: years.map((y) => exports.find((d) => d.year === y)?.value ?? null) },
    ],
  };

  if (isLoading) return <div className="h-52 flex items-center justify-center"><p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Loading…</p></div>;
  return <><ReactECharts option={option} style={{ height: 208 }} notMerge /><p className="text-xs mt-1 text-center" style={{ color: "var(--color-text-muted)" }}>{unit}</p></>;
}

function DonutMixChart({ eiaCode, year }: { eiaCode: string; year: number }) {
  const COLORS = ["#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#f97316", "#ec4899"];
  const queries = ENERGY_TYPES.slice(0, 5).map((e) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGetTradeDataQuery({ country: eiaCode, energyType: e.id, direction: "import", startYear: year, endYear: year })
  );
  const pieData = ENERGY_TYPES.slice(0, 5)
    .map((e, i) => {
      const val = queries[i].data?.[eiaCode]?.imports?.[0]?.value ?? 0;
      return { name: `${e.icon} ${e.label}`, value: val as number, itemStyle: { color: COLORS[i] } };
    })
    .filter((d) => d.value > 0);

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "item", backgroundColor: "#ffffff", borderColor: "#e2e8f0", textStyle: { color: "#0f172a", fontSize: 11 }, extraCssText: "box-shadow:0 4px 16px rgba(0,0,0,0.1);border-radius:8px;" },
    legend: { orient: "vertical", right: 4, top: "center", textStyle: { color: "#64748b", fontSize: 10 } },
    series: [{ type: "pie" as const, radius: ["38%", "66%"], center: ["36%", "50%"], label: { show: false }, data: pieData }],
  };

  if (pieData.length === 0) return <div className="h-52 flex items-center justify-center"><p className="text-xs" style={{ color: "var(--color-text-muted)" }}>No mix data</p></div>;
  return <ReactECharts option={option} style={{ height: 208 }} notMerge />;
}

export default function CountryDetailPage({ params }: { params: Promise<{ country: string }> }) {
  const { country: countryId } = use(params);
  const meta = COUNTRY_MAP[countryId];
  if (!meta) notFound();

  const [energyType, setEnergyType] = useState<EnergyType>("coal");
  const { data, isLoading } = useGetTradeDataQuery({ country: meta.eiaCode, energyType, direction: "both", startYear: 2000, endYear: 2023 });

  const imports = data?.[meta.eiaCode]?.imports ?? [];
  const exports = data?.[meta.eiaCode]?.exports ?? [];
  const validImports = imports.filter((d) => d.value !== null);
  const validExports = exports.filter((d) => d.value !== null);
  const latestImport = validImports[validImports.length - 1]?.value as number ?? 0;
  const latestExport = validExports[validExports.length - 1]?.value as number ?? 0;
  const prevImport = validImports[validImports.length - 2]?.value as number ?? latestImport;
  const prevExport = validExports[validExports.length - 2]?.value as number ?? latestExport;
  const tradeBalance = latestExport - latestImport;
  const importCagr = validImports.length > 1 ? calculateCAGR(validImports[0].value as number, latestImport, validImports.length - 1) : 0;
  const importYoy = calculateYoY(latestImport, prevImport) ?? 0;
  const exportYoy = calculateYoY(latestExport, prevExport) ?? 0;
  const unit = ENERGY_TYPE_MAP[energyType]?.unit ?? "";
  const latestYear = validImports[validImports.length - 1]?.year ?? 2023;

  // Year-by-year table
  const tableYears = [...new Set([...imports.map((d) => d.year), ...exports.map((d) => d.year)])].sort().reverse().slice(0, 10);

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      {/* Back */}
      <Link href="/countries" className="inline-flex items-center gap-1.5 text-xs hover:opacity-80" style={{ color: "var(--color-text-secondary)" }}>
        <ArrowLeft size={13} /> All Countries
      </Link>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border p-6 flex flex-col sm:flex-row sm:items-center gap-6"
        style={{ background: "var(--color-surface)", borderColor: meta.color + "44", borderLeftWidth: 4, borderLeftColor: meta.color }}
      >
        <div className="flex items-center gap-4">
          <span className="text-5xl">{meta.flag}</span>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>{meta.name}</h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{meta.region} · EIA Code: {meta.eiaCode}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="sm:ml-auto grid grid-cols-3 gap-4 text-center">
          {[
            { label: `Imports ${latestYear}`, value: formatNumber(latestImport), sub: `${formatPercent(importYoy)} YoY`, color: "#f43f5e" },
            { label: `Exports ${latestYear}`, value: formatNumber(latestExport), sub: `${formatPercent(exportYoy)} YoY`, color: meta.color },
            { label: "Trade Balance", value: `${tradeBalance >= 0 ? "+" : ""}${formatNumber(tradeBalance)}`, sub: `CAGR ${formatPercent(importCagr)}`, color: tradeBalance >= 0 ? "var(--color-emerald)" : "var(--color-rose)" },
          ].map(({ label, value, sub, color }) => (
            <div key={label}>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</p>
              <p className="text-lg font-bold" style={{ color }}>{isLoading ? "…" : value}</p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{isLoading ? "" : sub}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Energy type selector */}
      <div className="flex flex-wrap gap-2">
        {ENERGY_TYPES.map((e) => (
          <button
            key={e.id}
            onClick={() => setEnergyType(e.id as EnergyType)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{
              background: energyType === e.id ? meta.color + "22" : "transparent",
              borderColor: energyType === e.id ? meta.color : "var(--color-border)",
              color: energyType === e.id ? meta.color : "var(--color-text-secondary)",
            }}
          >
            {e.icon} {e.label}
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
            {ENERGY_TYPE_MAP[energyType]?.label} Import vs Export (2000–2023)
          </h3>
          <AreaImportExportChart eiaCode={meta.eiaCode} energyType={energyType} color={meta.color} />
        </div>

        <div className="rounded-xl border p-4" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
            Energy Import Mix — {latestYear}
          </h3>
          <DonutMixChart eiaCode={meta.eiaCode} year={latestYear} />
        </div>
      </div>

      {/* Year-by-year data table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        <div className="px-4 py-3 border-b" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Year-by-Year Data — {ENERGY_TYPE_MAP[energyType]?.label}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "var(--color-surface-2)" }}>
                {["Year", "Imports", "Exports", "Balance", "YoY Imports"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableYears.map((year, i) => {
                const imp = imports.find((d) => d.year === year)?.value as number ?? null;
                const exp = exports.find((d) => d.year === year)?.value as number ?? null;
                const bal = imp !== null && exp !== null ? exp - imp : null;
                const prevImpVal = imports.find((d) => d.year === year - 1)?.value as number ?? null;
                const yoy = calculateYoY(imp, prevImpVal);
                return (
                  <tr
                    key={year}
                    className="border-t"
                    style={{ background: i % 2 === 0 ? "var(--color-surface)" : "var(--color-surface-2)", borderColor: "var(--color-border)" }}
                  >
                    <td className="px-4 py-2 font-medium" style={{ color: "var(--color-text-primary)" }}>{year}</td>
                    <td className="px-4 py-2" style={{ color: "#f43f5e" }}>{imp !== null ? formatNumber(imp) : "—"}</td>
                    <td className="px-4 py-2" style={{ color: meta.color }}>{exp !== null ? formatNumber(exp) : "—"}</td>
                    <td className="px-4 py-2" style={{ color: bal === null ? "var(--color-text-muted)" : bal >= 0 ? "var(--color-emerald)" : "var(--color-rose)" }}>
                      {bal !== null ? `${bal >= 0 ? "+" : ""}${formatNumber(bal)}` : "—"}
                    </td>
                    <td className="px-4 py-2">
                      {yoy !== null ? (
                        <span className="inline-flex items-center gap-0.5" style={{ color: yoy >= 0 ? "var(--color-emerald)" : "var(--color-rose)" }}>
                          {yoy >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {formatPercent(yoy)}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
