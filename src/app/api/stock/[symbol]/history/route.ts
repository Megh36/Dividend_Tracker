import { NextRequest, NextResponse } from "next/server";
import { fetchPriceHistory } from "@/lib/yahoo";

export async function GET(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const months = Number(req.nextUrl.searchParams.get("months") ?? 12);
  const history = await fetchPriceHistory(params.symbol.toUpperCase(), months);
  return NextResponse.json(history);
}
