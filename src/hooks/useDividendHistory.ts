"use client";

import { useState, useEffect } from "react";
import { DividendHistory } from "@/types";

export function useDividendHistory(symbol: string, years = 5) {
  const [data, setData] = useState<DividendHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    fetch(`/api/stock/${symbol}/dividends?years=${years}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [symbol, years]);

  return { data, loading };
}
