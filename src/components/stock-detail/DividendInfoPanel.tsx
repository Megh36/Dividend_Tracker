"use client";

import { Clock, Calendar, TrendingUp, Repeat } from "lucide-react";
import { cn, formatInr, daysToExDate } from "@/lib/utils";
import type { StockDetail } from "./StockDetailHeader";

function InfoRow({
  icon: Icon,
  label,
  value,
  sub,
  urgent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  urgent?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-[8px]",
      urgent ? "bg-accent/8 border border-accent/20" : "bg-background-subtle"
    )}>
      <div className={cn(
        "flex items-center justify-center h-9 w-9 rounded-[6px] shrink-0 mt-0.5",
        urgent ? "bg-accent/15" : "bg-background-card border border-border-faint"
      )}>
        <Icon className={cn("h-4 w-4", urgent ? "text-accent" : "text-text-muted")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] uppercase tracking-[0.04em] text-text-muted font-sans mb-0.5">{label}</p>
        <p className={cn("text-[16px] font-semibold truncate font-sans leading-snug", urgent ? "text-accent" : "text-text-primary")}>
          {value}
        </p>
        {sub && <p className="text-[13px] text-text-muted font-sans leading-[1.6] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function formatLocalDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function freqLabel(n: number): string {
  if (n === 12) return "Monthly";
  if (n === 4)  return "Quarterly";
  if (n === 2)  return "Half-yearly";
  if (n === 1)  return "Annual";
  if (n > 0)    return `${n}× per year`;
  return "—";
}

export function DividendInfoPanel({
  stock,
  frequency,
}: {
  stock: StockDetail;
  frequency: number;
}) {
  const yieldPct = (stock.trailingAnnualDividendYield ?? 0) * 100;
  const exDays   = daysToExDate(stock.exDividendDate);
  const exUrgent = exDays !== null && exDays >= 0 && exDays <= 14;

  let exLabel = "—";
  if (stock.exDividendDate) {
    const dateStr = formatLocalDate(stock.exDividendDate);
    if (exDays === null) {
      exLabel = dateStr;
    } else if (exDays < 0) {
      exLabel = `${dateStr} (passed)`;
    } else if (exDays === 0) {
      exLabel = "Today!";
    } else {
      exLabel = `${dateStr} · ${exDays}d away`;
    }
  }

  return (
    <div className="detail-card p-5 space-y-3">
      <p className="text-[13px] uppercase tracking-[0.04em] text-text-muted font-sans font-semibold mb-1">
        Dividend Details
      </p>

      {/* Yield highlight */}
      <div className="flex items-center justify-between bg-accent/6 border border-accent/15 rounded-[8px] px-4 py-4">
        <div>
          <p className="text-[12px] uppercase tracking-[0.04em] text-accent/70 font-sans mb-1">Annual Yield</p>
          <p className="text-2xl font-bold text-accent tabular-nums font-display">
            {yieldPct > 0 ? `${yieldPct.toFixed(2)}%` : "—"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] uppercase tracking-[0.04em] text-text-muted font-sans mb-1">Annual Div / Share</p>
          <p className="text-[15px] font-semibold text-text-primary tabular-nums font-sans">
            {stock.trailingAnnualDividendRate != null ? formatInr(stock.trailingAnnualDividendRate) : "—"}
          </p>
          {stock.fiveYearAvgDividendYield != null && (
            <p className="text-[13px] text-text-muted tabular-nums font-sans mt-0.5">
              5Y avg: {stock.fiveYearAvgDividendYield.toFixed(2)}%
            </p>
          )}
        </div>
      </div>

      <InfoRow
        icon={Clock}
        label="Ex-Dividend Date"
        value={exLabel}
        urgent={exUrgent}
        sub={exUrgent ? `Only ${exDays} day${exDays === 1 ? "" : "s"} left — buy before this date to qualify` : undefined}
      />
      <InfoRow
        icon={Calendar}
        label="Last Dividend"
        value={stock.lastDividendValue != null ? formatInr(stock.lastDividendValue) : "—"}
        sub={stock.lastDividendDate ? formatLocalDate(stock.lastDividendDate) : undefined}
      />
      <InfoRow
        icon={Repeat}
        label="Payment Frequency"
        value={freqLabel(frequency)}
      />
      <InfoRow
        icon={TrendingUp}
        label="Payout Ratio"
        value={stock.payoutRatio != null ? `${(stock.payoutRatio * 100).toFixed(1)}%` : "—"}
        sub={
          stock.payoutRatio != null
            ? stock.payoutRatio < 0.6
              ? "Sustainable payout"
              : stock.payoutRatio < 1
              ? "High payout — watch cashflow"
              : "Payout exceeds earnings"
            : undefined
        }
      />
    </div>
  );
}
