"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DividendHistory } from "@/types";
import { toInr, formatInr } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface Props {
  data: DividendHistory[];
  exchangeRate: number;
}

export function DividendBarChart({ data, exchangeRate }: Props) {
  const formatted = data.map((d) => ({
    label: format(parseISO(d.date), "MMM yy"),
    amount: toInr(d.amount, d.currency, exchangeRate),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `₹${v.toFixed(0)}`}
        />
        <Tooltip formatter={(v) => [formatInr(Number(v)), "Dividend"]} />
        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
