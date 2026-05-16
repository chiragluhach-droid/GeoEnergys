"use client";

import dynamic from "next/dynamic";
import { useRef, useCallback } from "react";
import { useMapInteractions } from "@/hooks/useMapInteractions";
import { useTradeData } from "@/hooks/useTradeData";
import { COUNTRIES } from "@/lib/utils/constants";
import { formatNumber } from "@/lib/utils/formatters";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { RotateCcw } from "lucide-react";

import "mapbox-gl/dist/mapbox-gl.css";

const Map    = dynamic(() => import("react-map-gl/mapbox").then((m) => m.Map),    { ssr: false, loading: () => <MapSkeleton /> });
const Marker = dynamic(() => import("react-map-gl/mapbox").then((m) => m.Marker), { ssr: false });

function MapSkeleton() {
  return (
    <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: "#060816" }}>
      <p className="text-sm" style={{ color: "#334155" }}>Loading globe…</p>
    </div>
  );
}

export function EnergyTradeMap() {
  const { viewport, setViewport, hoveredCountry, setHoveredCountry, selectedCountries, handleCountryClick, resetView } =
    useMapInteractions();
  const { compareData } = useTradeData();
  const { yearRange, direction } = useDashboardFilters();

  const getTradeValue = useCallback(
    (eiaCode: string) => {
      if (!compareData) return 0;
      const series = direction === "export" ? compareData[eiaCode]?.exports : compareData[eiaCode]?.imports;
      const point  = series?.find((d) => d.year === yearRange[1]) ?? series?.[series.length - 1];
      return (point?.value ?? 0) as number;
    },
    [compareData, direction, yearRange]
  );

  const maxValue = Math.max(...COUNTRIES.map((c) => getTradeValue(c.eiaCode)), 1);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!mapboxToken) {
    return (
      <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: "#060816" }}>
        <p className="text-sm text-center px-4" style={{ color: "#475569" }}>
          Set <code className="text-cyan-400">NEXT_PUBLIC_MAPBOX_TOKEN</code> in .env.local to enable the globe.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ background: "#060816" }}>
      <Map
        longitude={viewport.longitude}
        latitude={viewport.latitude}
        zoom={viewport.zoom}
        onMove={(evt: { viewState: typeof viewport }) => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        projection="globe"
        onLoad={(evt) => {
          evt.target.setFog({
            color:            "rgb(10, 15, 35)",
            "high-color":     "rgb(4, 6, 18)",
            "horizon-blend":  0.03,
            "space-color":    "rgb(4, 6, 18)",
            "star-intensity": 0.6,
          });
        }}
      >
        {COUNTRIES.map((country) => {
          const value      = getTradeValue(country.eiaCode);
          const isSelected = selectedCountries.includes(country.id);
          const isHovered  = hoveredCountry === country.id;
          const radius     = 10 + (value / maxValue) * 22;

          return (
            <Marker key={country.id} longitude={country.coordinates[0]} latitude={country.coordinates[1]} anchor="center">
              <div
                className="relative cursor-pointer"
                style={{ transform: isHovered ? "scale(1.35)" : "scale(1)", transition: "transform 0.15s ease" }}
                onMouseEnter={() => setHoveredCountry(country.id)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick(country.id)}
              >
                {/* Outer glow ring */}
                {isSelected && (
                  <div
                    className="absolute rounded-full animate-ping"
                    style={{
                      width:      radius + 10,
                      height:     radius + 10,
                      top:        -(5),
                      left:       -(5),
                      background: country.color + "30",
                    }}
                  />
                )}

                {/* Bubble */}
                <div
                  className="rounded-full"
                  style={{
                    width:     radius,
                    height:    radius,
                    background: `radial-gradient(circle at 35% 35%, ${country.color}ff, ${country.color}88)`,
                    border:    `1.5px solid ${country.color}cc`,
                    boxShadow: `0 0 ${isSelected ? 14 : 6}px ${country.color}${isSelected ? "cc" : "66"}, inset 0 1px 2px rgba(255,255,255,0.25)`,
                  }}
                />

                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-lg px-3 py-2 text-xs whitespace-nowrap z-10 pointer-events-none"
                    style={{
                      background: "rgba(10,15,35,0.92)",
                      border:     `1px solid ${country.color}55`,
                      color:      "#f1f5f9",
                      backdropFilter: "blur(8px)",
                      boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px ${country.color}22`,
                    }}
                  >
                    <div className="font-semibold mb-0.5">{country.flag} {country.name}</div>
                    <div style={{ color: country.color }}>
                      {direction === "export" ? "Export" : "Import"}: {formatNumber(value)}
                    </div>
                    <div className="mt-0.5" style={{ color: "#475569", fontSize: "10px" }}>
                      Click to {selectedCountries.includes(country.id) ? "deselect" : "select"}
                    </div>
                  </div>
                )}
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* Reset button */}
      <button
        onClick={resetView}
        className="absolute top-3 right-3 p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
        style={{ background: "rgba(10,15,35,0.75)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", backdropFilter: "blur(8px)" }}
      >
        <RotateCcw size={11} />
        Reset
      </button>

      {/* Legend */}
      <div
        className="absolute bottom-3 left-3 rounded-lg px-3 py-1.5 text-xs"
        style={{ background: "rgba(10,15,35,0.75)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", backdropFilter: "blur(8px)" }}
      >
        Bubble size = {direction === "export" ? "export" : "import"} volume · Click to select
      </div>
    </div>
  );
}
