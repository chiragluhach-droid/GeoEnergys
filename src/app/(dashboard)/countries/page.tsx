import type { Metadata } from "next";
import Link from "next/link";
import { COUNTRIES, ENERGY_TYPES } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Countries" };

export default function CountriesPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Countries
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Select a country to view its detailed energy trade profile
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {COUNTRIES.map((country) => (
          <Link
            key={country.id}
            href={`/countries/${country.id}`}
            className="rounded-xl border p-5 flex flex-col gap-3 transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Flag + name */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">{country.flag}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: "var(--color-text-primary)" }}>
                  {country.name}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {country.region}
                </p>
              </div>
            </div>

            {/* Color accent bar */}
            <div
              className="h-0.5 w-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${country.color}, transparent)` }}
            />

            {/* Energy types chip row */}
            <div className="flex flex-wrap gap-1">
              {ENERGY_TYPES.slice(0, 4).map((e) => (
                <span
                  key={e.id}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: country.color + "18",
                    color: country.color,
                  }}
                >
                  {e.icon}
                </span>
              ))}
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: "var(--color-text-muted)" }}>
                +{ENERGY_TYPES.length - 4} more
              </span>
            </div>

            <p
              className="text-xs font-medium mt-auto"
              style={{ color: "var(--color-cyan)" }}
            >
              View profile →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
