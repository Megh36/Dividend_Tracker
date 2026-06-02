import { NextRequest, NextResponse } from "next/server";
import { fetchDividendHistory } from "@/lib/yahoo";

export async function GET(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const years = Number(req.nextUrl.searchParams.get("years") ?? 5);
  const history = await fetchDividendHistory(params.symbol.toUpperCase(), years);
  return NextResponse.json(history);
}
