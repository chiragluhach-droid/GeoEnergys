"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { TrendingUp, TrendingDown, Globe, Zap } from "lucide-react";
import { useGetStatsQuery } from "@/store/tradeApi";
import { formatNumber } from "@/lib/utils/formatters";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const displayRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, motionVal, target]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      if (displayRef.current) displayRef.current.textContent = `${formatNumber(v)}${suffix}`;
    });
    return unsub;
  }, [spring, suffix]);

  return (
    <span ref={containerRef}>
      <span ref={displayRef}>0{suffix}</span>
    </span>
  );
}

const FALLBACK_STATS = [
  {
    label: "Countries Tracked",
    value: 10,
    suffix: "",
    icon: Globe,
    color: "var(--color-cyan)",
    bg: "rgba(6,182,212,0.08)",
    note: "Major economies",
  },
  {
    label: "Energy Types",
    value: 7,
    suffix: "",
    icon: Zap,
    color: "var(--color-gold)",
    bg: "rgba(245,158,11,0.08)",
    note: "Petroleum, Gas, Coal + more",
  },
  {
    label: "Years of Data",
    value: 24,
    suffix: "+",
    icon: TrendingUp,
    color: "var(--color-emerald)",
    bg: "rgba(16,185,129,0.08)",
    note: "2000 – 2023",
  },
  {
    label: "Trade Records",
    value: 50,
    suffix: "K+",
    icon: TrendingDown,
    color: "var(--color-violet)",
    bg: "rgba(139,92,246,0.08)",
    note: "Data points tracked",
  },
];

export function KeyStatsCards() {
  const { data: stats } = useGetStatsQuery({ energyType: "coal", year: 2023 });

  const cards = stats
    ? [
        ...FALLBACK_STATS.slice(0, 2),
        {
          label: "Top Importer Volume",
          value: Math.round((stats.topImporters[0]?.value ?? 0) / 1000),
          suffix: "K",
          icon: TrendingDown,
          color: "var(--color-rose)",
          bg: "rgba(244,63,94,0.08)",
          note: stats.topImporters[0]?.country.name ?? "N/A",
        },
        {
          label: "Top Exporter Volume",
          value: Math.round((stats.topExporters[0]?.value ?? 0) / 1000),
          suffix: "K",
          icon: TrendingUp,
          color: "var(--color-emerald)",
          bg: "rgba(16,185,129,0.08)",
          note: stats.topExporters[0]?.country.name ?? "N/A",
        },
      ]
    : FALLBACK_STATS;

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm" style={{ color: "var(--color-text-primary)" }}>
          Platform at a Glance
        </h2>
        <p className="mt-3 text-base font-medium max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
          Real-time energy trade intelligence across major global economies
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {cards.map(({ label, value, suffix, icon: Icon, color, bg, note }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
            className="rounded-3xl p-6 sm:p-8 border relative overflow-hidden backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_30px_rgb(0,0,0,0.1)] group"
            style={{ background: "linear-gradient(180deg, var(--color-surface), transparent)", borderColor: "var(--color-border)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div
              className="absolute top-5 right-5 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[8deg] shadow-sm"
              style={{ background: bg }}
            >
              <Icon size={22} style={{ color }} />
            </div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 pr-14" style={{ color: "var(--color-text-secondary)" }}>
              {label}
            </p>
            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 drop-shadow-sm" style={{ color }}>
              <AnimatedNumber target={value} suffix={suffix} />
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
              {note}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
