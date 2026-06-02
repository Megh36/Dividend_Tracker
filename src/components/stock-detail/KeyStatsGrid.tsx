"use client";

import { cn, formatInr, formatMarketCap } from "@/lib/utils";
import type { StockDetail } from "./StockDetailHeader";

function StatRow({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border-faint last:border-0 leading-[2.2]">
      <p className="text-[15px] text-text-muted font-sans">{label}</p>
      <div className="text-right">
        <p className={cn("text-[15px] font-semibold tabular-nums font-sans", highlight ? "text-accent" : "text-text-primary")}>
          {value}
        </p>
        {sub && <p className="text-[13px] text-text-muted tabular-nums font-sans">{sub}</p>}
      </div>
    </div>
  );
}

function fmt(v: number | null, decimals = 2, suffix = ""): string {
  if (v == null) return "—";
  return `${v.toFixed(decimals)}${suffix}`;
}

function fmtPct(v: number | null): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(2)}%`;
}

export function KeyStatsGrid({ stock }: { stock: StockDetail }) {
  return (
    <div className="detail-card p-5 h-full">
      <p className="text-[13px] uppercase tracking-[0.04em] text-text-muted font-sans font-semibold mb-3">
        Key Statistics
      </p>

      <div className="space-y-0">
        <StatRow
          label="P/E Ratio (TTM)"
          value={fmt(stock.trailingPE)}
          sub={stock.forwardPE != null ? `Fwd: ${fmt(stock.forwardPE)}` : undefined}
        />
        <StatRow
          label="EPS (TTM)"
          value={stock.trailingEps != null ? formatInr(stock.trailingEps) : "—"}
        />
        <StatRow label="Price / Book" value={fmt(stock.priceToBook)} />
        <StatRow label="Revenue" value={formatMarketCap(stock.totalRevenue, stock.currency)} />
        <StatRow
          label="Profit Margin"
          value={fmtPct(stock.profitMargins)}
          highlight={(stock.profitMargins ?? 0) > 0.15}
        />
        <StatRow label="Gross Margin" value={fmtPct(stock.grossMargins)} />
        <StatRow
          label="Return on Equity"
          value={fmtPct(stock.returnOnEquity)}
          highlight={(stock.returnOnEquity ?? 0) > 0.15}
        />
        <StatRow label="Debt / Equity" value={fmt(stock.debtToEquity)} />
        <StatRow label="52W High" value={stock.fiftyTwoWeekHigh ? formatInr(stock.fiftyTwoWeekHigh) : "—"} />
        <StatRow label="52W Low"  value={stock.fiftyTwoWeekLow  ? formatInr(stock.fiftyTwoWeekLow)  : "—"} />
        <StatRow label="Day High" value={stock.regularMarketDayHigh ? formatInr(stock.regularMarketDayHigh) : "—"} />
        <StatRow label="Day Low"  value={stock.regularMarketDayLow  ? formatInr(stock.regularMarketDayLow)  : "—"} />
      </div>
    </div>
  );
}
