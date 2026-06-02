/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new (YahooFinance as any)();

export async function GET() {
  try {
    const quote = await yf.quote("USDINR=X");
    const rate = quote.regularMarketPrice ?? 84;
    return NextResponse.json({ rate }, { headers: { "Cache-Control": "s-maxage=300" } });
  } catch {
    return NextResponse.json({ rate: 84 });
  }
}
