import { NextRequest, NextResponse } from "next/server";
import { CompareQuerySchema } from "@/lib/utils/validators";
import { COUNTRY_MAP, COUNTRY_BY_EIA } from "@/lib/utils/constants";
import { fetchMultiCountryTrade } from "@/services/eiaService";
import type { ApiResponse } from "@/types/api";
import type { TradeDataPoint } from "@/types/trade";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  // Support comma-separated countries param
  if (params.countries && !Array.isArray(params.countries)) {
    params.countries = params.countries;
  }

  const parsed = CompareQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { countries, energyType, startYear, endYear } = parsed.data;

  const eiaCodes = countries.map((c) => {
    const byId = COUNTRY_MAP[c.toLowerCase()];
    const byEia = COUNTRY_BY_EIA[c.toUpperCase()];
    return byId?.eiaCode ?? byEia?.eiaCode ?? c.toUpperCase();
  });

  const [importSeries, exportSeries] = await Promise.all([
    fetchMultiCountryTrade(eiaCodes, energyType!, "import", startYear, endYear),
    fetchMultiCountryTrade(eiaCodes, energyType!, "export", startYear, endYear),
  ]);

  const data: Record<string, { imports: TradeDataPoint[]; exports: TradeDataPoint[] }> =
    Object.fromEntries(
      eiaCodes.map((code) => [
        code,
        { imports: importSeries[code] ?? [], exports: exportSeries[code] ?? [] },
      ])
    );

  return NextResponse.json<ApiResponse<typeof data>>({ success: true, data });
}
