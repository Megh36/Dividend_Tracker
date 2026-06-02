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
  const years = Math.min(Math.max(Number(req.nextUrl.searchParams.get("years") ?? 5), 1), 10);

  try {
    const symbol = await resolveSymbol(raw);

    const from = new Date();
    from.setFullYear(from.getFullYear() - years);
    const period1 = from.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const period2 = new Date().toISOString().split("T")[0];

    // Fetch quote currency alongside history
    const [quote, historical] = await Promise.all([
      yf.quote(symbol),
      yf.historical(symbol, { period1, period2, events: "dividends" }),
    ]);

    const currency: string = quote.currency ?? "USD";

    const dividends = (historical as any[])
      .filter((d: any) => d.dividends != null && d.dividends > 0)
      .map((d: any) => ({
        date: new Date(d.date).toISOString().split("T")[0],
        amount: d.dividends as number,
        currency,
      }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Derive frequency and trailing-12M total
    const last12Months = dividends.filter(
      (d: any) => d.date >= new Date(Date.now() - 365 * 86400_000).toISOString().split("T")[0]
    );
    const trailing12M = last12Months.reduce((s: number, d: any) => s + d.amount, 0);
    const frequency = last12Months.length; // payments in the last year

    return NextResponse.json({
      symbol,
      currency,
      years,
      count: dividends.length,
      trailing12M,
      frequency, // e.g. 4 = quarterly, 12 = monthly
      dividends,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch dividend history", symbol: raw },
      { status: 500 }
    );
  }
}
