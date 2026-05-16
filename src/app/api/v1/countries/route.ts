import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/utils/constants";
import type { ApiResponse } from "@/types/api";
import type { CountryMeta } from "@/types/trade";

export async function GET() {
  const response: ApiResponse<CountryMeta[]> = {
    success: true,
    data: COUNTRIES,
  };
  return NextResponse.json(response, {
    headers: { "Cache-Control": "public, s-maxage=86400" },
  });
}
