import { NextRequest, NextResponse } from "next/server";
import { TradeQuerySchema } from "@/lib/utils/validators";
import { COUNTRY_MAP, COUNTRY_BY_EIA } from "@/lib/utils/constants";
import { fetchTradeData } from "@/services/eiaService";
import type { ApiResponse, TradeQueryParams } from "@/types/api";
import type { TradeDataPoint } from "@/types/trade";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = TradeQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { country, energyType, direction, startYear, endYear } = parsed.data as TradeQueryParams & {
    startYear: number;
    endYear: number;
  };

  // Resolve country id → EIA code
  const rawCountries = Array.isArray(country) ? country : country ? [country] : [];
  const eiaCodes = rawCountries.map((c) => {
    const byId = COUNTRY_MAP[c.toLowerCase()];
    const byEia = COUNTRY_BY_EIA[c.toUpperCase()];
    return byId?.eiaCode ?? byEia?.eiaCode ?? c.toUpperCase();
  });

  if (eiaCodes.length === 0) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "At least one country is required" },
      { status: 400 }
    );
  }

  const directions: ("import" | "export")[] =
    direction === "both" ? ["import", "export"] : [direction ?? "import"];

  const results: Record<string, { imports: TradeDataPoint[]; exports: TradeDataPoint[] }> = {};

  await Promise.all(
    eiaCodes.map(async (code) => {
      const [imports, exports] = await Promise.all([
        directions.includes("import")
          ? fetchTradeData(code, energyType!, "import", startYear, endYear)
          : Promise.resolve([]),
        directions.includes("export")
          ? fetchTradeData(code, energyType!, "export", startYear, endYear)
          : Promise.resolve([]),
      ]);
      results[code] = { imports, exports };
    })
  );

  return NextResponse.json<ApiResponse<typeof results>>({ success: true, data: results });
}
