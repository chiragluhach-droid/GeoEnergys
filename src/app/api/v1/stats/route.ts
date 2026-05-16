import { NextRequest, NextResponse } from "next/server";
import { StatsQuerySchema } from "@/lib/utils/validators";
import { getGlobalStats } from "@/services/tradeService";
import type { ApiResponse } from "@/types/api";
import type { GlobalStats } from "@/types/trade";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = StatsQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { energyType, year } = parsed.data;
  const stats = await getGlobalStats(energyType!, year!);

  return NextResponse.json<ApiResponse<GlobalStats>>({ success: true, data: stats });
}
