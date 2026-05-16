import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNavbar } from "@/components/layout/MobileNavbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "GeoEnergys — Global Energy Trade Analytics",
    template: "%s | GeoEnergys",
  },
  description:
    "GeoEnergys: Professional analytics platform for global energy import/export trade data. Compare countries, track trends, and visualize crude oil, natural gas, coal, and electricity flows.",
  keywords: ["GeoEnergys", "energy trade", "EIA data", "import export", "crude oil", "natural gas", "coal", "analytics"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <Providers>
          <Navbar />
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <MobileNavbar />
        </Providers>
      </body>
    </html>
  );
}
