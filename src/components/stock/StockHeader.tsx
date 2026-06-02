"use client";

import Link from "next/link";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StockQuote } from "@/types";
import { formatInr, formatPercent, toInr, cn } from "@/lib/utils";

interface Props {
  quote: StockQuote;
  exchangeRate: number;
}

export function StockHeader({ quote, exchangeRate }: Props) {
  const positive = quote.regularMarketChangePercent >= 0;
  const currency = quote.currency ?? "USD";
  const priceInr = toInr(quote.regularMarketPrice, currency, exchangeRate);
  const changeInr = toInr(Math.abs(quote.regularMarketChange), currency, exchangeRate);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{quote.symbol}</h1>
            <Badge variant="secondary">{quote.sectorDisp ?? "Equity"}</Badge>
            <Badge variant="outline" className="text-xs">{currency}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">{quote.shortName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 pl-10">
        <span className="text-3xl font-bold">{formatInr(priceInr)}</span>
        <span
          className={cn(
            "flex items-center gap-1 text-sm font-medium",
            positive ? "text-green-600" : "text-red-600"
          )}
        >
          {positive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {formatInr(changeInr)} ({formatPercent(quote.regularMarketChangePercent)})
        </span>
      </div>
    </div>
  );
}
