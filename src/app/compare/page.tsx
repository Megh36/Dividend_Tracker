"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComparisonTable } from "@/components/compare/ComparisonTable";

// ─── Stock list ───────────────────────────────────────────────────────────────

const STOCKS = [
  { symbol: "INFY.NS",       label: "INFY · Infosys" },
  { symbol: "TCS.NS",        label: "TCS · Tata Consultancy" },
  { symbol: "HDFCBANK.NS",   label: "HDFCBANK · HDFC Bank" },
  { symbol: "SBIN.NS",       label: "SBIN · State Bank" },
  { symbol: "ITC.NS",        label: "ITC" },
  { symbol: "BRITANNIA.NS",  label: "BRITANNIA" },
  { symbol: "NESTLEIND.NS",  label: "NESTLEIND · Nestlé" },
  { symbol: "COALINDIA.NS",  label: "COALINDIA · Coal India" },
  { symbol: "POWERGRID.NS",  label: "POWERGRID" },
  { symbol: "HINDZINC.NS",   label: "HINDZINC · Hindustan Zinc" },
  { symbol: "ONGC.NS",       label: "ONGC" },
  { symbol: "BAJFINANCE.NS", label: "BAJFINANCE · Bajaj Finance" },
] as const;

type StockSymbol = (typeof STOCKS)[number]["symbol"];

const VALID_SYMBOLS = new Set(STOCKS.map((s) => s.symbol));

function validSymbol(s: string): StockSymbol | null {
  return VALID_SYMBOLS.has(s as StockSymbol) ? (s as StockSymbol) : null;
}

// ─── Select widget ────────────────────────────────────────────────────────────

function StockSelect({
  value,
  onChange,
  exclude = [],
}: {
  value: string;
  onChange: (v: string) => void;
  exclude?: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none min-w-[196px] pr-8 pl-4 py-2.5",
          "bg-[#EDE9E0] border border-[#D5CFC4] rounded-lg",
          "text-[15px] text-text-primary font-sans",
          "cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent",
          "transition-colors hover:border-[#C4BDB1]"
        )}
      >
        {STOCKS.filter((s) => !exclude.includes(s.symbol)).map((s) => (
          <option key={s.symbol} value={s.symbol}>
            {s.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
    </div>
  );
}

// ─── Inner page (reads search params) ────────────────────────────────────────

function ComparePageContent() {
  const searchParams = useSearchParams();
  const pre = (searchParams.get("symbols") ?? "")
    .split(",")
    .map((s) => validSymbol(s.trim()))
    .filter((s): s is StockSymbol => s !== null);

  const defaultSlot2 = pre[0] === "TCS.NS" ? "INFY.NS" : "TCS.NS";

  const [slot1, setSlot1] = useState<StockSymbol>(pre[0] ?? "INFY.NS");
  const [slot2, setSlot2] = useState<StockSymbol>(pre[1] ?? defaultSlot2);
  const [slot3, setSlot3] = useState<StockSymbol | "">(pre[2] ?? "");
  const [showSlot3, setShowSlot3]   = useState(pre.length >= 3);

  const initComparing: string[] =
    pre.length >= 2 ? pre.slice(0, 3) : [pre[0] ?? "INFY.NS", defaultSlot2];
  const [comparing, setComparing] = useState<string[]>(initComparing);

  function handleAddSlot3() {
    const first = STOCKS.find((s) => s.symbol !== slot1 && s.symbol !== slot2);
    setSlot3(first?.symbol ?? STOCKS[2].symbol);
    setShowSlot3(true);
  }

  function handleRemoveSlot3() {
    setShowSlot3(false);
    setSlot3("");
  }

  function handleCompare() {
    const syms: string[] = [slot1, slot2, ...(showSlot3 && slot3 ? [slot3] : [])];
    setComparing(syms);
  }

  const activeCount = showSlot3 && slot3 ? 3 : 2;

  return (
    <div className="space-y-6">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-accent transition-colors font-sans mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to watchlist
        </Link>
        <h1 className="text-[28px] font-bold text-text-primary font-display leading-tight">
          Compare Stocks
        </h1>
        <p className="text-[15px] text-text-muted font-sans mt-1">
          Select 2 or 3 stocks to compare side by side
        </p>
      </div>

      {/* ── Selector card ─────────────────────────────────────────────── */}
      <div className="detail-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <StockSelect
            value={slot1}
            onChange={(v) => setSlot1(v as StockSymbol)}
            exclude={[slot2, slot3 || ""]}
          />

          <span className="text-[14px] text-text-muted font-display italic px-0.5">vs</span>

          <StockSelect
            value={slot2}
            onChange={(v) => setSlot2(v as StockSymbol)}
            exclude={[slot1, slot3 || ""]}
          />

          {showSlot3 ? (
            <>
              <span className="text-[14px] text-text-muted font-display italic px-0.5">vs</span>
              <div className="flex items-center gap-2">
                <StockSelect
                  value={slot3 || STOCKS[2].symbol}
                  onChange={(v) => setSlot3(v as StockSymbol)}
                  exclude={[slot1, slot2]}
                />
                <button
                  onClick={handleRemoveSlot3}
                  className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-background-subtle transition-colors"
                  aria-label="Remove 3rd stock"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleAddSlot3}
              className="flex items-center gap-1.5 text-[13px] text-text-muted hover:text-accent transition-colors font-sans py-2.5 px-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add 3rd stock
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={handleCompare}
            className={cn(
              "px-6 py-2.5 rounded-lg text-[15px] font-semibold font-sans",
              "bg-accent text-white hover:bg-accent-hover transition-colors"
            )}
          >
            Compare {activeCount} stocks
          </button>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <ComparisonTable symbols={comparing} />

    </div>
  );
}

// ─── Page export (Suspense required for useSearchParams) ─────────────────────

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-20 animate-pulse detail-card" />
          <div className="h-16 animate-pulse detail-card" />
          <div className="h-[600px] animate-pulse detail-card" />
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
