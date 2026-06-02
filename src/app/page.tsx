"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { BarChart2 } from "lucide-react";
import { WatchlistCard, SkeletonCard, type WatchlistStockData } from "@/components/watchlist/WatchlistCard";
import { FilterBar, type FilterKey } from "@/components/watchlist/FilterBar";
import { daysToExDate } from "@/lib/utils";
import { useWatchlistStore } from "@/store/watchlist";

// ─── Watchlist ────────────────────────────────────────────────────────────────

const WATCHLIST = [
  "ITC.NS",
  "COALINDIA.NS",
  "POWERGRID.NS",
  "HINDZINC.NS",
  "INFY.NS",
  "ONGC.NS",
  "TCS.NS",
  "HDFCBANK.NS",
  "SBIN.NS",
  "BAJFINANCE.NS",
  "BRITANNIA.NS",
  "NESTLEIND.NS",
] as const;

type WatchlistSymbol = (typeof WATCHLIST)[number];

const FILTER_SECTOR: Record<WatchlistSymbol, FilterKey | "finance"> = {
  "ITC.NS":       "fmcg",
  "COALINDIA.NS": "energy",
  "POWERGRID.NS": "energy",
  "HINDZINC.NS":  "energy",
  "INFY.NS":      "it",
  "ONGC.NS":      "energy",
  "TCS.NS":       "it",
  "HDFCBANK.NS":  "finance",
  "SBIN.NS":      "finance",
  "BAJFINANCE.NS":"finance",
  "BRITANNIA.NS": "fmcg",
  "NESTLEIND.NS": "fmcg",
};

// ─── Sorting ──────────────────────────────────────────────────────────────────

function sortByExDate(stocks: WatchlistStockData[]): WatchlistStockData[] {
  return [...stocks].sort((a, b) => {
    const dA = daysToExDate(a.exDividendDate);
    const dB = daysToExDate(b.exDividendDate);
    const futureA = dA !== null && dA >= 0;
    const futureB = dB !== null && dB >= 0;
    if (futureA && futureB) return dA! - dB!;
    if (futureA) return -1;
    if (futureB) return 1;
    return 0;
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stocks, setStocks] = useState<Record<string, WatchlistStockData>>({});
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [fetchError, setFetchError] = useState(false);

  const savedSymbols = useWatchlistStore((s) => s.saved);

  useEffect(() => {
    let mounted = true;
    setFetchError(false);

    Promise.allSettled(
      WATCHLIST.map((sym) =>
        fetch(`/api/stock/${sym}`)
          .then((r) => r.json())
          .then((data) => ({ sym, data }))
      )
    ).then((results) => {
      if (!mounted) return;
      const map: Record<string, WatchlistStockData> = {};
      let count = 0;
      results.forEach((r) => {
        if (r.status === "fulfilled" && !r.value.data?.error) {
          map[r.value.sym] = r.value.data as WatchlistStockData;
          count++;
        }
      });
      if (count === 0) setFetchError(true);
      setStocks(map);
      setLoadedCount(count);
      setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const allLoaded = useMemo(
    () => WATCHLIST.map((sym) => stocks[sym]).filter(Boolean) as WatchlistStockData[],
    [stocks]
  );

  const filtered = useMemo(() => {
    let list = allLoaded;
    switch (activeFilter) {
      case "high-yield":
        list = list.filter((s) => (s.trailingAnnualDividendYield ?? 0) * 100 >= 4);
        break;
      case "it":
        list = list.filter((s) => FILTER_SECTOR[s.symbol as WatchlistSymbol] === "it");
        break;
      case "energy":
        list = list.filter((s) => FILTER_SECTOR[s.symbol as WatchlistSymbol] === "energy");
        break;
      case "fmcg":
        list = list.filter((s) => FILTER_SECTOR[s.symbol as WatchlistSymbol] === "fmcg");
        break;
      case "saved":
        list = list.filter((s) => savedSymbols.includes(s.symbol));
        break;
    }
    return sortByExDate(list);
  }, [allLoaded, activeFilter, savedSymbols]);

  const counts: Record<FilterKey, number> = useMemo(() => ({
    all:          allLoaded.length,
    "high-yield": allLoaded.filter((s) => (s.trailingAnnualDividendYield ?? 0) * 100 >= 4).length,
    it:           allLoaded.filter((s) => FILTER_SECTOR[s.symbol as WatchlistSymbol] === "it").length,
    energy:       allLoaded.filter((s) => FILTER_SECTOR[s.symbol as WatchlistSymbol] === "energy").length,
    fmcg:         allLoaded.filter((s) => FILTER_SECTOR[s.symbol as WatchlistSymbol] === "fmcg").length,
    saved:        allLoaded.filter((s) => savedSymbols.includes(s.symbol)).length,
  }), [allLoaded, savedSymbols]);

  return (
    <div className="space-y-7">

      {/* Page header */}
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-accent font-bold mb-2">
            NSE Watchlist
          </p>
          <h1 className="text-3xl text-text-primary font-display">
            High Dividend Stocks
          </h1>
          <p className="text-sm text-text-muted mt-1.5 font-sans">
            {WATCHLIST.length} curated picks · sorted by ex-dividend date
            {savedSymbols.length > 0 && (
              <span className="text-text-secondary"> · {savedSymbols.length} saved</span>
            )}
          </p>
        </div>
        <div className="text-right text-xs text-text-muted font-mono tabular-nums">
          {loading ? (
            <span className="text-accent/70 animate-pulse">fetching quotes…</span>
          ) : fetchError ? (
            <span className="text-loss">failed to load</span>
          ) : (
            <span>{loadedCount}/{WATCHLIST.length} loaded</span>
          )}
        </div>
      </div>

      {/* Filter bar + Compare entry */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <FilterBar active={activeFilter} onChange={setActiveFilter} counts={counts} />
        <Link
          href="/compare"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#D5CFC4] text-[13px] text-[#555248] font-sans hover:border-[#C4BDB1] hover:text-[#1A1A1A] transition-colors whitespace-nowrap shrink-0"
        >
          <BarChart2 className="h-3.5 w-3.5" />
          Compare stocks
        </Link>
      </div>

      {/* Card grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {WATCHLIST.map((sym) => (
            <SkeletonCard key={sym} />
          ))}
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
          <p className="text-text-muted text-sm">
            Could not load quotes from Yahoo Finance.
          </p>
          <p className="text-text-muted/60 text-xs">
            The market may be closed or the API may be rate-limited. Try refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs text-accent hover:text-accent-hover transition-colors underline underline-offset-2"
          >
            Refresh
          </button>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-2">
              {activeFilter === "saved" ? (
                <>
                  <p className="text-text-secondary text-sm">No saved stocks yet.</p>
                  <p className="text-text-muted text-xs">
                    Tap the bookmark on any card to save a stock.
                  </p>
                </>
              ) : (
                <p className="text-text-secondary text-sm">No stocks match this filter.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((stock) => (
                <WatchlistCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
