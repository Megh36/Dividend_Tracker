"use client";

import { useState } from "react";
import { AlertTriangle, ShoppingCart } from "lucide-react";
import { cn, formatInr, daysToExDate } from "@/lib/utils";
import type { StockDetail } from "./StockDetailHeader";

export function BuyPanel({ stock }: { stock: StockDetail }) {
  const [qty, setQty] = useState(1);

  const price = stock.regularMarketPrice;
  const total = price * qty;

  const exDays   = daysToExDate(stock.exDividendDate);
  const isUrgent = exDays !== null && exDays >= 0 && exDays <= 14;
  const isToday  = exDays === 0;

  const annualDiv       = stock.trailingAnnualDividendRate;
  const estimatedAnnual = annualDiv != null ? annualDiv * qty : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/97 backdrop-blur-sm">
      {/* Urgency banner */}
      {isUrgent && (
        <div
          className={cn(
            "flex items-center justify-center gap-2 py-2 text-[13px] font-medium font-sans",
            isToday ? "bg-accent text-white" : "bg-warning/15 text-warning"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {isToday
            ? "Ex-dividend date is TODAY — buy now to qualify for the next dividend"
            : `Ex-dividend date in ${exDays} day${exDays === 1 ? "" : "s"} — buy before ${new Date(stock.exDividendDate!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} to earn the dividend`}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center gap-4">
        {/* Ticker reminder */}
        <div className="hidden sm:block">
          <p className="text-[14px] font-semibold text-text-primary font-sans">
            {stock.symbol.replace(/\.(NS|BO)$/, "")}
          </p>
          <p className="text-[15px] font-semibold text-text-secondary tabular-nums font-sans">
            {formatInr(price)} / share
          </p>
        </div>

        <div className="flex-1" />

        {/* Estimated income */}
        {estimatedAnnual != null && (
          <div className="text-right hidden sm:block">
            <p className="text-[12px] uppercase tracking-[0.04em] text-text-muted font-sans">Est. Annual Income</p>
            <p className="text-[16px] font-semibold text-gain tabular-nums font-sans">
              {formatInr(estimatedAnnual)}
            </p>
          </div>
        )}

        {/* Total cost */}
        <div className="text-right">
          <p className="text-[12px] uppercase tracking-[0.04em] text-text-muted font-sans">Total Cost</p>
          <p className="text-[16px] font-bold text-text-primary tabular-nums font-display">
            {formatInr(total)}
          </p>
        </div>

        {/* Qty input */}
        <div className="flex items-center gap-2 bg-background-subtle border border-border rounded-[8px] px-3 py-2">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="text-text-muted hover:text-text-primary w-6 text-center font-bold text-[18px] transition-colors leading-none"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 1) setQty(v);
            }}
            className="w-14 text-center bg-transparent text-text-primary font-semibold text-[15px] tabular-nums outline-none font-sans [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => setQty((q) => q + 1)}
            className="text-text-muted hover:text-text-primary w-6 text-center font-bold text-[18px] transition-colors leading-none"
          >
            +
          </button>
        </div>

        {/* CTA button */}
        <button
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-[8px] font-semibold text-[15px] font-sans transition-all duration-150",
            "bg-accent text-white hover:bg-accent-hover",
            isUrgent && "shadow-[0_0_16px_rgba(192,57,43,0.3)]"
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          {isUrgent ? "Buy · Earn Dividend" : "Buy to Earn Dividend"}
        </button>
      </div>
    </div>
  );
}
