"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Stock } from "@/types";
import { formatInr, formatPercent, formatDate, toInr, cn } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio";

interface Props {
  stocks: Stock[];
  exchangeRate: number;
}

export function StockTable({ stocks, exchangeRate }: Props) {
  const removeStock = usePortfolioStore((s) => s.removeStock);

  if (stocks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No stocks in portfolio. Add one above.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Price (₹)</TableHead>
          <TableHead>Change</TableHead>
          <TableHead>Shares</TableHead>
          <TableHead>Value (₹)</TableHead>
          <TableHead>Yield</TableHead>
          <TableHead>Annual Income (₹)</TableHead>
          <TableHead>Ex-Date</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.map((stock) => (
          <TableRow key={stock.symbol}>
            <TableCell>
              <Link
                href={`/stock/${stock.symbol}`}
                className="font-semibold hover:underline"
              >
                {stock.symbol}
              </Link>
              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                {stock.name}
              </p>
            </TableCell>
            <TableCell>
              {formatInr(toInr(stock.price, stock.currency, exchangeRate))}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  stock.changePercent >= 0
                    ? "text-green-600 border-green-200 bg-green-50"
                    : "text-red-600 border-red-200 bg-red-50"
                )}
              >
                {formatPercent(stock.changePercent)}
              </Badge>
            </TableCell>
            <TableCell>{stock.shares}</TableCell>
            <TableCell>
              {formatInr(toInr(stock.price * stock.shares, stock.currency, exchangeRate))}
            </TableCell>
            <TableCell>{stock.dividendYield.toFixed(2)}%</TableCell>
            <TableCell>
              {formatInr(toInr(stock.annualDividend * stock.shares, stock.currency, exchangeRate))}
            </TableCell>
            <TableCell>{formatDate(stock.exDividendDate)}</TableCell>
            <TableCell>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeStock(stock.symbol)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
