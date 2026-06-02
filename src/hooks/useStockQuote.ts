"use client";

import { useState, useEffect } from "react";
import { StockQuote } from "@/types";

export function useStockQuote(symbol: string) {
  const [data, setData] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);

    fetch(`/api/stock/${symbol}`)
      .then((r) => {
        if (!r.ok) throw new Error("Symbol not found");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  return { data, loading, error };
}
