"use client";

import dynamic from "next/dynamic";
import { useRef, useCallback } from "react";
import { useMapInteractions } from "@/hooks/useMapInteractions";
import { useTradeData } from "@/hooks/useTradeData";
import { COUNTRIES, COUNTRY_MAP } from "@/lib/utils/constants";
import { formatNumber } from "@/lib/utils/formatters";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { RotateCcw } from "lucide-react";

import "mapbox-gl/dist/mapbox-gl.css";

// SSR-disabled Mapbox imports (react-map-gl v8 uses subpath exports)
const Map = dynamic(
  () => import("react-map-gl/mapbox").then((m) => m.Map),
  { ssr: false, loading: () => <MapSkeleton /> }
);
const Marker = dynamic(() => import("react-map-gl/mapbox").then((m) => m.Marker), { ssr: false });

function MapSkeleton() {
  return (
    <div
      className="w-full h-full rounded-xl flex items-center justify-center"
      style={{ background: "var(--color-surface-2)" }}
    >
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading map…</p>
    </div>
  );
}

export function EnergyTradeMap() {
  const { viewport, setViewport, hoveredCountry, setHoveredCountry, selectedCountries, handleCountryClick, resetView } =
    useMapInteractions();
  const { compareData } = useTradeData();
  const { yearRange, direction, energyType } = useDashboardFilters();

  const getTradeValue = useCallback(
    (eiaCode: string) => {
      if (!compareData) return 0;
      const series =
        direction === "export"
          ? compareData[eiaCode]?.exports
          : compareData[eiaCode]?.imports;
      const point = series?.find((d) => d.year === yearRange[1]) ?? series?.[series.length - 1];
      return point?.value ?? 0;
    },
    [compareData, direction, yearRange]
  );

  const maxValue = Math.max(...COUNTRIES.map((c) => getTradeValue(c.eiaCode) as number), 1);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: "var(--color-surface-2)" }}>
        <p className="text-sm text-center px-4" style={{ color: "var(--color-text-muted)" }}>
          Set <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> in .env.local to enable the map.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <Map
        longitude={viewport.longitude}
        latitude={viewport.latitude}
        zoom={viewport.zoom}
        onMove={(evt: { viewState: typeof viewport }) => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {COUNTRIES.map((country) => {
          const value = getTradeValue(country.eiaCode) as number;
          const isSelected = selectedCountries.includes(country.id);
          const isHovered = hoveredCountry === country.id;
          const radius = 8 + (value / maxValue) * 24;

          return (
            <Marker
              key={country.id}
              longitude={country.coordinates[0]}
              latitude={country.coordinates[1]}
              anchor="center"
            >
              <div
                className="relative cursor-pointer transition-transform"
                style={{ transform: isHovered ? "scale(1.3)" : "scale(1)" }}
                onMouseEnter={() => setHoveredCountry(country.id)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick(country.id)}
              >
                {/* Pulse ring for selected */}
                {isSelected && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      background: country.color + "40",
                      width: radius + 8,
                      height: radius + 8,
                      top: -(radius + 8) / 2 + radius / 2,
                      left: -(radius + 8) / 2 + radius / 2,
                    }}
                  />
                )}

                {/* Bubble */}
                <div
                  className="rounded-full flex items-center justify-center text-xs"
                  style={{
                    width: radius,
                    height: radius,
                    background: country.color + (isSelected ? "dd" : "88"),
                    border: `2px solid ${country.color}`,
                    boxShadow: `0 2px 8px ${country.color}44`,
                  }}
                />

                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap z-10 pointer-events-none"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    <div className="font-semibold">{country.flag} {country.name}</div>
                    <div style={{ color: country.color }}>
                      {direction === "export" ? "Export" : "Import"}: {formatNumber(value)}
                    </div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "10px" }}>
                      Click to {isSelected ? "deselect" : "select"}
                    </div>
                  </div>
                )}
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* Reset view button */}
      <button
        onClick={resetView}
        className="absolute top-3 right-3 p-1.5 rounded-lg border flex items-center gap-1.5 text-xs"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          color: "var(--color-text-secondary)",
        }}
      >
        <RotateCcw size={11} />
        Reset
      </button>

      {/* Legend */}
      <div
        className="absolute bottom-3 left-3 rounded-lg px-3 py-2 text-xs"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid var(--color-border)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
      >
        <p style={{ color: "var(--color-text-secondary)" }}>
          Circle size = {direction === "export" ? "export" : "import"} volume · Click to select
        </p>
      </div>
    </div>
  );
}
