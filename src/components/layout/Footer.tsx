import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer
      className="border-t mt-20"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="mb-3">
              <Image
                src="/image.png"
                alt="GeoEnergys"
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Real energy trade data powered by the U.S. Energy Information Administration (EIA).
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-secondary)" }}>
              Platform
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/compare", label: "Compare Countries" },
                { href: "/trends", label: "Trends & Forecasts" },
                { href: "/energy", label: "Energy Types" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-secondary)" }}>
              Data & API
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About the Data" },
                { href: "/api-docs", label: "API Documentation" },
                { href: "https://www.eia.gov/opendata/", label: "EIA Open Data ↗", external: true },
              ].map(({ href, label, external }) => (
                <li key={href}>
                  <Link
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="text-xs transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Data sourced from{" "}
            <a
              href="https://www.eia.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "var(--color-cyan)" }}
            >
              U.S. Energy Information Administration (EIA)
            </a>
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            For informational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
