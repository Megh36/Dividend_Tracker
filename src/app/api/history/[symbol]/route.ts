/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new (YahooFinance as any)({
  suppressNotices: ["yahooSurvey"],
});

async function resolveSymbol(raw: string): Promise<string> {
  if (raw.includes(".")) return raw;
  try {
    await yf.quote(raw);
    return raw;
  } catch {
    return `${raw}.NS`;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const raw = params.symbol.toUpperCase();
  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get("days") ?? 365), 30), 1825);

  try {
    const symbol = await resolveSymbol(raw);

    const from = new Date();
    from.setDate(from.getDate() - days);
    const period1 = from.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const period2 = new Date().toISOString().split("T")[0];

    const [quote, historical] = await Promise.all([
      yf.quote(symbol),
      yf.historical(symbol, { period1, period2, interval: "1d" }),
    ]);

    const currency: string = quote.currency ?? "USD";

    const candles = (historical as any[])
      .filter((d: any) => d.open != null && d.close != null)
      .map((d: any) => ({
        date: new Date(d.date).toISOString().split("T")[0],
        open: d.open as number,
        high: d.high as number,
        low: d.low as number,
        close: d.close as number,
        adjClose: d.adjClose as number ?? d.close as number,
        volume: d.volume as number ?? 0,
      }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Summary stats
    const closes = candles.map((c: any) => c.close);
    const high52w = closes.length ? Math.max(...closes) : 0;
    const low52w = closes.length ? Math.min(...closes) : 0;
    const first = candles[0]?.close ?? 0;
    const last = candles[candles.length - 1]?.close ?? 0;
    const periodReturn = first > 0 ? ((last - first) / first) * 100 : 0;

    return NextResponse.json({
      symbol,
      currency,
      days,
      count: candles.length,
      periodReturn,
      high: high52w,
      low: low52w,
      candles,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch price history", symbol: raw },
      { status: 500 }
    );
  }
}
