"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockQuote } from "@/types";
import { formatInr, formatDate, toInr } from "@/lib/utils";

interface Props {
  quote: StockQuote;
  exchangeRate: number;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function DividendStats({ quote, exchangeRate }: Props) {
  const currency = quote.currency ?? "USD";
  const exDate = quote.exDividendDate
    ? new Date(quote.exDividendDate * 1000).toISOString().split("T")[0]
    : null;
  const payDate = quote.dividendDate
    ? new Date(quote.dividendDate * 1000).toISOString().split("T")[0]
    : null;

  const annualInr = toInr(quote.trailingAnnualDividendRate, currency, exchangeRate);
  const quarterlyInr = toInr(quote.trailingAnnualDividendRate / 4, currency, exchangeRate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dividend Info</CardTitle>
      </CardHeader>
      <CardContent>
        <StatRow label="Annual Dividend" value={formatInr(annualInr)} />
        <StatRow
          label="Dividend Yield"
          value={`${((quote.trailingAnnualDividendYield ?? 0) * 100).toFixed(2)}%`}
        />
        <StatRow label="Quarterly Payment" value={formatInr(quarterlyInr)} />
        <StatRow label="Ex-Dividend Date" value={formatDate(exDate)} />
        <StatRow label="Payment Date" value={formatDate(payDate)} />
        <StatRow label="Currency" value={currency} />
      </CardContent>
    </Card>
  );
}
