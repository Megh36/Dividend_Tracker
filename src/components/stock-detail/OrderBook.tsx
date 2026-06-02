"use client";

import { useMemo } from "react";
import { formatInr } from "@/lib/utils";

function pseudoRand(seed: number, i: number): number {
  const x = Math.sin(seed * 9301 + i * 49297 + 233) * 1e9;
  return x - Math.floor(x);
}

function generateLevels(
  price: number,
  side: "bid" | "ask",
  count: number
): { price: number; qty: number; total: number }[] {
  const levels = [];
  let cumQty = 0;
  for (let i = 0; i < count; i++) {
    const r = pseudoRand(Math.round(price), i + (side === "ask" ? 100 : 0));
    const spread = (0.0005 + i * 0.0008 + r * 0.0006) * price;
    const lvlPrice =
      side === "ask"
        ? price + (i + 1) * spread * 0.6
        : price - (i + 1) * spread * 0.6;
    const baseVol = Math.round(10000 / (i + 1));
    const qty = Math.max(100, Math.round(baseVol * (0.7 + r * 0.6)));
    cumQty += qty;
    levels.push({ price: parseFloat(lvlPrice.toFixed(2)), qty, total: cumQty });
  }
  return levels;
}

function BookRow({
  price,
  qty,
  total,
  maxTotal,
  side,
}: {
  price: number;
  qty: number;
  total: number;
  maxTotal: number;
  side: "bid" | "ask";
}) {
  const pct = (total / maxTotal) * 100;
  return (
    <div className="relative flex items-center justify-between text-[14px] min-h-[36px] px-2 rounded overflow-hidden">
      <div
        className={`absolute inset-y-0 ${side === "bid" ? "left-0" : "right-0"} rounded`}
        style={{
          width: `${pct}%`,
          backgroundColor: side === "bid" ? "rgba(39,174,96,0.12)" : "rgba(192,57,43,0.10)",
        }}
      />
      <span className={`relative font-mono font-semibold tabular-nums ${side === "bid" ? "gain" : "loss"}`}>
        {formatInr(price)}
      </span>
      <span className="relative text-text-muted tabular-nums font-mono">{qty.toLocaleString("en-IN")}</span>
      <span className="relative text-text-muted/60 tabular-nums font-mono">{total.toLocaleString("en-IN")}</span>
    </div>
  );
}

export function OrderBook({ price }: { price: number }) {
  const asks = useMemo(() => generateLevels(price, "ask", 5), [price]);
  const bids = useMemo(() => generateLevels(price, "bid", 5), [price]);

  const maxBidTotal = bids[bids.length - 1]?.total ?? 1;
  const maxAskTotal = asks[asks.length - 1]?.total ?? 1;

  const spread = asks[0] ? asks[0].price - bids[0].price : 0;
  const spreadPct = price > 0 ? (spread / price) * 100 : 0;

  return (
    <div className="detail-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] uppercase tracking-[0.04em] text-text-muted font-sans font-semibold">
          Order Book
        </p>
        <span className="text-[13px] text-text-muted font-mono">
          Spread: {formatInr(spread)} ({spreadPct.toFixed(3)}%)
        </span>
      </div>

      <div className="flex justify-between text-[12px] uppercase tracking-[0.04em] text-text-muted font-sans px-2 mb-1">
        <span>Price</span>
        <span>Qty</span>
        <span>Total</span>
      </div>

      <div className="space-y-0.5 mb-1">
        {[...asks].reverse().map((a, i) => (
          <BookRow key={i} {...a} maxTotal={maxAskTotal} side="ask" />
        ))}
      </div>

      <div className="flex items-center justify-center py-2 my-1 bg-background-subtle rounded-[6px] border border-border-faint">
        <span className="text-[15px] font-semibold text-text-primary tabular-nums font-mono">
          {formatInr(price)}
        </span>
        <span className="text-[13px] text-text-muted ml-2 font-sans">LTP</span>
      </div>

      <div className="space-y-0.5 mt-1">
        {bids.map((b, i) => (
          <BookRow key={i} {...b} maxTotal={maxBidTotal} side="bid" />
        ))}
      </div>

      <p className="text-[12px] text-text-muted/50 text-center mt-3 font-sans">
        Simulated order book · for illustrative purposes only
      </p>
    </div>
  );
}
