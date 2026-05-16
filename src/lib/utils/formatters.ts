import { format } from "date-fns";

export function formatNumber(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(decimals)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(decimals)}K`;
  return value.toFixed(decimals);
}

export function formatEnergy(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return `${formatNumber(value)} ${unit}`;
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatYear(year: number | string): string {
  return String(year);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function parseEIAValue(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === "null" || raw === "w" || raw === "*") {
    return null;
  }
  const parsed = typeof raw === "number" ? raw : parseFloat(String(raw));
  return isNaN(parsed) ? null : parsed;
}

export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0;
  return ((endValue / startValue) ** (1 / years) - 1) * 100;
}

export function calculateYoY(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
