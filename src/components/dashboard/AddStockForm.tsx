"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio";
import { Stock } from "@/types";

interface SearchResult {
  symbol: string;
  shortname: string;
  exchDisp: string;
}

export function AddStockForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [shares, setShares] = useState("1");
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const addStock = usePortfolioStore((s) => s.addStock);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query || selected) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setOpen(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [query, selected]);

  async function handleAdd() {
    if (!selected) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/stock/${selected.symbol}`);
      if (!res.ok) return;
      const quote = await res.json();

      const stock: Stock = {
        symbol: quote.symbol,
        name: quote.shortName,
        currency: quote.currency ?? "USD",
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        dividendYield: (quote.trailingAnnualDividendYield ?? 0) * 100,
        annualDividend: quote.trailingAnnualDividendRate ?? 0,
        exDividendDate: quote.exDividendDate
          ? new Date(quote.exDividendDate * 1000).toISOString().split("T")[0]
          : null,
        paymentDate: quote.dividendDate
          ? new Date(quote.dividendDate * 1000).toISOString().split("T")[0]
          : null,
        sector: quote.sectorDisp ?? "Unknown",
        shares: Number(shares) || 1,
      };

      addStock(stock);
      setQuery("");
      setSelected(null);
      setShares("1");
      setResults([]);
      setOpen(false);
    } finally {
      setAdding(false);
    }
  }

  const showDropdown = open && !selected && (searching || results.length > 0);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div ref={containerRef} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search ticker or company…"
          className="pl-9"
          value={selected ? `${selected.symbol} — ${selected.shortname}` : query}
          onChange={(e) => {
            setSelected(null);
            setQuery(e.target.value);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
        />
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border border-border bg-white shadow-lg">
            {searching && (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Searching…
              </div>
            )}
            {results.map((r) => (
              <button
                key={r.symbol}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSelected(r);
                  setOpen(false);
                  setResults([]);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent cursor-pointer"
              >
                <span className="font-semibold">{r.symbol}</span>
                <span className="ml-2 text-muted-foreground">{r.shortname}</span>
                {r.exchDisp && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    · {r.exchDisp}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <Input
        type="number"
        min={1}
        placeholder="Shares"
        value={shares}
        onChange={(e) => setShares(e.target.value)}
        className="w-24"
      />
      <Button onClick={handleAdd} disabled={!selected || adding}>
        {adding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Add
      </Button>
    </div>
  );
}
