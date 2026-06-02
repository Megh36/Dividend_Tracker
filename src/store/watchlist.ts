import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WatchlistState {
  saved: string[];
  toggle: (symbol: string) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      saved: [],
      toggle: (symbol) =>
        set((s) => ({
          saved: s.saved.includes(symbol)
            ? s.saved.filter((x) => x !== symbol)
            : [...s.saved, symbol],
        })),
    }),
    { name: "dividend-watchlist" }
  )
);
