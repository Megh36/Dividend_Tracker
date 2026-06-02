export interface Stock {
  symbol: string;
  name: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  dividendYield: number;
  annualDividend: number;
  exDividendDate: string | null;
  paymentDate: string | null;
  sector: string;
  shares: number;
}

export interface DividendHistory {
  date: string;
  amount: number;
  currency: string;
  type: "regular" | "special";
}

export interface PortfolioSummary {
  totalValueInr: number;
  totalAnnualIncomeInr: number;
  avgYield: number;
  nextPaymentInr: number;
  nextPaymentDate: string | null;
}

export interface StockQuote {
  symbol: string;
  shortName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  trailingAnnualDividendRate: number;
  trailingAnnualDividendYield: number;
  dividendDate?: number;
  exDividendDate?: number;
  sectorDisp?: string;
}

export interface ChartDataPoint {
  date: string;
  amount: number;
  price?: number;
}
