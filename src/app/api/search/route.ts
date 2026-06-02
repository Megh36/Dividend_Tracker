/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new (YahooFinance as any)();

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }
  try {
    const results = await yf.search(query, { newsCount: 0 });
    const quotes = ((results.quotes ?? []) as any[])
      .filter((q: any) => q.isYahooFinance && q.quoteType === "EQUITY")
      .slice(0, 8)
      .map((q: any) => ({
        symbol: q.symbol,
        shortname: q.shortname ?? q.symbol,
        exchDisp: q.exchDisp ?? "",
      }));
    return NextResponse.json(quotes);
  } catch {
    return NextResponse.json([]);
  }
}
