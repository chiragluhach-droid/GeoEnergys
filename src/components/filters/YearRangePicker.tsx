"use client";

import { useRef, useCallback, useEffect } from "react";
import { useDashboardFilters } from "@/store/dashboardFilters";
import { AVAILABLE_YEARS } from "@/lib/utils/constants";

const MIN  = AVAILABLE_YEARS[0];
const MAX  = AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];
const SPAN = MAX - MIN;

const PRESETS: { label: string; range: [number, number] }[] = [
  { label: "5Y",  range: [2019, 2023] },
  { label: "10Y", range: [2014, 2023] },
  { label: "15Y", range: [2009, 2023] },
  { label: "All", range: [MIN, MAX] },
];

const TICK_YEARS = [2000, 2005, 2010, 2015, 2020, 2023];

export function YearRangePicker() {
  const { yearRange, setYearRange } = useDashboardFilters();
  const [start, end] = yearRange;

  const trackRef  = useRef<HTMLDivElement>(null);
  const dragging  = useRef<"start" | "end" | null>(null);

  const toPct     = (v: number) => ((v - MIN) / SPAN) * 100;
  const fromPct   = (p: number) => Math.round(MIN + (Math.max(0, Math.min(100, p)) / 100) * SPAN);

  const clientPct = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return ((clientX - rect.left) / rect.width) * 100;
  };

  const applyDrag = useCallback((clientX: number) => {
    const v = fromPct(clientPct(clientX));
    if (dragging.current === "start" && v < end)   setYearRange([v, end]);
    if (dragging.current === "end"   && v > start) setYearRange([start, v]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, setYearRange]);

  const stopDrag = useCallback(() => { dragging.current = null; }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent)  => applyDrag(e.clientX);
    const onTouch = (e: TouchEvent) => applyDrag(e.touches[0].clientX);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   stopDrag);
    window.addEventListener("touchmove", onTouch, { passive: false });
    window.addEventListener("touchend",  stopDrag);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   stopDrag);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend",  stopDrag);
    };
  }, [applyDrag, stopDrag]);

  const handleTrackDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
    const p  = clientPct(cx);
    const dStart = Math.abs(p - toPct(start));
    const dEnd   = Math.abs(p - toPct(end));
    dragging.current = dStart <= dEnd ? "start" : "end";
    applyDrag(cx);
  };

  const leftPct  = toPct(start);
  const rightPct = toPct(end);

  return (
    <div className="flex flex-col gap-3">
      {/* Row: year badges + preset chips */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-md tabular-nums"
            style={{ background: "var(--color-cyan)1a", color: "var(--color-cyan)", border: "1px solid var(--color-cyan)44" }}
          >
            {start}
          </span>
          <span className="text-xs select-none" style={{ color: "var(--color-text-muted)" }}>–</span>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-md tabular-nums"
            style={{ background: "#f59e0b1a", color: "#f59e0b", border: "1px solid #f59e0b44" }}
          >
            {end}
          </span>
          <span className="text-xs select-none" style={{ color: "var(--color-text-muted)" }}>
            · {end - start}y span
          </span>
        </div>

        <div className="flex gap-1">
          {PRESETS.map(({ label, range }) => {
            const active = start === range[0] && end === range[1];
            return (
              <button
                key={label}
                onClick={() => setYearRange(range)}
                className="text-xs px-2.5 py-1 rounded-md border transition-all font-medium"
                style={{
                  borderColor: active ? "var(--color-cyan)"  : "var(--color-border)",
                  color:       active ? "var(--color-cyan)"  : "var(--color-text-muted)",
                  background:  active ? "var(--color-cyan)15" : "transparent",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider track */}
      <div
        ref={trackRef}
        className="relative h-8 flex items-center select-none cursor-pointer"
        onMouseDown={handleTrackDown}
        onTouchStart={handleTrackDown}
      >
        {/* Rail */}
        <div className="relative w-full h-1.5 rounded-full" style={{ background: "var(--color-surface-2)" }}>
          {/* Active gradient fill */}
          <div
            className="absolute h-full rounded-full transition-all duration-75"
            style={{
              left:       `${leftPct}%`,
              width:      `${rightPct - leftPct}%`,
              background: "linear-gradient(90deg, var(--color-cyan), #f59e0b)",
            }}
          />
        </div>

        {/* Start thumb */}
        <div
          className="absolute w-5 h-5 rounded-full -translate-x-1/2 cursor-grab transition-shadow duration-150"
          style={{
            left:        `${leftPct}%`,
            background:  "var(--color-bg, #0f172a)",
            border:      "2.5px solid var(--color-cyan)",
            boxShadow:   dragging.current === "start"
              ? "0 0 0 5px var(--color-cyan)30, 0 2px 8px rgba(0,0,0,0.5)"
              : "0 0 0 3px var(--color-cyan)18, 0 1px 4px rgba(0,0,0,0.4)",
          }}
        />

        {/* End thumb */}
        <div
          className="absolute w-5 h-5 rounded-full -translate-x-1/2 cursor-grab transition-shadow duration-150"
          style={{
            left:       `${rightPct}%`,
            background: "var(--color-bg, #0f172a)",
            border:     "2.5px solid #f59e0b",
            boxShadow:  dragging.current === "end"
              ? "0 0 0 5px #f59e0b30, 0 2px 8px rgba(0,0,0,0.5)"
              : "0 0 0 3px #f59e0b18, 0 1px 4px rgba(0,0,0,0.4)",
          }}
        />
      </div>

      {/* Tick labels */}
      <div className="relative h-3">
        {TICK_YEARS.map((y) => (
          <span
            key={y}
            className="absolute text-xs -translate-x-1/2 select-none"
            style={{
              left:  `${toPct(y)}%`,
              color: "var(--color-text-muted)",
            }}
          >
            {y}
          </span>
        ))}
      </div>
    </div>
  );
}
