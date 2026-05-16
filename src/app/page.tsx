export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold">
          GeoEnergys
        </h1>

        <p className="mt-4 text-slate-600">
          Platform currently under development. Stay tuned for updates!
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-slate-200 bg-slate-50 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default select-none">
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">Maintained by</span>
          <span className="text-sm font-black tracking-wider uppercase bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            CHUGGI (SANCHIT)
          </span>
        </div>
      </div>
    </main>
  );
}

// import { HeroSection } from "@/components/home/HeroSection";
// import { KeyStatsCards } from "@/components/home/KeyStatsCards";
// import { TopCountriesRanking } from "@/components/home/TopCountriesRanking";
// import { QuickCompareWidget } from "@/components/home/QuickCompareWidget";
// import { Footer } from "@/components/layout/Footer";

// export default function HomePage() {
//   return (
//     <>
//       <HeroSection />
//       <KeyStatsCards />
//       <TopCountriesRanking />
//       <QuickCompareWidget />
//       <Footer />
//     </>
//   );
// }
