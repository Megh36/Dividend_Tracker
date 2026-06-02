"use client";

import Link from "next/link";
import { cn, daysToExDate, formatInr, formatMarketCap } from "@/lib/utils";
import { useWatchlistStore } from "@/store/watchlist";

export interface WatchlistStockData {
  symbol: string;
  shortName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  trailingAnnualDividendYield: number | null;
  exDividendDate: string | null;
  sector: string;
  marketCap: number | null;
  trailingPE: number | null;
}

const SECTOR_DISPLAY: Record<string, string> = {
  "ITC.NS":       "FMCG",
  "COALINDIA.NS": "Energy",
  "POWERGRID.NS": "Utilities",
  "HINDZINC.NS":  "Metals",
  "INFY.NS":      "IT",
  "ONGC.NS":      "Energy",
  "TCS.NS":       "IT",
  "HDFCBANK.NS":  "Banking",
  "SBIN.NS":      "Banking",
  "BAJFINANCE.NS":"Finance",
  "BRITANNIA.NS": "FMCG",
  "NESTLEIND.NS": "FMCG",
};

export function SkeletonCard() {
  return (
    <div className="stock-card p-5 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-2.5 w-14 bg-border rounded" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-border rounded-full" />
          <div className="h-5 w-5 bg-border-faint rounded-full" />
        </div>
      </div>
      <div className="h-6 w-20 bg-border rounded mb-1" />
      <div className="h-3 w-36 bg-border-faint rounded mb-3" />
      <div className="h-7 w-28 bg-border rounded mb-1" />
      <div className="h-4 w-16 bg-border-faint rounded mb-4" />
      <div className="flex justify-between pt-3 border-t border-border-faint">
        <div>
          <div className="h-2 w-10 bg-border-faint rounded mb-1" />
          <div className="h-4 w-12 bg-border rounded" />
        </div>
        <div>
          <div className="h-2 w-14 bg-border-faint rounded mb-1" />
          <div className="h-4 w-20 bg-border rounded" />
        </div>
      </div>
    </div>
  );
}

export function WatchlistCard({ stock }: { stock: WatchlistStockData }) {
  const positive    = stock.regularMarketChangePercent >= 0;
  const yieldPct    = (stock.trailingAnnualDividendYield ?? 0) * 100;
  const sectorLabel = SECTOR_DISPLAY[stock.symbol] ?? stock.sector ?? "—";
  const ticker      = stock.symbol.replace(/\.(NS|BO)$/, "");
  const rawDays     = daysToExDate(stock.exDividendDate);
  const daysToEx    = rawDays ?? -1;

  const saved  = useWatchlistStore((s) => s.saved.includes(stock.symbol));
  const toggle = useWatchlistStore((s) => s.toggle);

  const urgencyClass =
    daysToEx <= 0  ? "badge-passed"  :
    daysToEx <= 14 ? "badge-urgent"  :
    daysToEx <= 30 ? "badge-warning" :
                     "badge-safe";

  const badgeLabel = daysToEx <= 0 ? "ex passed" : `${daysToEx}d to ex`;

  return (
    <Link href={`/stock/${stock.symbol}`} className="block">
      <div className={cn("stock-card p-5", saved && "saved")}>

        {/* Top row — sector, ex-date badge, heart */}
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold tracking-widest text-text-muted uppercase font-sans">
            {sectorLabel}
          </span>
          <div className="flex items-center gap-2">
            {stock.exDividendDate && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold font-sans ${urgencyClass}`}>
                ⏱ {badgeLabel}
              </span>
            )}
            <button
              className={`heart-btn ${saved ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(stock.symbol);
              }}
              aria-label={saved ? "Remove from saved" : "Save stock"}
            >
              {saved ? "♥" : "♡"}
            </button>
          </div>
        </div>

        {/* Ticker + company name */}
        <div className="font-display font-bold text-xl text-accent mb-0.5">
          {ticker}
        </div>
        <div className="text-xs text-text-muted mb-3 uppercase tracking-wide font-sans">
          {stock.shortName}
        </div>

        {/* Price */}
        <div className="text-2xl font-bold text-text-primary mb-1 font-display tabular-nums">
          {formatInr(stock.regularMarketPrice)}
        </div>
        <div className={`text-sm mb-4 font-sans ${positive ? "gain" : "loss"}`}>
          {positive ? "▲" : "▼"} {Math.abs(stock.regularMarketChangePercent).toFixed(2)}%
          <span className="ml-1 text-xs opacity-70">
            ({positive ? "+" : "−"}₹{Math.abs(stock.regularMarketChange).toFixed(2)})
          </span>
        </div>

        {/* Stats */}
        <div className="flex justify-between border-t border-border pt-3">
          <div>
            <div className="text-xs text-text-muted mb-0.5 uppercase tracking-widest font-sans">
              Div Yield
            </div>
            <div className={`text-sm font-semibold font-sans ${yieldPct >= 4 ? "text-accent" : yieldPct > 0 ? "text-text-primary" : "text-text-muted"}`}>
              {yieldPct > 0 ? `${yieldPct.toFixed(2)}%` : "—"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-text-muted mb-0.5 uppercase tracking-widest font-sans">
              Mkt Cap
            </div>
            <div className="text-sm font-semibold text-text-secondary font-sans">
              {formatMarketCap(stock.marketCap, stock.currency)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
