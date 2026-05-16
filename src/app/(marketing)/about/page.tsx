"use client";

import { motion } from "framer-motion";
import {
  Database,
  Globe,
  RefreshCw,
  Shield,
  BarChart2,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Zap,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="p-2.5 rounded-lg bg-sky-50 border border-cyan-500/20 mt-0.5">
        <Icon className="w-5 h-5 text-sky-600" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}

const ENERGY_SOURCES = [
  {
    type: "Petroleum & Liquids",
    eiaRoute: "/international/",
    activityImport: "PATIMP",
    activityExport: "PATEXP",
    unit: "thousand barrels/day",
  },
  {
    type: "Crude Oil",
    eiaRoute: "/international/",
    activityImport: "CRNTIMP",
    activityExport: "CRNTEXP",
    unit: "thousand barrels/day",
  },
  {
    type: "Natural Gas",
    eiaRoute: "/international/",
    activityImport: "NGIMP",
    activityExport: "NGEXP",
    unit: "billion cubic feet",
  },
  {
    type: "Coal",
    eiaRoute: "/international/",
    activityImport: "CLIMP",
    activityExport: "CLEXP",
    unit: "million short tons",
  },
  {
    type: "Electricity",
    eiaRoute: "/international/",
    activityImport: "ELIMP",
    activityExport: "ELEXP",
    unit: "billion kWh",
  },
];

const COUNTRIES = [
  { name: "United States", code: "USA", flag: "🇺🇸" },
  { name: "China", code: "CHN", flag: "🇨🇳" },
  { name: "India", code: "IND", flag: "🇮🇳" },
  { name: "Russia", code: "RUS", flag: "🇷🇺" },
  { name: "Saudi Arabia", code: "SAU", flag: "🇸🇦" },
  { name: "Germany", code: "DEU", flag: "🇩🇪" },
  { name: "Japan", code: "JPN", flag: "🇯🇵" },
  { name: "Canada", code: "CAN", flag: "🇨🇦" },
  { name: "UAE", code: "ARE", flag: "🇦🇪" },
  { name: "Australia", code: "AUS", flag: "🇦🇺" },
];

