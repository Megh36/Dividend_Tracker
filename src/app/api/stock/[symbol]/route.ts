/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new (YahooFinance as any)({
  suppressNotices: ["yahooSurvey"],
});

/**
 * Resolve the correct Yahoo Finance symbol.
 * If the symbol has no exchange suffix, try it as-is; if it fails,
 * retry with ".NS" for NSE. Symbols that already carry a suffix
 * (e.g. RELIANCE.NS, TCS.BO) are used unchanged.
 */
async function resolveSymbol(raw: string): Promise<string> {
  if (raw.includes(".")) return raw; // already has an exchange suffix
  try {
    await yf.quote(raw);
    return raw;
  } catch {
    return `${raw}.NS`;
  }
}

const SUMMARY_MODULES = [
  "assetProfile",
  "summaryDetail",
  "financialData",
  "defaultKeyStatistics",
] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const raw = params.symbol.toUpperCase();

  try {
    const symbol = await resolveSymbol(raw);

    const [quote, summary] = await Promise.all([
      yf.quote(symbol),
      yf.quoteSummary(symbol, { modules: [...SUMMARY_MODULES] }).catch(() => null),
    ]);

    const sd: any = summary?.summaryDetail ?? {};
    const fd: any = summary?.financialData ?? {};
    const ks: any = summary?.defaultKeyStatistics ?? {};
    const ap: any = summary?.assetProfile ?? {};

    return NextResponse.json({
      symbol: quote.symbol,
      shortName: quote.shortName ?? raw,
      longName: quote.longName ?? quote.shortName ?? raw,
      currency: quote.currency ?? "USD",
      exchange: quote.fullExchangeName ?? quote.exchange ?? "",
      sector: ap.sector ?? quote.sector ?? "",
      industry: ap.industry ?? "",
      website: ap.website ?? "",
      description: ap.longBusinessSummary ?? "",

      // Price
      regularMarketPrice: quote.regularMarketPrice ?? 0,
      regularMarketChange: quote.regularMarketChange ?? 0,
      regularMarketChangePercent: quote.regularMarketChangePercent ?? 0,
      regularMarketOpen: sd.regularMarketOpen ?? quote.regularMarketOpen ?? 0,
      regularMarketDayHigh: sd.regularMarketDayHigh ?? quote.regularMarketDayHigh ?? 0,
      regularMarketDayLow: sd.regularMarketDayLow ?? quote.regularMarketDayLow ?? 0,
      regularMarketVolume: quote.regularMarketVolume ?? 0,
      fiftyTwoWeekHigh: sd.fiftyTwoWeekHigh ?? quote.fiftyTwoWeekHigh ?? 0,
      fiftyTwoWeekLow: sd.fiftyTwoWeekLow ?? quote.fiftyTwoWeekLow ?? 0,
      fiftyDayAverage: sd.fiftyDayAverage ?? quote.fiftyDayAverage ?? 0,
      twoHundredDayAverage: sd.twoHundredDayAverage ?? quote.twoHundredDayAverage ?? 0,

      // Valuation
      marketCap: sd.marketCap ?? quote.marketCap ?? null,
      enterpriseValue: ks.enterpriseValue ?? null,
      trailingPE: sd.trailingPE ?? null,
      forwardPE: sd.forwardPE ?? ks.forwardPE ?? null,
      priceToBook: ks.priceToBook ?? null,
      priceToSales: sd.priceToSalesTrailing12Months ?? null,
      beta: sd.beta ?? ks.beta ?? null,
      trailingEps: ks.trailingEps ?? null,
      forwardEps: ks.forwardEps ?? null,

      // Financials
      totalRevenue: fd.totalRevenue ?? null,
      grossProfits: fd.grossProfits ?? null,
      ebitda: fd.ebitda ?? null,
      totalCash: fd.totalCash ?? null,
      totalDebt: fd.totalDebt ?? null,
      revenueGrowth: fd.revenueGrowth ?? null,
      earningsGrowth: fd.earningsGrowth ?? null,
      profitMargins: fd.profitMargins ?? ks.profitMargins ?? null,
      grossMargins: fd.grossMargins ?? null,
      operatingMargins: fd.operatingMargins ?? null,
      returnOnEquity: fd.returnOnEquity ?? null,
      returnOnAssets: fd.returnOnAssets ?? null,
      freeCashflow: fd.freeCashflow ?? null,
      debtToEquity: fd.debtToEquity ?? null,
      currentRatio: fd.currentRatio ?? null,

      // Dividends
      dividendRate: sd.dividendRate ?? null,
      dividendYield: sd.dividendYield ?? null,
      trailingAnnualDividendRate: sd.trailingAnnualDividendRate ?? quote.trailingAnnualDividendRate ?? null,
      trailingAnnualDividendYield: sd.trailingAnnualDividendYield ?? quote.trailingAnnualDividendYield ?? null,
      exDividendDate: sd.exDividendDate
        ? (sd.exDividendDate instanceof Date
            ? sd.exDividendDate.toISOString().split("T")[0]
            : new Date(sd.exDividendDate * 1000).toISOString().split("T")[0])
        : (quote.exDividendDate
            ? new Date(quote.exDividendDate).toISOString().split("T")[0]
            : null),
      payoutRatio: sd.payoutRatio ?? null,
      fiveYearAvgDividendYield: sd.fiveYearAvgDividendYield ?? null,
      lastDividendValue: ks.lastDividendValue ?? null,
      lastDividendDate: ks.lastDividendDate
        ? (ks.lastDividendDate instanceof Date
            ? ks.lastDividendDate.toISOString().split("T")[0]
            : new Date(ks.lastDividendDate * 1000).toISOString().split("T")[0])
        : null,

      // Analyst
      recommendationKey: fd.recommendationKey ?? null,
      recommendationMean: fd.recommendationMean ?? null,
      targetMeanPrice: fd.targetMeanPrice ?? null,
      numberOfAnalystOpinions: fd.numberOfAnalystOpinions ?? null,

      // Shares
      sharesOutstanding: ks.sharesOutstanding ?? null,
      floatShares: ks.floatShares ?? null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch quote", symbol: raw },
      { status: 404 }
    );
  }
}
