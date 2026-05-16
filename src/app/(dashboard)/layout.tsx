"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useUIState } from "@/store/uiState";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe, Map, Zap, TrendingUp, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compare", label: "Compare", icon: Globe },
  { href: "/countries", label: "Countries", icon: Map },
  { href: "/energy", label: "Energy Types", icon: Zap },
  { href: "/trends", label: "Trends", icon: TrendingUp },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIState();
  const pathname = usePathname();

  return (
    <div className="flex" style={{ height: "calc(100vh - 48px)" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile top drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(15,23,42,0.35)", backdropFilter: "blur(2px)", top: 64 }}
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Top dropdown panel */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed left-0 right-0 z-50 md:hidden border-b"
              style={{
                top: 64,
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              }}
            >
              {/* Close button */}
              <div className="flex justify-end px-4 pt-3">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-md"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="px-4 pb-4 grid grid-cols-2 gap-2">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                      style={{
                        background: active ? "rgba(2,132,199,0.08)" : "var(--color-surface-2)",
                        color: active ? "var(--color-cyan)" : "var(--color-text-secondary)",
                        borderLeft: active ? "3px solid var(--color-cyan)" : "3px solid transparent",
                      }}
                    >
                      <Icon size={16} className="shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