const METHODOLOGY_STEPS = [
  {
    step: "1",
    title: "Raw Data Fetch",
    description:
      "EIA API v2 is queried for each country–energy-type–direction combination using facet filtering. Requests are rate-limited to 4/sec.",
  },
  {
    step: "2",
    title: "Normalization",
    description:
      "Raw EIA records are mapped to an internal schema. Suppressed values (\"w\"), withheld values (\"*\"), and nulls are replaced with null and flagged for downstream consumers.",
  },
  {
    step: "3",
    title: "Aggregation",
    description:
      "Multiple series per year are averaged. Values are stored in the EIA-reported unit for each energy type. No currency conversion is performed.",
  },
  {
    step: "4",
    title: "Persistence",
    description:
      "Normalized data is written to MongoDB Atlas time-series collections via upsert, keyed on (country, energyType, direction, period). Duplicate runs are idempotent.",
  },
  {
    step: "5",
    title: "Caching",
    description:
      "API responses are cached in Upstash Redis with TTLs of 1–24 hours depending on endpoint. Next.js ISR adds a second cache layer at the CDN level.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-200 py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-amber-500/5" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-200 bg-sky-50 text-sky-600 text-sm font-medium mb-6">
              <Database className="w-3.5 h-3.5" />
              Data Methodology & Sources
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About the{" "}
              <span className="bg-gradient-to-r from-sky-600 to-amber-600 bg-clip-text text-transparent">
                Data
              </span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Every number on this platform comes from the U.S. Energy
              Information Administration's Open Data API — the authoritative
              source for international energy statistics.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        {/* Primary Source */}
        <motion.div {...fadeUp} transition={{ delay: 0.05, duration: 0.5, ease: "easeOut" }}>
          <Card>
            <SectionHeader
              icon={Globe}
              title="Primary Data Source"
              subtitle="U.S. Energy Information Administration (EIA)"
            />
            <p className="text-slate-600 leading-relaxed mb-6">
              The EIA is an independent agency of the U.S. Department of Energy
              that collects, analyzes, and disseminates energy information. Its
              Open Data API (v2) provides programmatic access to comprehensive
              international energy trade statistics spanning decades.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.eia.gov/opendata/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 text-sm hover:bg-cyan-500/20 transition-colors"
              >
                EIA Open Data Portal
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.eia.gov/opendata/documentation.php"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-600 text-sm hover:bg-slate-200 transition-colors"
              >
                API Documentation
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </Card>
        </motion.div>

        {/* Coverage */}
        <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}>
          <Card>
            <SectionHeader
              icon={Calendar}
              title="Data Coverage"
              subtitle="Temporal and geographic scope"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Year Range", value: "2000 – 2023", sub: "Annual resolution" },
                { label: "Countries", value: "10", sub: "Major trading economies" },
                { label: "Energy Types", value: "5", sub: "Primary categories" },
              ].map(({ label, value, sub }) => (
                <div
                  key={label}
                  className="bg-white border border-slate-200 rounded-lg p-4 text-center"
                >
                  <div className="text-2xl font-bold text-sky-600">{value}</div>
                  <div className="text-sm font-medium text-slate-900 mt-1">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Covered Countries
              </p>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((c) => (
                  <span
                    key={c.code}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm"
                  >
                    <span>{c.flag}</span>
                    <span className="text-slate-600">{c.name}</span>
                    <span className="text-slate-500 text-xs">({c.code})</span>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Energy Types Table */}
        <motion.div {...fadeUp} transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}>
          <Card>
            <SectionHeader
              icon={Zap}
              title="Energy Type Mapping"
              subtitle="EIA activity codes used per energy category"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {["Energy Type", "Import Activity", "Export Activity", "Unit"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left text-slate-500 font-medium pb-3 pr-6 last:pr-0"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ENERGY_SOURCES.map((e, i) => (
                    <tr
                      key={e.type}
                      className={`border-b border-slate-200/50 ${
                        i % 2 === 0 ? "" : "bg-white/40"
                      }`}
                    >
                      <td className="py-3 pr-6 text-slate-900 font-medium">{e.type}</td>
                      <td className="py-3 pr-6 font-mono text-sky-600">{e.activityImport}</td>
                      <td className="py-3 pr-6 font-mono text-amber-400">{e.activityExport}</td>
                      <td className="py-3 text-slate-500">{e.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Methodology */}
        <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}>
          <Card>
            <SectionHeader
              icon={RefreshCw}
              title="Data Pipeline Methodology"
              subtitle="How raw EIA data becomes the charts you see"
            />
            <div className="space-y-4">
              {METHODOLOGY_STEPS.map((step) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-sm">
                    {step.step}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 mb-0.5">{step.title}</div>
                    <div className="text-sm text-slate-500 leading-relaxed">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Data Quality */}
        <motion.div {...fadeUp} transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}>
          <Card>
            <SectionHeader
              icon={Shield}
              title="Data Quality & Special Values"
              subtitle="How missing and suppressed data is handled"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                {
                  symbol: '"w"',
                  meaning: "Withheld",
                  treatment: "Stored as null",
                  color: "text-amber-400",
                },
                {
                  symbol: '"*"',
                  meaning: "Less than threshold",
                  treatment: "Stored as null",
                  color: "text-red-400",
                },
                {
                  symbol: "null",
                  meaning: "Not reported",
                  treatment: "Stored as null",
                  color: "text-slate-500",
                },
              ].map(({ symbol, meaning, treatment, color }) => (
                <div
                  key={symbol}
                  className="bg-white border border-slate-200 rounded-lg p-4"
                >
                  <div className={`font-mono text-lg font-bold ${color}`}>{symbol}</div>
                  <div className="text-sm font-medium text-slate-900 mt-1">{meaning}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{treatment}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Charts skip null data points and display gaps rather than
              interpolating or filling. This preserves data integrity and
              prevents misleading visualizations.
            </p>
          </Card>
        </motion.div>

        {/* Update Frequency */}
        <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}>
          <Card>
            <SectionHeader
              icon={BarChart2}
              title="Update Frequency"
            />
            <div className="space-y-3">
              {[
                {
                  layer: "EIA Source Data",
                  frequency: "Annual (historical), varies for current year",
                  note: "EIA publishes final annual figures ~12 months after year-end",
                },
                {
                  layer: "MongoDB (ETL Script)",
                  frequency: "Manual / scheduled run of fetchEIAData.py",
                  note: "Re-run the Python script to pull updated EIA figures into the database",
                },
                {
                  layer: "Redis Cache",
                  frequency: "1–24 hours TTL per endpoint",
                  note: "API responses are cached to avoid redundant DB queries",
                },
                {
                  layer: "Dashboard UI",
                  frequency: "On filter change",
                  note: "RTK Query revalidates when cache TTL expires",
                },
              ].map(({ layer, frequency, note }) => (
                <div
                  key={layer}
                  className="flex items-start gap-3 py-3 border-b border-slate-200/50 last:border-0"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">{layer}</div>
                    <div className="text-sm text-sky-600 mt-0.5">{frequency}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{note}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Disclaimers */}
        <motion.div {...fadeUp} transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-300 mb-2">Disclaimers</h3>
                <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
                  <li>
                    This platform is an independent analytics tool and is not
                    affiliated with or endorsed by the U.S. Energy Information
                    Administration.
                  </li>
                  <li>
                    Data accuracy depends on EIA source quality. Small
                    discrepancies from official EIA publications may exist due
                    to rounding or API versioning.
                  </li>
                  <li>
                    Forecasts shown on the Trends page are simple linear
                    regressions for illustrative purposes only — not investment
                    or policy guidance.
                  </li>
                  <li>
                    Trade balance figures are calculated as (exports − imports)
                    within each energy type and country. Cross-commodity
                    aggregation is intentionally not performed.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
