"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Globe, 
  TrendingUp, 
  Zap, 
  Home,
  BookOpen,
  Menu
} from "lucide-react";
import { useUIState } from "@/store/uiState";

const MOBILE_NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compare", label: "Compare", icon: Globe },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { id: "menu", label: "Menu", icon: Menu },
];

export function MobileNavbar() {
  const pathname = usePathname();
  const { toggleMobileSidebar } = useUIState();

  if (pathname === "/") return null;

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
      <div 
        className="flex items-center justify-around rounded-[2rem] border-t border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-2xl p-2"
        style={{ 
          background: "rgba(255, 255, 255, 0.85)", 
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)"
        }}
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          const isButton = "id" in item;
          const active = !isButton && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
          const Icon = item.icon;
          
          const content = (
            <div className="relative flex flex-col items-center gap-1 p-2 transition-all duration-300 cursor-pointer">
              <motion.div
                animate={{ 
                  y: active ? -2 : 0,
                  scale: active ? 1.15 : 1,
                  color: active ? "var(--color-cyan)" : "var(--color-text-secondary)" 
                }}
                className="z-10"
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </motion.div>
              
              <motion.span 
                initial={false}
                animate={{
                  opacity: active ? 1 : 0.7,
                  scale: active ? 1.05 : 0.95,
                  color: active ? "var(--color-cyan)" : "var(--color-text-secondary)"
                }}
                className="text-[10px] font-bold z-10 transition-colors"
              >
                {item.label}
              </motion.span>

              {active && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 rounded-2xl"
                  style={{ 
                    background: "rgba(6,182,212,0.1)",
                    border: "1px solid rgba(6,182,212,0.1)" 
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </div>
          );

          if (isButton) {
            return (
              <button key={item.id} onClick={toggleMobileSidebar} className="outline-none">
                {content}
              </button>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
