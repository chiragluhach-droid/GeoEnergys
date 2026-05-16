import { NextResponse } from "next/server";
import { ENERGY_TYPES } from "@/lib/utils/constants";
import type { ApiResponse } from "@/types/api";

export async function GET() {
  return NextResponse.json<ApiResponse<typeof ENERGY_TYPES>>(
    { success: true, data: ENERGY_TYPES },
    { headers: { "Cache-Control": "public, s-maxage=86400" } }
  );
}
