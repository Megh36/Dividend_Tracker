"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cn, formatInr } from "@/lib/utils";

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
}

type Range = "1W" | "1M" | "3M" | "1Y";

const RANGE_DAYS: Record<Range, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "1Y": 365,
};

const RANGES: Range[] = ["1W", "1M", "3M", "1Y"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PriceChartSkeleton() {
  const barHeights = [40, 55, 48, 62, 50, 45, 58, 70, 63, 52, 67, 75, 61, 55, 72, 68, 58, 65, 71, 60];
  return (
    <div className="detail-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1.5">
          <div className="h-2.5 w-20 bg-border rounded animate-pulse" />
          <div className="h-3.5 w-14 bg-border rounded animate-pulse" />
        </div>
        <div className="h-7 w-36 bg-border rounded-lg animate-pulse" />
      </div>
      <div className="h-52 flex items-end gap-1.5 px-2">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-border-faint rounded-sm animate-pulse"
            style={{ height: `${h}%`, animationDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────

function PriceChartError({ message }: { message: string }) {
  return (
    <div className="detail-card p-5">
      <p className="text-[13px] uppercase tracking-[0.04em] text-text-muted font-sans font-semibold mb-3">Price Chart</p>
      <div className="h-52 flex flex-col items-center justify-center gap-2">
        <p className="text-text-muted text-sm">Failed to load chart data</p>
        <p className="text-text-muted/60 text-xs">{message}</p>
      </div>
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: Candle }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-background-card border border-border rounded-[8px] px-3 py-2.5 shadow-card-hover text-xs">
      <p className="text-text-muted mb-1">{formatDate(label ?? "")}</p>
      <p className="text-text-primary font-semibold tabular-nums">{formatInr(point.close)}</p>
      <div className="flex gap-3 mt-1 text-text-muted">
        <span>H: {formatInr(point.high)}</span>
        <span>L: {formatInr(point.low)}</span>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatAxisDate(dateStr: string, range: Range): string {
  const d = new Date(dateStr);
  if (range === "1W") return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (range === "1M") return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (range === "3M") return d.toLocaleDateString("en-IN", { month: "short" });
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

// ─── Chart ────────────────────────────────────────────────────────────────────

export function PriceChart({
  candles,
  loading = false,
  error,
}: {
  candles: Candle[];
  loading?: boolean;
  error?: string | null;
}) {
  const [range, setRange] = useState<Range>("3M");

  const data = useMemo(() => {
    if (!candles.length) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RANGE_DAYS[range]);
    const cutStr = cutoff.toISOString().split("T")[0];
    return candles.filter((c) => c.date >= cutStr);
  }, [candles, range]);

  const { minClose, maxClose } = useMemo(() => {
    if (!data.length) return { minClose: 0, maxClose: 0 };
    const closes = data.map((d) => d.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const pad = (max - min) * 0.05;
    return { minClose: min - pad, maxClose: max + pad };
  }, [data]);

  const periodReturn = useMemo(() => {
    if (data.length < 2) return 0;
    const first = data[0].close;
    const last = data[data.length - 1].close;
    return first > 0 ? ((last - first) / first) * 100 : 0;
  }, [data]);

  if (loading) return <PriceChartSkeleton />;
  if (error) return <PriceChartError message={error} />;

  const positive = periodReturn >= 0;
  const strokeColor = positive ? "#27AE60" : "#C0392B";

  return (
    <div className="detail-card p-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] uppercase tracking-[0.04em] text-text-muted font-sans font-semibold mb-0.5">
            Price Chart
          </p>
          {data.length >= 2 && (
            <p className={cn("text-sm font-semibold tabular-nums font-sans", positive ? "gain" : "loss")}>
              {positive ? "▲ +" : "▼ "}{periodReturn.toFixed(2)}% this period
            </p>
          )}
        </div>
        {/* Range toggles */}
        <div className="flex gap-1 bg-background-subtle border border-border rounded-lg p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-medium font-sans transition-all duration-150",
                range === r
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-52">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted text-sm">
            No data for this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#D5CFC4" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#8C877E", fontSize: 10, fontFamily: "Georgia, serif" }}
                tickFormatter={(v) => formatAxisDate(v, range)}
                interval="preserveStartEnd"
                tickCount={6}
              />
              <YAxis
                domain={[minClose, maxClose]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#8C877E", fontSize: 10 }}
                tickFormatter={(v) => `₹${Math.round(v)}`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#C4BDB1", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="close"
                stroke={strokeColor}
                strokeWidth={1.5}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r: 3, fill: strokeColor, stroke: "none" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
