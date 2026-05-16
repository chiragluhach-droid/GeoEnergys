import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { COUNTRY_MAP, COUNTRY_BY_EIA } from "@/lib/utils/constants";
import { fetchEnergyBalance } from "@/services/eiaService";
import type { ApiResponse } from "@/types/api";
import type { EnergyBalancePoint } from "@/types/trade";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  country:   z.string(),
  startYear: z.coerce.number().int().min(1990).max(2030).optional().default(2000),
  endYear:   z.coerce.number().int().min(1990).max(2030).optional().default(2023),
});

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = QuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { country, startYear, endYear } = parsed.data;

  const byId  = COUNTRY_MAP[country.toLowerCase()];
  const byEia = COUNTRY_BY_EIA[country.toUpperCase()];
  const eiaCode = byId?.eiaCode ?? byEia?.eiaCode ?? country.toUpperCase();

  const data: EnergyBalancePoint[] = await fetchEnergyBalance(eiaCode, startYear, endYear);

  return NextResponse.json<ApiResponse<EnergyBalancePoint[]>>({ success: true, data });
}
