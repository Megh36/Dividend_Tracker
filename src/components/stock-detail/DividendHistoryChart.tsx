"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatInr } from "@/lib/utils";

export interface DividendPoint {
  date: string;
  amount: number;
  currency: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DividendChartSkeleton() {
  const heights = [55, 60, 45, 70, 65, 50, 80, 72, 58, 68, 75, 62];
  return (
    <div className="detail-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1.5">
          <div className="h-2.5 w-36 bg-border rounded animate-pulse" />
          <div className="h-3.5 w-24 bg-border rounded animate-pulse" />
        </div>
        <div className="space-y-1.5 text-right">
          <div className="h-2.5 w-20 bg-border rounded animate-pulse" />
          <div className="h-4 w-16 bg-border rounded animate-pulse" />
        </div>
      </div>
      <div className="h-44 flex items-end gap-2 px-2">
        {heights.map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-border-faint rounded-t-sm animate-pulse"
            style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────

function DividendChartError({ message }: { message: string }) {
  return (
    <div className="detail-card p-5">
      <p className="text-[13px] uppercase tracking-[0.04em] text-text-muted font-sans font-semibold mb-3">
        Dividend History
      </p>
      <div className="h-44 flex flex-col items-center justify-center gap-2">
        <p className="text-text-muted text-sm">Failed to load dividend data</p>
        <p className="text-text-muted/60 text-xs">{message}</p>
      </div>
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background-card border border-border rounded-[8px] px-3 py-2.5 shadow-card-hover text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="text-accent font-semibold tabular-nums">
        {formatInr(payload[0].value)}
      </p>
    </div>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────

function freqLabel(n: number): string {
  if (n === 12) return "Monthly";
  if (n === 4)  return "Quarterly";
  if (n === 2)  return "Half-yearly";
  if (n === 1)  return "Annual";
  if (n > 0)    return `${n}× / year`;
  return "—";
}

export function DividendHistoryChart({
  dividends,
  trailing12M,
  frequency,
  loading = false,
  error,
}: {
  dividends: DividendPoint[];
  trailing12M: number;
  frequency: number;
  loading?: boolean;
  error?: string | null;
}) {
  const chartData = useMemo(() => {
    return dividends.map((d) => ({
      label: new Date(d.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      amount: d.amount,
      date: d.date,
    }));
  }, [dividends]);

  const avg = useMemo(() => {
    if (!dividends.length) return 0;
    return dividends.reduce((s, d) => s + d.amount, 0) / dividends.length;
  }, [dividends]);

  if (loading) return <DividendChartSkeleton />;
  if (error)   return <DividendChartError message={error} />;

  if (!dividends.length) {
    return (
      <div className="detail-card p-5">
        <p className="text-[13px] uppercase tracking-[0.04em] text-text-muted font-sans font-semibold mb-1">
          Dividend History
        </p>
        <div className="h-44 flex flex-col items-center justify-center gap-1.5">
          <p className="text-text-muted text-sm">No dividend history found</p>
          <p className="text-text-muted/60 text-xs">This stock may not pay dividends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[13px] uppercase tracking-[0.04em] text-text-muted font-sans font-semibold mb-0.5">
            Dividend History · last 5 years
          </p>
          <p className="text-[15px] font-semibold text-text-primary font-sans">
            {dividends.length} payments · {freqLabel(frequency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] uppercase tracking-[0.04em] text-text-muted font-sans mb-0.5">Trailing 12M</p>
          <p className="text-[15px] font-semibold text-accent tabular-nums font-sans">
            {formatInr(trailing12M)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#D5CFC4" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8C877E", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8C877E", fontSize: 10 }}
              tickFormatter={(v) => `₹${v}`}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(26,26,26,0.04)" }} />
            <ReferenceLine
              y={avg}
              stroke="#C0392B"
              strokeWidth={1}
              strokeDasharray="4 3"
              label={{
                value: `avg ₹${avg.toFixed(2)}`,
                fill: "#C0392B",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
            <Bar dataKey="amount" radius={[3, 3, 0, 0]} maxBarSize={32}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === chartData.length - 1 ? "#C0392B" : "#D5CFC4"}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
