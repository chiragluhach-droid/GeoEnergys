"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Globe,
  TrendingUp,
  Zap,
  Map,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIState } from "@/store/uiState";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compare", label: "Compare", icon: Globe },
  { href: "/countries", label: "Countries", icon: Map },
  { href: "/energy", label: "Energy Types", icon: Zap },
  { href: "/trends", label: "Trends", icon: TrendingUp },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, setMobileSidebarOpen } = useUIState();
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 220 : 56 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex-shrink-0 flex flex-col border-r overflow-hidden"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
        minHeight: "100%",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-5 z-10 w-6 h-6 rounded-full border flex items-center justify-center"
        style={{
          background: "var(--color-surface-2)",
          borderColor: "var(--color-border-2)",
          color: "var(--color-text-secondary)",
        }}
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      <nav className="flex flex-col gap-1 p-2 pt-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={!sidebarOpen ? label : undefined}
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              style={{
                background: active ? "rgba(6,182,212,0.1)" : "transparent",
                color: active ? "var(--color-cyan)" : "var(--color-text-secondary)",
              }}
            >
              <Icon size={16} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div
        className="mt-auto p-3 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg p-3"
              style={{ background: "rgba(6,182,212,0.05)", border: "1px solid var(--color-border)" }}
            >
              <p className="text-xs font-semibold" style={{ color: "var(--color-cyan)" }}>
                Data Source
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                U.S. EIA — updated annually
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
