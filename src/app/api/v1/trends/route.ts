import { NextRequest, NextResponse } from "next/server";
import { TrendQuerySchema } from "@/lib/utils/validators";
import { COUNTRY_MAP, COUNTRY_BY_EIA } from "@/lib/utils/constants";
import { getTrendData } from "@/services/tradeService";
import type { ApiResponse } from "@/types/api";
import type { TrendData } from "@/types/trade";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = TrendQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { country, energyType, direction, forecastYears } = parsed.data;

  const byId = COUNTRY_MAP[country.toLowerCase()];
  const byEia = COUNTRY_BY_EIA[country.toUpperCase()];
  const eiaCode = byId?.eiaCode ?? byEia?.eiaCode ?? country.toUpperCase();

  const data = await getTrendData(eiaCode, energyType!, direction!, forecastYears);

  if (!data) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "No trend data available for this combination" },
      { status: 404 }
    );
  }

  return NextResponse.json<ApiResponse<TrendData>>({ success: true, data });
}
