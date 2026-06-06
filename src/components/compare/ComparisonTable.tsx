"use client";

import { useEffect, useState } from "react";
import { cn, formatInr, formatMarketCap } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompareStock {
  symbol: string;
  name: string;
  sector: string | null;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number | null;
  peRatio: number | null;
  eps: number | null;
  priceToBook: number | null;
  revenue: number | null;
  profitMargin: number | null;
  returnOnEquity: number | null;
  debtEquity: number | null;
  week52High: number | null;
  week52Low: number | null;
  divYield: number | null;
  divPerShare: number | null;
  exDate: string | null;
  daysToEx: number | null;
  payoutRatio: number | null;
  divFrequency: string | null;
  fiveYearAvgYield: number | null;
}

export interface ComparisonTableProps {
  symbols: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findBest(vals: (number | null)[], dir: "higher" | "lower"): number {
  let idx = -1;
  let best = dir === "higher" ? -Infinity : Infinity;
  vals.forEach((v, i) => {
    if (v == null) return;
    if (dir === "higher" ? v > best : v < best) { best = v; idx = i; }
  });
  return idx;
}

function findWorst(vals: (number | null)[], dir: "higher" | "lower"): number {
  return findBest(vals, dir === "higher" ? "lower" : "higher");
}

function pct(v: number | null, isDecimal = false): string {
  if (v == null) return "—";
  return `${(isDecimal ? v * 100 : v).toFixed(2)}%`;
}

function pct1(v: number | null, isDecimal = false): string {
  if (v == null) return "—";
  return `${(isDecimal ? v * 100 : v).toFixed(1)}%`;
}

function num(v: number | null, dec = 1): string {
  if (v == null) return "—";
  return v.toFixed(dec);
}

// ─── Row definitions ──────────────────────────────────────────────────────────

type RowDef =
  | { kind: "group"; label: string }
  | {
      kind: "metric";
      label: string;
      getValue: (s: CompareStock) => number | null;
      render: (s: CompareStock) => string;
      best: "higher" | "lower" | null;
    }
  | { kind: "exdate" }
  | { kind: "daystoex" };

const ROWS: RowDef[] = [
  { kind: "group", label: "Price & Market" },
  {
    kind: "metric", label: "Current Price",
    getValue: () => null,
    render: (s) => formatInr(s.price),
    best: null,
  },
  {
    kind: "metric", label: "% Change Today",
    getValue: (s) => s.changePercent,
    render: (s) => {
      const pos = s.changePercent >= 0;
      return `${pos ? "+" : ""}${s.changePercent.toFixed(2)}%`;
    },
    best: "higher",
  },
  {
    kind: "metric", label: "Market Cap",
    getValue: (s) => s.marketCap,
    render: (s) => formatMarketCap(s.marketCap, "INR"),
    best: "higher",
  },
  {
    kind: "metric", label: "52W High",
    getValue: (s) => s.week52High,
    render: (s) => s.week52High != null ? formatInr(s.week52High) : "—",
    best: "higher",
  },
  {
    kind: "metric", label: "52W Low",
    getValue: (s) => s.price != null && s.week52Low != null ? s.price - s.week52Low : null,
    render: (s) => s.week52Low != null ? formatInr(s.week52Low) : "—",
    best: "lower",
  },

  { kind: "group", label: "Dividend" },
  {
    kind: "metric", label: "Yield %",
    getValue: (s) => s.divYield,
    render: (s) => pct(s.divYield != null ? s.divYield * 100 : null),
    best: "higher",
  },
  {
    kind: "metric", label: "Div Per Share",
    getValue: (s) => s.divPerShare,
    render: (s) => s.divPerShare != null ? formatInr(s.divPerShare) : "—",
    best: "higher",
  },
  { kind: "exdate" },
  { kind: "daystoex" },
  {
    kind: "metric", label: "Payout Ratio",
    getValue: (s) => s.payoutRatio,
    render: (s) => pct1(s.payoutRatio != null ? s.payoutRatio * 100 : null),
    best: "lower",
  },
  {
    kind: "metric", label: "Frequency",
    getValue: () => null,
    render: (s) => s.divFrequency ?? "—",
    best: null,
  },
  {
    kind: "metric", label: "5yr Avg Yield",
    getValue: (s) => s.fiveYearAvgYield,
    render: (s) => s.fiveYearAvgYield != null ? `${s.fiveYearAvgYield.toFixed(2)}%` : "—",
    best: "higher",
  },

  { kind: "group", label: "Fundamentals" },
  {
    kind: "metric", label: "P/E Ratio",
    getValue: (s) => s.peRatio,
    render: (s) => num(s.peRatio),
    best: "lower",
  },
  {
    kind: "metric", label: "EPS",
    getValue: (s) => s.eps,
    render: (s) => s.eps != null ? formatInr(s.eps) : "—",
    best: "higher",
  },
  {
    kind: "metric", label: "Price / Book",
    getValue: (s) => s.priceToBook,
    render: (s) => num(s.priceToBook, 2),
    best: "lower",
  },
  {
    kind: "metric", label: "Revenue",
    getValue: (s) => s.revenue,
    render: (s) => formatMarketCap(s.revenue, "INR"),
    best: "higher",
  },
  {
    kind: "metric", label: "Profit Margin",
    getValue: (s) => s.profitMargin,
    render: (s) => pct1(s.profitMargin != null ? s.profitMargin * 100 : null),
    best: "higher",
  },
  {
    kind: "metric", label: "Return on Equity",
    getValue: (s) => s.returnOnEquity,
    render: (s) => pct1(s.returnOnEquity != null ? s.returnOnEquity * 100 : null),
    best: "higher",
  },
  {
    kind: "metric", label: "Debt / Equity",
    getValue: (s) => s.debtEquity,
    render: (s) => num(s.debtEquity),
    best: "lower",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function GroupHead({ label, span }: { label: string; span: number }) {
  return (
    <tr>
      <td
        colSpan={span}
        className="px-5 py-2 text-[11px] uppercase tracking-[0.1em] font-semibold text-text-muted font-sans"
        style={{ background: "#EDE9E0" }}
      >
        {label}
      </td>
    </tr>
  );
}

type Highlight = "best" | "worst" | null;

function cellStyle(h: Highlight): React.CSSProperties {
  if (h === "best")  return { background: "#EAF5EE" };
  if (h === "worst") return { background: "#FDF0EF" };
  return {};
}

function cellTextClass(h: Highlight): string {
  if (h === "best")  return "font-bold text-[#27AE60]";
  if (h === "worst") return "text-[#C0392B]";
  return "text-text-primary";
}

function SkeletonCell({ isLabel = false }: { isLabel?: boolean }) {
  return (
    <td className={cn("px-5 py-3", isLabel ? "" : "text-center")}>
      <div
        className={cn(
          "h-4 bg-border-faint rounded animate-pulse",
          isLabel ? "w-28" : "w-16 mx-auto"
        )}
      />
    </td>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ComparisonTable({ symbols }: ComparisonTableProps) {
  const [stocks, setStocks] = useState<(CompareStock | null)[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    if (!symbols.length) return;
    setLoading(true);
    setError(null);
    setStocks(null);
    fetch(`/api/compare?symbols=${encodeURIComponent(symbolsKey)}`)
      .then((r) => r.json())
      .then((d) => {
        setStocks(d as (CompareStock | null)[]);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? "Failed to load");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey]);

  if (!symbols.length) return null;

  const n = symbols.length;
  const span = n + 1;
  const datas = stocks ?? symbols.map(() => null);

  // Render a single metric row with best/worst highlighting
  function MetricDataRow(
    rowDef: Extract<RowDef, { kind: "metric" }>,
    rowIndex: number
  ) {
    const evenRow = rowIndex % 2 === 0;
    const rowBg = evenRow ? "#ffffff" : "#F7F5F0";

    let bestI = -1;
    let worstI = -1;

    if (!loading && rowDef.best) {
      const vals = datas.map((d) => (d ? rowDef.getValue(d) : null));
      bestI  = findBest(vals, rowDef.best);
      worstI = findWorst(vals, rowDef.best);
      // Don't mark best/worst if they're the same cell (e.g., only one valid value)
      if (bestI === worstI) { bestI = -1; worstI = -1; }
    }

    return (
      <tr key={rowDef.label} style={{ background: rowBg }}>
        <td className="px-5 py-3 text-[13px] text-text-muted font-sans whitespace-nowrap border-b border-border-faint">
          {rowDef.label}
        </td>
        {loading
          ? Array.from({ length: n }).map((_, i) => <SkeletonCell key={i} />)
          : datas.map((d, i) => {
              const h: Highlight = i === bestI ? "best" : i === worstI ? "worst" : null;
              return (
                <td
                  key={i}
                  className={cn(
                    "px-5 py-3 text-[14px] tabular-nums text-center font-sans border-b border-border-faint",
                    cellTextClass(h)
                  )}
                  style={cellStyle(h)}
                >
                  {d ? rowDef.render(d) : "—"}
                </td>
              );
            })}
      </tr>
    );
  }

  // Ex-Date row
  function ExDateRow(rowIndex: number) {
    const evenRow = rowIndex % 2 === 0;
    const rowBg = evenRow ? "#ffffff" : "#F7F5F0";
    return (
      <tr key="exdate" style={{ background: rowBg }}>
        <td className="px-5 py-3 text-[13px] text-text-muted font-sans whitespace-nowrap border-b border-border-faint">
          Ex-Date
        </td>
        {loading
          ? Array.from({ length: n }).map((_, i) => <SkeletonCell key={i} />)
          : datas.map((d, i) => {
              const dateStr = d?.exDate
                ? new Date(d.exDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "2-digit",
                  })
                : null;
              return (
                <td key={i} className="px-5 py-3 text-[14px] text-center font-sans border-b border-border-faint text-text-primary font-semibold tabular-nums">
                  {dateStr ?? "—"}
                </td>
              );
            })}
      </tr>
    );
  }

  // Days-to-Ex row with urgency badges
  function DaysToExRow(rowIndex: number) {
    const evenRow = rowIndex % 2 === 0;
    const rowBg = evenRow ? "#ffffff" : "#F7F5F0";

    let bestI = -1;
    let worstI = -1;

    if (!loading) {
      const vals = datas.map((d) =>
        d?.daysToEx != null && d.daysToEx >= 0 ? d.daysToEx : null
      );
      bestI  = findBest(vals, "lower");
      worstI = findWorst(vals, "lower");
      if (bestI === worstI) { bestI = -1; worstI = -1; }
    }

    return (
      <tr key="daystoex" style={{ background: rowBg }}>
        <td className="px-5 py-3 text-[13px] text-text-muted font-sans whitespace-nowrap border-b border-border-faint">
          Days to Ex-Date
        </td>
        {loading
          ? Array.from({ length: n }).map((_, i) => <SkeletonCell key={i} />)
          : datas.map((d, i) => {
              const days = d?.daysToEx;
              const h: Highlight = i === bestI ? "best" : i === worstI ? "worst" : null;

              const badgeClass =
                days == null || days < 0 ? "badge-passed"
                : days <= 7             ? "badge-urgent"
                : days <= 14            ? "badge-warning"
                :                         "badge-safe";

              return (
                <td
                  key={i}
                  className="px-5 py-3 text-center border-b border-border-faint"
                  style={cellStyle(h)}
                >
                  {days != null && days >= 0 ? (
                    <span className={`text-[12px] px-2.5 py-0.5 rounded-full font-semibold font-sans ${badgeClass}`}>
                      {days === 0 ? "Today" : `${days}d`}
                    </span>
                  ) : (
                    <span className="text-[14px] text-text-muted font-sans">—</span>
                  )}
                </td>
              );
            })}
      </tr>
    );
  }

  if (!loading && error) {
    return (
      <div className="detail-card p-8 text-center">
        <p className="text-text-muted text-sm">Failed to load comparison data</p>
        <p className="text-text-muted/60 text-xs mt-1">{error}</p>
      </div>
    );
  }

  let metricRowIndex = 0;

  return (
    <div className="detail-card overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse"
          style={{ minWidth: `${200 + n * 190}px` }}
        >
          <colgroup>
            <col style={{ width: "200px" }} />
            {symbols.map((_, i) => <col key={i} />)}
          </colgroup>

          {/* ── Stock header row ──────────────────────────────────────── */}
          <thead>
            <tr style={{ background: "#EDE9E0" }}>
              <th className="px-5 py-4 text-left align-bottom border-b border-border font-normal">
                <span className="text-[11px] uppercase tracking-[0.08em] text-text-muted font-sans font-semibold">
                  Metric
                </span>
              </th>
              {loading
                ? symbols.map((sym, i) => (
                    <th key={i} className="px-5 py-4 border-b border-border text-center font-normal">
                      <div className="animate-pulse space-y-2">
                        <div className="h-5 w-20 bg-border rounded mx-auto" />
                        <div className="h-3 w-28 bg-border-faint rounded mx-auto" />
                        <div className="h-7 w-24 bg-border rounded mx-auto" />
                        <div className="h-3 w-14 bg-border-faint rounded mx-auto" />
                      </div>
                      <p className="text-[11px] text-text-muted/60 mt-1 font-sans">{sym}</p>
                    </th>
                  ))
                : datas.map((d, i) => {
                    if (!d) {
                      return (
                        <th key={i} className="px-5 py-4 border-b border-border text-center font-normal">
                          <p className="text-text-muted text-sm">{symbols[i]}</p>
                          <p className="text-[11px] text-[#C0392B] font-sans mt-1">Failed to load</p>
                        </th>
                      );
                    }
                    const ticker = d.symbol.replace(/\.(NS|BO)$/, "");
                    const pos = d.changePercent >= 0;
                    return (
                      <th key={i} className="px-5 py-4 border-b border-border text-center font-normal align-top">
                        <p className="text-[18px] font-bold text-[#C0392B] font-display leading-none">
                          {ticker}
                        </p>
                        <p className="text-[12px] text-[#8C877E] font-sans mt-1 leading-tight">
                          {d.name}
                        </p>
                        {d.sector && (
                          <span className="inline-block mt-1.5 text-[10px] bg-[#D5CFC4] text-[#555248] rounded-full px-2 py-0.5 font-sans">
                            {d.sector}
                          </span>
                        )}
                        <p className="text-[22px] font-bold text-text-primary tabular-nums font-display mt-2 leading-none">
                          {formatInr(d.price)}
                        </p>
                        <p className={cn("text-[12px] font-semibold tabular-nums font-sans mt-1", pos ? "gain" : "loss")}>
                          {pos ? "▲ +" : "▼ "}{d.changePercent.toFixed(2)}%
                        </p>
                      </th>
                    );
                  })}
            </tr>
          </thead>

          {/* ── Data rows ─────────────────────────────────────────────── */}
          <tbody>
            {ROWS.map((row) => {
              if (row.kind === "group") {
                return <GroupHead key={row.label} label={row.label} span={span} />;
              }
              if (row.kind === "exdate") {
                return ExDateRow(metricRowIndex++);
              }
              if (row.kind === "daystoex") {
                return DaysToExRow(metricRowIndex++);
              }
              return MetricDataRow(row, metricRowIndex++);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
