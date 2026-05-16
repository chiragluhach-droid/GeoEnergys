"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ENERGY_TYPE_MAP, COUNTRIES } from "@/lib/utils/constants";
import { useGetCompareDataQuery, useGetStatsQuery } from "@/store/tradeApi";
import { EnergyFlowSankey } from "@/components/charts/EnergyFlowSankey";
import { TradeBalanceWaterfall } from "@/components/charts/TradeBalanceWaterfall";
import { formatNumber, formatPercent, calculateCAGR } from "@/lib/utils/formatters";
import type { EnergyType } from "@/types/trade";
import type { SankeyData } from "@/types/trade";

export default function EnergyTypeDetailPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const energyMeta = ENERGY_TYPE_MAP[type as EnergyType];
  if (!energyMeta) notFound();

  const energyType = type as EnergyType;
  const allCodes = COUNTRIES.map((c) => c.eiaCode);

  const { data: compareData, isLoading } = useGetCompareDataQuery({
    countries: allCodes,
    energyType,
    startYear: 2015,
    endYear: 2023,
  });

  const { data: stats } = useGetStatsQuery({ energyType, year: 2023 });

  // Build waterfall data
  const waterfallData = COUNTRIES.map((c) => {
    const imp = compareData?.[c.eiaCode]?.imports?.find((d) => d.year === 2023)?.value as number ?? 0;
    const exp = compareData?.[c.eiaCode]?.exports?.find((d) => d.year === 2023)?.value as number ?? 0;
    return { name: c.name, flag: c.flag, balance: exp - imp, color: c.color };
  });

  // Build Sankey
  const sankeyData: SankeyData = (() => {
    const nodes = new Set<string>();
    const links: { source: string; target: string; value: number }[] = [];
    const label = energyMeta.label;

    for (const c of COUNTRIES) {
      const exp = compareData?.[c.eiaCode]?.exports?.find((d) => d.year === 2023)?.value as number ?? 0;
      if (exp > 0) {
        nodes.add(c.name);
        nodes.add(`${label} Market`);
        links.push({ source: c.name, target: `${label} Market`, value: exp });
      }
    }
    for (const c of COUNTRIES) {
      const imp = compareData?.[c.eiaCode]?.imports?.find((d) => d.year === 2023)?.value as number ?? 0;
      if (imp > 0) {
        nodes.add(`${label} Market`);
        nodes.add(c.name);
        links.push({ source: `${label} Market`, target: c.name, value: imp });
      }
    }

    return { nodes: Array.from(nodes).map((n) => ({ name: n })), links };
  })();

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      <Link href="/energy" className="inline-flex items-center gap-1.5 text-xs hover:opacity-80" style={{ color: "var(--color-text-secondary)" }}>
        <ArrowLeft size={13} /> All Energy Types
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border p-6"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{energyMeta.icon}</span>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              {energyMeta.label}
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Global import/export data · Unit: {energyMeta.unit}
            </p>
          </div>
        </div>

        {/* Top traders 2023 */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                Top Importers — 2023
              </p>
              <div className="space-y-1.5">
                {stats.topImporters.map((r, i) => (
                  <div key={r.country.id} className="flex items-center gap-2">
                    <span className="text-xs w-4" style={{ color: "var(--color-text-muted)" }}>{i + 1}</span>
                    <span>{r.country.flag}</span>
                    <span className="text-xs flex-1" style={{ color: "var(--color-text-secondary)" }}>{r.country.name}</span>
                    <span className="text-xs font-semibold" style={{ color: "#f43f5e" }}>{formatNumber(r.value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                Top Exporters — 2023
              </p>
              <div className="space-y-1.5">
                {stats.topExporters.map((r, i) => (
                  <div key={r.country.id} className="flex items-center gap-2">
                    <span className="text-xs w-4" style={{ color: "var(--color-text-muted)" }}>{i + 1}</span>
                    <span>{r.country.flag}</span>
                    <span className="text-xs flex-1" style={{ color: "var(--color-text-secondary)" }}>{r.country.name}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--color-emerald)" }}>{formatNumber(r.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <EnergyFlowSankey data={sankeyData} unit={energyMeta.unit} isLoading={isLoading} />
        <TradeBalanceWaterfall data={waterfallData} unit={energyMeta.unit} isLoading={isLoading} />
      </div>
    </div>
  );
}
