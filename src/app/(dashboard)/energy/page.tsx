import type { Metadata } from "next";
import Link from "next/link";
import { ENERGY_TYPES } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Energy Types" };

const DESCRIPTIONS: Record<string, string> = {
  "crude-oil": "Unrefined crude oil traded internationally between producers and refiners.",
  "natural-gas": "Pipeline and compressed natural gas for power generation and heating.",
  "lng": "Liquefied Natural Gas shipped in tankers for intercontinental trade.",
  "coal": "Thermal and metallurgical coal for power plants and steel production.",
  "electricity": "Cross-border electricity flows via interconnected grid systems.",
};

const BG_GRADIENTS: Record<string, string> = {
  "crude-oil": "from-stone-500/10 to-transparent",
  "natural-gas": "from-blue-500/10 to-transparent",
  "lng": "from-cyan-500/10 to-transparent",
  "coal": "from-zinc-500/10 to-transparent",
  "electricity": "from-yellow-500/10 to-transparent",
};

export default function EnergyTypesPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Energy Types
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Explore trade data by energy commodity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ENERGY_TYPES.map((e) => (
          <Link
            key={e.id}
            href={`/energy/${e.id}`}
            className="rounded-xl border p-5 flex flex-col gap-3 transition-all hover:scale-[1.02]"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">{e.icon}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(6,182,212,0.1)", color: "var(--color-cyan)" }}
              >
                {e.unit}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
                {e.label}
              </h2>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {DESCRIPTIONS[e.id]}
              </p>
            </div>
            <p className="text-xs font-medium mt-auto" style={{ color: "var(--color-cyan)" }}>
              Explore data →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
