"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Globe, TrendingUp, Zap } from "lucide-react";

const TICKER_ITEMS = [
  { label: "US Petroleum Imports", value: "8.5M bbl/day", change: "+2.1%" },
  { label: "China LNG Imports", value: "109 bcf", change: "+12.4%" },
  { label: "Russia Gas Exports", value: "142 bcf", change: "-18.2%" },
  { label: "Saudi Arabia Oil Exports", value: "7.3M bbl/day", change: "+0.8%" },
  { label: "Germany Coal Imports", value: "45 MMst", change: "+5.3%" },
  { label: "India Crude Imports", value: "4.9M bbl/day", change: "+9.7%" },
];

const FEATURE_PILLS = [
  { icon: Globe, label: "10 Countries" },
  { icon: TrendingUp, label: "5 Energy Types" },
  { icon: Zap, label: "Live EIA Data" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" as const },
  }),
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex flex-col items-center justify-center px-4 pt-4 md:pt-10 pb-20">
      {/* Animated grid background */}
      <div className="absolute inset-0 energy-grid opacity-40 pointer-events-none" />

      {/* Radial glow blobs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(2,132,199,0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(5,150,105,0.15) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Feature pills */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex flex-wrap justify-center gap-3 mb-8"
      >
        {FEATURE_PILLS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(2,132,199,0.3)] cursor-default"
            style={{
              borderColor: "var(--color-border-2)",
              color: "var(--color-cyan)",
              background: "rgba(2,132,199,0.08)",
            }}
          >
            <Icon size={14} />
            {label}
          </span>
        ))}
      </motion.div>

      {/* Headline */}
      <motion.h1
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="text-center font-extrabold tracking-tight leading-tight max-w-5xl drop-shadow-sm"
        style={{ fontSize: "clamp(2.5rem, 6.5vw, 5rem)", color: "var(--color-text-primary)" }}
      >
        Global Energy{" "}
        <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
          Trade Intelligence
        </span>
        <br />
        at Your Fingertips
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-6 text-center max-w-2xl leading-relaxed font-medium"
        style={{ color: "var(--color-text-secondary)", fontSize: "1.15rem" }}
      >
        GeoEnergys tracks crude oil, natural gas, coal, and electricity import/export flows
        for 10 major economies — powered by real EIA.gov data.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-10 flex flex-wrap gap-4 justify-center"
      >
        <Link
          href="/dashboard"
          className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] overflow-hidden group"
          style={{ background: "linear-gradient(135deg, var(--color-cyan) 0%, #3b82f6 100%)", color: "#ffffff" }}
        >
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 flex items-center gap-2">
            Open Dashboard
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm border-2 backdrop-blur-sm transition-all hover:bg-black/5 dark:hover:bg-white/5 hover:border-cyan-500/50 hover:shadow-lg"
          style={{
            borderColor: "var(--color-border-2)",
            color: "var(--color-text-primary)",
          }}
        >
          Compare Countries
        </Link>
      </motion.div>

      {/* Floating data cards */}
      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-16 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            title: "Top Importer 2023",
            country: "🇨🇳 China",
            value: "11.2M bbl/day",
            label: "Petroleum Imports",
            color: "var(--color-gold)",
          },
          {
            title: "Top Exporter 2023",
            country: "🇸🇦 Saudi Arabia",
            value: "7.3M bbl/day",
            label: "Crude Oil Exports",
            color: "var(--color-cyan)",
          },
          {
            title: "Fastest Growth",
            country: "🇮🇳 India",
            value: "+9.7% YoY",
            label: "Energy Import Growth",
            color: "var(--color-emerald)",
          },
        ].map(({ title, country, value, label, color }) => (
          <div
            key={title}
            className="glass rounded-2xl p-6 border backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_30px_rgb(0,0,0,0.12)] hover:border-opacity-50 group relative overflow-hidden"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-muted)" }}>
              {title}
            </p>
            <p className="text-lg font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
              {country}
            </p>
            <p className="text-3xl font-extrabold tracking-tight drop-shadow-sm" style={{ color }}>
              {value}
            </p>
            <p className="text-sm mt-2 font-medium" style={{ color: "var(--color-text-muted)" }}>
              {label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Live ticker */}
      <motion.div
        custom={5}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="absolute bottom-0 left-0 right-0 border-t overflow-hidden"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="flex items-center py-2">
          <span
            className="flex-shrink-0 px-4 text-xs font-bold uppercase tracking-widest border-r"
            style={{ color: "var(--color-gold)", borderColor: "var(--color-border)" }}
          >
            LIVE
          </span>
          <motion.div
            className="flex gap-8 px-4 whitespace-nowrap"
            animate={{ x: [0, -1200] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-xs">
                <span style={{ color: "var(--color-text-secondary)" }}>{item.label}</span>
                <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{item.value}</span>
                <span style={{ color: item.change.startsWith("+") ? "var(--color-emerald)" : "var(--color-rose)" }}>
                  {item.change}
                </span>
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
