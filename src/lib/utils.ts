import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { Stock, PortfolioSummary } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function toInr(amount: number, currency: string, rate: number): number {
  if (currency === "INR") return amount;
  return amount * rate;
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

/** Days from today to a YYYY-MM-DD date string. Negative = past. */
export function daysToExDate(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ex = new Date(dateStr);
  ex.setHours(0, 0, 0, 0);
  return Math.round((ex.getTime() - today.getTime()) / 86_400_000);
}

/** Format market cap for display (INR in Crores / Lakh Crores, USD in B/T). */
export function formatMarketCap(value: number | null, currency = "INR"): string {
  if (!value) return "—";
  if (currency === "INR") {
    const crore = 1e7;
    if (value >= 1e12) return `₹${(value / 1e12).toFixed(2)} L Cr`;
    if (value >= crore) {
      const cr = value / crore;
      const formatted = cr >= 1000
        ? cr.toLocaleString("en-IN", { maximumFractionDigits: 0 })
        : cr.toFixed(cr >= 100 ? 0 : 1);
      return `₹${formatted} Cr`;
    }
    return `₹${value.toLocaleString("en-IN")}`;
  }
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(1)}B`;
  return `$${(value / 1e6).toFixed(1)}M`;
}

export function computePortfolioSummary(
  stocks: Stock[],
  exchangeRate: number
): PortfolioSummary {
  if (stocks.length === 0) {
    return { totalValueInr: 0, totalAnnualIncomeInr: 0, avgYield: 0, nextPaymentInr: 0, nextPaymentDate: null };
  }
  const totalValueInr = stocks.reduce((sum, s) => sum + toInr(s.price * s.shares, s.currency, exchangeRate), 0);
  const totalAnnualIncomeInr = stocks.reduce((sum, s) => sum + toInr(s.annualDividend * s.shares, s.currency, exchangeRate), 0);
  const avgYield = totalValueInr > 0 ? (totalAnnualIncomeInr / totalValueInr) * 100 : 0;
  const upcoming = stocks.filter((s) => s.paymentDate).sort((a, b) => (a.paymentDate! > b.paymentDate! ? 1 : -1));
  const next = upcoming[0];
  return {
    totalValueInr,
    totalAnnualIncomeInr,
    avgYield,
    nextPaymentInr: next ? toInr((next.annualDividend / 4) * next.shares, next.currency, exchangeRate) : 0,
    nextPaymentDate: next?.paymentDate ?? null,
  };
}
