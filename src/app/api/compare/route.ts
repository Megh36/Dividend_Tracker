/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new (YahooFinance as any)({ suppressNotices: ["yahooSurvey"] });

const MODULES = [
  "price",
  "defaultKeyStatistics",
  "financialData",
  "summaryDetail",
] as const;

function toISODate(v: any): string | null {
  if (!v) return null;
  try {
    if (v instanceof Date) return v.toISOString().split("T")[0];
    if (typeof v === "number") return new Date(v * 1000).toISOString().split("T")[0];
    return new Date(v).toISOString().split("T")[0];
  } catch {
    return null;
  }
}

function daysToEx(exDate: string | null): number | null {
  if (!exDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ex = new Date(exDate);
  ex.setHours(0, 0, 0, 0);
  return Math.round((ex.getTime() - today.getTime()) / 86_400_000);
}

function estimateFrequency(annualRate: number | null, lastDiv: number | null): string | null {
  if (!annualRate || !lastDiv || lastDiv <= 0) return null;
  const n = Math.round(annualRate / lastDiv);
  if (n === 12) return "Monthly";
  if (n === 4)  return "Quarterly";
  if (n === 2)  return "Half-yearly";
  if (n === 1)  return "Annual";
  if (n > 0)    return `${n}× / year`;
  return null;
}

async function fetchStockData(symbol: string) {
  try {
    const summary = await yf.quoteSummary(symbol, { modules: [...MODULES] });

    const p:  any = summary?.price               ?? {};
    const ks: any = summary?.defaultKeyStatistics ?? {};
    const fd: any = summary?.financialData        ?? {};
    const sd: any = summary?.summaryDetail        ?? {};

    const annualRate = sd.trailingAnnualDividendRate ?? p.regularMarketDividendRate ?? null;
    const lastDiv    = ks.lastDividendValue ?? null;
    const exDateRaw  = sd.exDividendDate ?? null;
    const exDate     = toISODate(exDateRaw);

    return {
      symbol:        p.symbol                          ?? symbol,
      name:          p.longName ?? p.shortName         ?? symbol,
      sector:        p.sector ?? p.sectorDisp          ?? null,

      price:         p.regularMarketPrice              ?? 0,
      change:        p.regularMarketChange             ?? 0,
      changePercent: p.regularMarketChangePercent      ?? 0,

      marketCap:     sd.marketCap ?? p.marketCap       ?? null,
      peRatio:       sd.trailingPE                     ?? null,
      eps:           ks.trailingEps                    ?? null,
      priceToBook:   ks.priceToBook                    ?? null,

      revenue:       fd.totalRevenue                   ?? null,
      profitMargin:  fd.profitMargins                  ?? null,
      returnOnEquity:fd.returnOnEquity                 ?? null,
      debtEquity:    fd.debtToEquity                   ?? null,

      week52High:    sd.fiftyTwoWeekHigh               ?? null,
      week52Low:     sd.fiftyTwoWeekLow                ?? null,

      divYield:      sd.trailingAnnualDividendYield     ?? null,
      divPerShare:   annualRate,
      exDate,
      daysToEx:      daysToEx(exDate),

      payoutRatio:   sd.payoutRatio                    ?? null,
      divFrequency:  estimateFrequency(annualRate, lastDiv),
      fiveYearAvgYield: sd.fiveYearAvgDividendYield    ?? null,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get("symbols");
  if (!param) {
    return NextResponse.json({ error: "symbols query param required" }, { status: 400 });
  }

  const symbols = param.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
  if (symbols.length < 2) {
    return NextResponse.json({ error: "at least 2 symbols required" }, { status: 400 });
  }

  const results = await Promise.all(symbols.map(fetchStockData));
  return NextResponse.json(results);
}
