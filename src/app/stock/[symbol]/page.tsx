"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, BarChart2 } from "lucide-react";
import { StockDetailHeader, type StockDetail } from "@/components/stock-detail/StockDetailHeader";
import { PriceChart, type Candle } from "@/components/stock-detail/PriceChart";
import { DividendHistoryChart, type DividendPoint } from "@/components/stock-detail/DividendHistoryChart";
import { KeyStatsGrid } from "@/components/stock-detail/KeyStatsGrid";
import { DividendInfoPanel } from "@/components/stock-detail/DividendInfoPanel";
import { OrderBook } from "@/components/stock-detail/OrderBook";
import { BuyPanel } from "@/components/stock-detail/BuyPanel";

interface HistoryResponse {
  candles: Candle[];
  periodReturn: number;
  high: number;
  low: number;
}

interface DividendsResponse {
  dividends: DividendPoint[];
  trailing12M: number;
  frequency: number;
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SectionSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse detail-card ${className ?? ""}`} />
  );
}

function HeaderSkeleton() {
  return (
    <div className="detail-card p-6 space-y-5 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-2.5 w-16 bg-border rounded" />
          <div className="h-8 w-64 bg-border rounded" />
          <div className="flex gap-2 mt-1">
            <div className="h-5 w-12 bg-border-faint rounded" />
            <div className="h-5 w-16 bg-border-faint rounded" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="h-10 w-36 bg-border rounded ml-auto" />
          <div className="h-4 w-24 bg-border-faint rounded ml-auto" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border-faint">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-background-subtle rounded-[8px] p-3 space-y-1.5">
            <div className="h-2 w-12 bg-border-faint rounded" />
            <div className="h-4 w-16 bg-border rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <div className="h-2.5 w-20 bg-border-faint rounded" />
          <div className="h-2.5 w-20 bg-border-faint rounded" />
        </div>
        <div className="h-1.5 bg-border-faint rounded-full" />
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function StockError({ symbol, message, onRetry }: { symbol: string; message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="h-12 w-12 rounded-full bg-background-subtle border border-border flex items-center justify-center">
        <span className="text-text-muted text-xl">!</span>
      </div>
      <div className="text-center space-y-1">
        <p className="text-text-secondary text-sm">
          Could not load data for{" "}
          <span className="text-text-primary font-mono">{symbol}</span>
        </p>
        <p className="text-text-muted text-xs max-w-sm">{message}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
        <span className="text-border-strong">·</span>
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to watchlist
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StockDetailPage({
  params,
}: {
  params: { symbol: string };
}) {
  const upper = params.symbol.toUpperCase();

  const [stock, setStock]               = useState<StockDetail | null>(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError]     = useState<string | null>(null);

  const [history, setHistory]             = useState<HistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError]   = useState<string | null>(null);

  const [divData, setDivData]           = useState<DividendsResponse | null>(null);
  const [divLoading, setDivLoading]     = useState(true);
  const [divError, setDivError]         = useState<string | null>(null);

  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    setStockLoading(true);  setStockError(null);
    setHistoryLoading(true); setHistoryError(null);
    setDivLoading(true);    setDivError(null);

    fetch(`/api/stock/${upper}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.error) setStockError(data.error ?? "Failed to fetch quote");
        else setStock(data as StockDetail);
        setStockLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setStockError(err?.message ?? "Network error");
        setStockLoading(false);
      });

    fetch(`/api/history/${upper}?days=365`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.error) { setHistoryError(data.error); setHistory(null); }
        else setHistory(data as HistoryResponse);
        setHistoryLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setHistoryError(err?.message ?? "Failed to load price history");
        setHistoryLoading(false);
      });

    fetch(`/api/dividends/${upper}?years=5`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.error) { setDivError(data.error); setDivData(null); }
        else setDivData(data as DividendsResponse);
        setDivLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setDivError(err?.message ?? "Failed to load dividend history");
        setDivLoading(false);
      });

    return () => { mounted = false; };
  }, [upper, fetchKey]);

  const retry = () => setFetchKey((k) => k + 1);

  if (!stockLoading && stockError) {
    return (
      <div className="pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Watchlist
        </Link>
        <StockError symbol={upper} message={stockError} onRetry={retry} />
      </div>
    );
  }

  return (
    <div className="pb-28 space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors duration-150"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Watchlist
      </Link>

      {/* 1. Header */}
      {stockLoading ? (
        <HeaderSkeleton />
      ) : stock ? (
        <>
          <StockDetailHeader stock={stock} />
          <div className="flex justify-end -mt-1">
            <Link
              href={`/compare?symbols=${stock.symbol}`}
              className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-accent transition-colors font-sans"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Compare with another stock
            </Link>
          </div>
        </>
      ) : null}

      {/* 2. Price chart + Key stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PriceChart
            candles={history?.candles ?? []}
            loading={historyLoading}
            error={historyError}
          />
        </div>
        {stockLoading ? (
          <SectionSkeleton className="h-96" />
        ) : stock ? (
          <KeyStatsGrid stock={stock} />
        ) : null}
      </div>

      {/* 3. Dividend history */}
      <DividendHistoryChart
        dividends={divData?.dividends ?? []}
        trailing12M={divData?.trailing12M ?? 0}
        frequency={divData?.frequency ?? 0}
        loading={divLoading}
        error={divError}
      />

      {/* 4. Dividend info + Order book */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {stockLoading ? (
          <>
            <SectionSkeleton className="h-72" />
            <SectionSkeleton className="h-72" />
          </>
        ) : stock ? (
          <>
            <DividendInfoPanel stock={stock} frequency={divData?.frequency ?? 0} />
            <OrderBook price={stock.regularMarketPrice} />
          </>
        ) : null}
      </div>

      {!stockLoading && stock && <BuyPanel stock={stock} />}
    </div>
  );
}
