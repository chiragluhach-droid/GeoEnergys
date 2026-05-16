"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart2, Globe, TrendingUp, Zap, BookOpen, Menu } from "lucide-react";
import Image from "next/image";
import { useUIState } from "@/store/uiState";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
  { href: "/compare", label: "Compare", icon: Globe },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/energy", label: "Energy Types", icon: Zap },
  { href: "/about", label: "About Data", icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();
  const { toggleMobileSidebar } = useUIState();

  return (
    <header
      className="sticky top-0 z-50 border-b border-transparent md:border-[var(--color-border)] transition-all duration-300 shadow-none md:shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
      style={{
        background: "rgba(248, 250, 252, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-12 md:h-16 flex items-center justify-center md:justify-between relative">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 transition-all duration-300 hover:scale-110 relative z-20">
          <Image
            src="/image.png"
            alt="GeoEnergys"
            width={500}
            height={150}
            className="object-contain h-34 w-auto md:h-36 drop-shadow-2xl -my-12 md:-my-12 transition-transform"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden"
                style={{
                  color: active ? "var(--color-cyan)" : "var(--color-text-secondary)",
                }}
              >
                <Icon size={16} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="relative z-10">{label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "rgba(6,182,212,0.12)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {!active && (
                  <div className="absolute inset-0 rounded-xl bg-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side - Desktop Only */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/api-docs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 active:scale-95 shadow-sm hover:shadow"
            style={{
              borderColor: "var(--color-border-2)",
              color: "var(--color-text-primary)",
            }}
          >
            <BookOpen size={16} />
            API Docs
          </Link>
        </div>
      </div>

    </header>
  );
}
