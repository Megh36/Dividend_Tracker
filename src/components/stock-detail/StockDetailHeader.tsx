"use client";

import { Building2, Clock } from "lucide-react";
import { cn, formatInr, formatMarketCap, daysToExDate } from "@/lib/utils";

export interface StockDetail {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  exchange: string;
  sector: string;
  industry: string;
  website: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: number | null;
  trailingPE: number | null;
  trailingEps: number | null;
  forwardPE: number | null;
  priceToBook: number | null;
  totalRevenue: number | null;
  profitMargins: number | null;
  grossMargins: number | null;
  returnOnEquity: number | null;
  debtToEquity: number | null;
  dividendRate: number | null;
  dividendYield: number | null;
  trailingAnnualDividendRate: number | null;
  trailingAnnualDividendYield: number | null;
  exDividendDate: string | null;
  payoutRatio: number | null;
  fiveYearAvgDividendYield: number | null;
  lastDividendValue: number | null;
  lastDividendDate: string | null;
  recommendationKey: string | null;
  targetMeanPrice: number | null;
  numberOfAnalystOpinions: number | null;
}

function ExDateChip({ exDividendDate }: { exDividendDate: string | null }) {
  const days = daysToExDate(exDividendDate);
  if (days === null || days < 0) return null;

  let badgeClass = "badge-safe";
  let label = `${days}d to ex-date`;

  if (days === 0) {
    badgeClass = "badge-urgent";
    label = "EX TODAY";
  } else if (days <= 14) {
    badgeClass = "badge-urgent";
  } else if (days <= 30) {
    badgeClass = "badge-warning";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full",
        badgeClass
      )}
    >
      <Clock className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

export function StockDetailHeader({ stock }: { stock: StockDetail }) {
  const positive  = stock.regularMarketChangePercent >= 0;
  const ticker    = stock.symbol.replace(/\.(NS|BO)$/, "");
  const yieldPct  = (stock.trailingAnnualDividendYield ?? 0) * 100;

  const range52   = stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow;
  const pricePct52 = range52 > 0
    ? ((stock.regularMarketPrice - stock.fiftyTwoWeekLow) / range52) * 100
    : 50;

  const exDays   = daysToExDate(stock.exDividendDate);
  const exUrgent = exDays !== null && exDays >= 0 && exDays <= 14;

  return (
    <div className="detail-card p-6 space-y-5">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          {stock.sector && (
            <p className="text-[10px] uppercase tracking-[0.18em] text-accent font-bold mb-2">
              {stock.sector}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-display text-text-primary">
            {stock.longName || stock.shortName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-xs font-mono text-text-secondary bg-background-subtle border border-border px-2 py-0.5 rounded">
              {ticker}
            </span>
            {stock.exchange && (
              <span className="text-xs text-text-muted font-sans">{stock.exchange}</span>
            )}
            {stock.industry && (
              <span className="flex items-center gap-1 text-xs text-text-muted font-sans">
                <Building2 className="h-3 w-3" />
                {stock.industry}
              </span>
            )}
          </div>
        </div>

        {/* Price block */}
        <div className="text-right">
          <p className="text-4xl font-bold text-text-primary tabular-nums leading-none font-display">
            {formatInr(stock.regularMarketPrice)}
          </p>
          <div className={cn("flex items-center justify-end gap-1.5 mt-2 text-sm font-semibold font-sans", positive ? "gain" : "loss")}>
            <span>{positive ? "▲" : "▼"}</span>
            <span className="tabular-nums">
              {positive ? "+" : ""}{stock.regularMarketChangePercent.toFixed(2)}%
            </span>
            <span className="text-text-muted font-normal tabular-nums">
              ({positive ? "+" : ""}{formatInr(stock.regularMarketChange)})
            </span>
          </div>

          {stock.exDividendDate && (
            <div className="flex justify-end mt-2.5">
              <ExDateChip exDividendDate={stock.exDividendDate} />
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border-faint">
        <StatCell label="Market Cap" value={formatMarketCap(stock.marketCap, stock.currency)} />
        <StatCell label="Div Yield" value={yieldPct > 0 ? `${yieldPct.toFixed(2)}%` : "—"} accent={yieldPct >= 4} />
        <StatCell
          label="Ex-Dividend"
          value={
            stock.exDividendDate
              ? new Date(stock.exDividendDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "—"
          }
          accent={exUrgent}
          compact
        />
        <StatCell label="Volume" value={formatVolume(stock.regularMarketVolume)} />
      </div>

      {/* 52-week range */}
      <div>
        <div className="flex justify-between text-[12px] text-text-muted mb-1.5 font-sans">
          <span>52W Low · {formatInr(stock.fiftyTwoWeekLow)}</span>
          <span>52W High · {formatInr(stock.fiftyTwoWeekHigh)}</span>
        </div>
        <div className="h-1.5 bg-background-subtle rounded-full overflow-hidden border border-border-faint">
          <div
            className="h-full rounded-full bg-gradient-to-r from-loss via-warning to-gain"
            style={{ width: `${Math.max(2, Math.min(98, pricePct52))}%` }}
          />
        </div>
        <div
          className="mt-1 flex justify-end"
          style={{ paddingRight: `${100 - Math.max(2, Math.min(98, pricePct52))}%` }}
        >
          <span className="text-[9px] text-text-muted">▲</span>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, accent = false, compact = false }: { label: string; value: string; accent?: boolean; compact?: boolean }) {
  return (
    <div className="bg-background-subtle rounded-[8px] p-3">
      <p className="text-[12px] uppercase tracking-[0.04em] text-text-muted font-sans mb-1">{label}</p>
      <p className={cn(
        "font-semibold tabular-nums font-sans leading-tight",
        compact ? "text-[16px]" : "text-[18px]",
        accent ? "text-accent" : "text-text-primary"
      )}>
        {value}
      </p>
    </div>
  );
}

function formatVolume(vol: number): string {
  if (!vol) return "—";
  if (vol >= 1e7) return `${(vol / 1e7).toFixed(2)} Cr`;
  if (vol >= 1e5) return `${(vol / 1e5).toFixed(2)} L`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
  return vol.toString();
}
