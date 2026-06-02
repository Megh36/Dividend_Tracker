/* eslint-disable @typescript-eslint/no-explicit-any */
import YahooFinance from "yahoo-finance2";
import { StockQuote, DividendHistory, ChartDataPoint } from "@/types";

const yf = new (YahooFinance as any)({ suppressNotices: ["yahooSurvey"] });

export async function fetchQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const quote = await yf.quote(symbol);
    return {
      symbol: quote.symbol,
      shortName: quote.shortName ?? symbol,
      currency: quote.currency ?? "USD",
      regularMarketPrice: quote.regularMarketPrice ?? 0,
      regularMarketChange: quote.regularMarketChange ?? 0,
      regularMarketChangePercent: quote.regularMarketChangePercent ?? 0,
      trailingAnnualDividendRate: quote.trailingAnnualDividendRate ?? 0,
      trailingAnnualDividendYield: quote.trailingAnnualDividendYield ?? 0,
      dividendDate: quote.dividendDate
        ? new Date(quote.dividendDate).getTime() / 1000
        : undefined,
      exDividendDate: quote.exDividendDate
        ? new Date(quote.exDividendDate).getTime() / 1000
        : undefined,
      sectorDisp: quote.sectorDisp as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function fetchDividendHistory(
  symbol: string,
  years = 5
): Promise<DividendHistory[]> {
  try {
    const from = new Date();
    from.setFullYear(from.getFullYear() - years);
    const period1 = from.toISOString().split("T")[0];
    const period2 = new Date().toISOString().split("T")[0];

    const historical = await yf.historical(symbol, {
      period1, period2, events: "dividends",
    });

    // Determine currency from a live quote
    let currency = "USD";
    try {
      const q = await yf.quote(symbol);
      currency = q.currency ?? "USD";
    } catch { /* keep USD */ }

    return (historical as any[])
      .filter((d: any) => d.dividends !== undefined)
      .map((d: any) => ({
        date: new Date(d.date).toISOString().split("T")[0],
        amount: d.dividends ?? 0,
        currency,
        type: "regular" as const,
      }))
      .sort((a: DividendHistory, b: DividendHistory) =>
        a.date.localeCompare(b.date)
      );
  } catch {
    return [];
  }
}

export async function fetchPriceHistory(
  symbol: string,
  months = 12
): Promise<ChartDataPoint[]> {
  try {
    const from = new Date();
    from.setMonth(from.getMonth() - months);
    const period1 = from.toISOString().split("T")[0];
    const period2 = new Date().toISOString().split("T")[0];

    const historical = await yf.historical(symbol, {
      period1, period2, interval: "1mo",
    });

    return (historical as any[]).map((d: any) => ({
      date: new Date(d.date).toISOString().split("T")[0],
      amount: 0,
      price: d.close ?? 0,
    }));
  } catch {
    return [];
  }
}
