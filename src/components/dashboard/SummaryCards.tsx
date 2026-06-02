"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar, Percent } from "lucide-react";
import { PortfolioSummary } from "@/types";
import { formatInr, formatDate } from "@/lib/utils";

interface Props {
  summary: PortfolioSummary;
}

export function SummaryCards({ summary }: Props) {
  const cards = [
    {
      title: "Portfolio Value",
      value: formatInr(summary.totalValueInr),
      icon: DollarSign,
      sub: "Total market value",
    },
    {
      title: "Annual Income",
      value: formatInr(summary.totalAnnualIncomeInr),
      icon: TrendingUp,
      sub: "Projected dividends",
    },
    {
      title: "Avg. Yield",
      value: `${summary.avgYield.toFixed(2)}%`,
      icon: Percent,
      sub: "Portfolio yield",
    },
    {
      title: "Next Payment",
      value: formatInr(summary.nextPaymentInr),
      icon: Calendar,
      sub: summary.nextPaymentDate ? formatDate(summary.nextPaymentDate) : "No upcoming",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
