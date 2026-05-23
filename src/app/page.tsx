import { HeroSection } from "@/components/home/HeroSection";
import { KeyStatsCards } from "@/components/home/KeyStatsCards";
import { TopCountriesRanking } from "@/components/home/TopCountriesRanking";
import { QuickCompareWidget } from "@/components/home/QuickCompareWidget";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <KeyStatsCards />
      <TopCountriesRanking />
      <QuickCompareWidget />
      <Footer />
    </>
  );
}
