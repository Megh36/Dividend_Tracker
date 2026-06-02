import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Stock } from "@/types";

interface PortfolioState {
  stocks: Stock[];
  exchangeRate: number; // USD → INR, fallback 84
  setExchangeRate: (rate: number) => void;
  addStock: (stock: Stock) => void;
  removeStock: (symbol: string) => void;
  updateShares: (symbol: string, shares: number) => void;
  updatePrice: (symbol: string, price: number, change: number, changePercent: number) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      stocks: [],
      exchangeRate: 84,

      setExchangeRate: (rate) => set({ exchangeRate: rate }),

      addStock: (stock) =>
        set((state) => {
          const exists = state.stocks.find((s) => s.symbol === stock.symbol);
          if (exists) return state;
          return { stocks: [...state.stocks, stock] };
        }),

      removeStock: (symbol) =>
        set((state) => ({
          stocks: state.stocks.filter((s) => s.symbol !== symbol),
        })),

      updateShares: (symbol, shares) =>
        set((state) => ({
          stocks: state.stocks.map((s) =>
            s.symbol === symbol ? { ...s, shares } : s
          ),
        })),

      updatePrice: (symbol, price, change, changePercent) =>
        set((state) => ({
          stocks: state.stocks.map((s) =>
            s.symbol === symbol ? { ...s, price, change, changePercent } : s
          ),
        })),
    }),
    { name: "dividend-portfolio" }
  )
);
