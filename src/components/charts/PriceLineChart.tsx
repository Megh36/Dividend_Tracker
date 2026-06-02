"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "@/types";
import { toInr, formatInr } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface Props {
  data: ChartDataPoint[];
  currency: string;
  exchangeRate: number;
}

export function PriceLineChart({ data, currency, exchangeRate }: Props) {
  const formatted = data.map((d) => ({
    label: format(parseISO(d.date), "MMM yy"),
    price: toInr(d.price ?? 0, currency, exchangeRate),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={formatted} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `₹${v.toFixed(0)}`}
          domain={["auto", "auto"]}
        />
        <Tooltip formatter={(v) => [formatInr(Number(v)), "Price"]} />
        <Line
          type="monotone"
          dataKey="price"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
