"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  ChevronDown,
  ChevronRight,
  Copy,
  CheckCheck,
  Globe,
  BarChart2,
  TrendingUp,
  Users,
  Zap,
  Activity,
  Lock,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-900"
    >
      {copied ? (
        <CheckCheck className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function CodeBlock({
  code,
  language = "json",
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute top-3 left-3 text-xs text-slate-500 font-mono uppercase tracking-wider">
        {language}
      </div>
      <CopyButton text={code} />
      <pre className="bg-[#070c1a] border border-slate-200 rounded-lg px-4 pt-8 pb-4 overflow-x-auto text-sm font-mono text-slate-600 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface Param {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  example?: string;
}

interface Endpoint {
  method: string;
  path: string;
  icon: React.ElementType;
  summary: string;
  description: string;
  params: Param[];
  exampleRequest: string;
  exampleResponse: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/v1/health",
    icon: Activity,
    summary: "Health Check",
    description:
      "Returns the operational status of the API, database connectivity, and cache availability. Use this to verify the service is running before making data requests.",
    params: [],
    exampleRequest: `GET /api/v1/health`,
    exampleResponse: `{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "cache": "connected"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/countries",
    icon: Globe,
    summary: "Countries List",
    description:
      "Returns metadata for all 10 supported countries, including their EIA country codes, ISO codes, geographic coordinates, and available data years.",
    params: [],
    exampleRequest: `GET /api/v1/countries`,
    exampleResponse: `[
  {
    "id": "usa",
    "name": "United States",
    "eiaCode": "USA",
    "region": "North America",
    "coordinates": [-95.7129, 37.0902],
    "flag": "🇺🇸",
    "availableYears": [2000, 2001, ..., 2023]
  },
  ...
]`,
  },
  {
    method: "GET",
    path: "/api/v1/trade",
    icon: BarChart2,
    summary: "Trade Data",
    description:
      "Fetch annual import or export data for one or more countries and energy types. Returns a normalized time-series array suitable for charting. Results are cached in Redis for up to 1 hour.",
    params: [
      {
        name: "country",
        type: "string[]",
        required: true,
        description: "One or more EIA country codes (e.g. USA, CHN). Repeat the param for multiple.",
        example: "country=USA&country=CHN",
      },
      {
        name: "energyType",
        type: "string",
        required: true,
        description: "Energy category. One of: petroleum, crude-oil, natural-gas, coal, electricity.",
        example: "energyType=petroleum",
      },
      {
        name: "direction",
        type: "string",
        description: "Trade direction. One of: import, export, both. Defaults to both.",
        example: "direction=import",
      },
      {
        name: "startYear",
        type: "number",
        description: "Start of year range (inclusive). Min 2000. Defaults to 2000.",
        example: "startYear=2010",
      },
      {
        name: "endYear",
        type: "number",
        description: "End of year range (inclusive). Max 2023. Defaults to 2023.",
        example: "endYear=2023",
      },
    ],
    exampleRequest: `GET /api/v1/trade?country=USA&country=CHN&energyType=coal&direction=import&startYear=2015&endYear=2023`,
    exampleResponse: `[
  {
    "country": "USA",
    "energyType": "coal",
    "direction": "import",
    "unit": "thousand short tons",
    "data": [
      { "year": 2015, "value": 11204.5 },
      { "year": 2016, "value": 9812.3 },
      ...
      { "year": 2023, "value": 8900.1 }
    ]
  },
  {
    "country": "CHN",
    "energyType": "coal",
    "direction": "import",
    "unit": "thousand short tons",
    "data": [
      { "year": 2015, "value": 204820.0 },
      ...
    ]
  }
]`,
  },
  {
    method: "GET",
    path: "/api/v1/compare",
    icon: Users,
    summary: "Multi-Country Comparison",
    description:
      "Returns a side-by-side comparison dataset for up to 5 countries. Includes both import and export series for each country, pre-shaped for multi-line ECharts rendering.",
    params: [
      {
        name: "countries",
        type: "string",
        required: true,
        description: "Comma-separated list of EIA country codes.",
        example: "countries=USA,CHN,IND",
      },
      {
        name: "energyType",
        type: "string",
        required: true,
        description: "Energy category to compare across countries.",
        example: "energyType=natural-gas",
      },
      {
        name: "startYear",
        type: "number",
        description: "Start year. Defaults to 2000.",
        example: "startYear=2005",
      },
      {
        name: "endYear",
        type: "number",
        description: "End year. Defaults to 2023.",
        example: "endYear=2023",
      },
    ],
    exampleRequest: `GET /api/v1/compare?countries=USA,CHN,IND&energyType=natural-gas&startYear=2010&endYear=2023`,
    exampleResponse: `{
  "energyType": "natural-gas",
  "unit": "billion cubic feet",
  "yearRange": [2010, 2023],
  "series": [
    {
      "country": "USA",
      "imports": [{ "year": 2010, "value": 3738.4 }, ...],
      "exports": [{ "year": 2010, "value": 1831.2 }, ...]
    },
    ...
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/stats",
    icon: Zap,
    summary: "Global Stats",
    description:
      "Returns aggregated KPIs: top importers and exporters per energy type, total trade volumes for the latest available year, and year-over-year change percentages. Cached for 24 hours.",
    params: [
      {
        name: "year",
        type: "number",
        description: "Reference year for rankings. Defaults to the latest year with data (2023).",
        example: "year=2022",
      },
      {
        name: "energyType",
        type: "string",
        description: "Filter stats to a specific energy type. Omit for aggregate across all types.",
        example: "energyType=coal",
      },
    ],
    exampleRequest: `GET /api/v1/stats?year=2023`,
    exampleResponse: `{
  "year": 2023,
  "topImporters": [
    { "country": "CHN", "value": 442335.1, "unit": "thousand short tons", "yoyChange": 3.2 },
    { "country": "IND", "value": 264408.9, "unit": "thousand short tons", "yoyChange": 14.2 },
    ...
  ],
  "topExporters": [
    { "country": "AUS", "value": 383726.7, "unit": "thousand short tons", "yoyChange": 2.1 },
    ...
  ],
  "totalVolume": {
    "coal": { "imports": 950385.8, "exports": 760052.3, "unit": "thousand short tons" }
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/trends",
    icon: TrendingUp,
    summary: "Trends & Forecasts",
    description:
      "Returns historical data plus a 5-year linear regression forecast, compound annual growth rate (CAGR), and year-over-year delta for each requested country–energy-type combination.",
    params: [
      {
        name: "country",
        type: "string",
        required: true,
        description: "EIA country code.",
        example: "country=IND",
      },
      {
        name: "energyType",
        type: "string",
        required: true,
        description: "Energy type to trend.",
        example: "energyType=coal",
      },
      {
        name: "direction",
        type: "string",
        description: "import or export. Defaults to import.",
        example: "direction=import",
      },
    ],
    exampleRequest: `GET /api/v1/trends?country=IND&energyType=coal&direction=import`,
    exampleResponse: `{
  "country": "IND",
  "energyType": "coal",
  "direction": "import",
  "unit": "million short tons",
  "cagr": 8.4,
  "latestYoY": 12.1,
  "historical": [
    { "year": 2000, "value": 23.4 },
    ...
    { "year": 2023, "value": 248.7 }
  ],
  "forecast": [
    { "year": 2024, "value": 267.2, "isForecast": true },
    { "year": 2025, "value": 285.6, "isForecast": true },
    { "year": 2026, "value": 304.1, "isForecast": true },
    { "year": 2027, "value": 322.5, "isForecast": true },
    { "year": 2028, "value": 340.9, "isForecast": true }
  ]
}`,
  },
];

function MethodBadge({ method }: { method: string }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-green-500/15 text-green-400 border border-green-500/30">
      {method}
    </span>
  );
}

function EndpointBlock({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false);
  const Icon = endpoint.icon;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 p-5 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className="p-2 rounded-lg bg-sky-50 border border-cyan-500/20">
          <Icon className="w-4 h-4 text-sky-600" />
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <MethodBadge method={endpoint.method} />
          <code className="text-sm font-mono text-slate-900 truncate">{endpoint.path}</code>
          <span className="text-sm text-slate-500 hidden sm:block">—</span>
          <span className="text-sm text-slate-500 hidden sm:block">{endpoint.summary}</span>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-white border-t border-slate-200 space-y-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                {endpoint.description}
              </p>

              {endpoint.params.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Query Parameters
                  </h4>
                  <div className="space-y-2">
                    {endpoint.params.map((param) => (
                      <div
                        key={param.name}
                        className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2.5 border-b border-slate-200/60 last:border-0"
                      >
                        <code className="text-sm font-mono font-mono text-sky-700 bg-sky-50 font-medium w-36 flex-shrink-0">
                          {param.name}
                        </code>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-500 font-mono">
                            {param.type}
                          </span>
                          {param.required && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                              required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 flex-1 min-w-[200px]">
                          {param.description}
                          {param.example && (
                            <span className="ml-2 text-xs text-slate-500">
                              e.g.{" "}
                              <code className="font-mono text-slate-500">
                                {param.example}
                              </code>
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Example Request
                  </h4>
                  <CodeBlock code={endpoint.exampleRequest} language="http" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Example Response
                  </h4>
                  <CodeBlock code={endpoint.exampleResponse} language="json" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-200 py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-amber-500/5" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-200 bg-sky-50 text-sky-600 text-sm font-medium mb-6">
              <Code2 className="w-3.5 h-3.5" />
              REST API Reference
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              API{" "}
              <span className="bg-gradient-to-r from-sky-600 to-amber-600 bg-clip-text text-transparent">
                Documentation
              </span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              All dashboard data is available via a versioned REST API at{" "}
              <code className="font-mono font-mono text-sky-700 bg-sky-50 text-base bg-sky-50 px-2 py-0.5 rounded">
                /api/v1
              </code>
              . All endpoints return JSON.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        {/* Base URL + Auth */}
        <motion.div {...fadeUp} transition={{ delay: 0.05, duration: 0.4, ease: "easeOut" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Base URL
              </h3>
              <CodeBlock
                code="https://your-domain.com/api/v1"
                language="url"
              />
              <p className="text-xs text-slate-500 mt-3">
                For local development, replace with{" "}
                <code className="font-mono">http://localhost:3000/api/v1</code>
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Authentication
                </h3>
              </div>
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 text-sm text-green-300">
                No authentication required. All endpoints are public read-only.
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Rate limiting may apply to prevent abuse. Responses include
                cache headers for client-side optimization.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Response format */}
        <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Response Format
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {[
                {
                  label: "Success (2xx)",
                  description: "Returns JSON array or object with data",
                  color: "border-green-500/20 bg-green-500/5 text-green-300",
                },
                {
                  label: "Bad Request (400)",
                  description: "Missing or invalid query parameters",
                  color: "border-amber-500/20 bg-amber-500/5 text-amber-300",
                },
                {
                  label: "Server Error (500)",
                  description: "Database or upstream API failure",
                  color: "border-red-500/20 bg-red-500/5 text-red-300",
                },
              ].map(({ label, description, color }) => (
                <div
                  key={label}
                  className={`border rounded-lg p-3 ${color}`}
                >
                  <div className="font-medium">{label}</div>
                  <div className="text-xs mt-1 opacity-80">{description}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Endpoints */}
        <motion.div {...fadeUp} transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Endpoints</h2>
          <div className="space-y-3">
            {ENDPOINTS.map((endpoint) => (
              <EndpointBlock key={endpoint.path} endpoint={endpoint} />
            ))}
          </div>
        </motion.div>

        {/* Supported Values */}
        <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Supported Parameter Values
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  country / EIA Code
                </div>
                <div className="space-y-1 font-mono">
                  {[
                    ["USA", "United States"],
                    ["CHN", "China"],
                    ["IND", "India"],
                    ["RUS", "Russia"],
                    ["SAU", "Saudi Arabia"],
                    ["DEU", "Germany"],
                    ["JPN", "Japan"],
                    ["CAN", "Canada"],
                    ["ARE", "UAE"],
                    ["AUS", "Australia"],
                  ].map(([code, name]) => (
                    <div key={code} className="flex items-center gap-2">
                      <span className="text-sky-600 w-10">{code}</span>
                      <span className="text-slate-500 font-sans">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  energyType
                </div>
                <div className="space-y-1">
                  {[
                    "crude-oil",
                    "natural-gas",
                    "lng",
                    "coal",
                    "electricity",
                  ].map((t) => (
                    <div key={t} className="font-mono text-sky-600">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  direction
                </div>
                <div className="space-y-1">
                  {["import", "export", "both"].map((d) => (
                    <div key={d} className="font-mono text-sky-600">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-slate-500 uppercase tracking-wider mb-2">
                  year range
                </div>
                <div className="font-mono text-slate-600 text-sm">
                  2000 – 2023
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
