import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dividend Tracker",
  description: "NSE high-dividend stock watchlist",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="min-h-screen font-sans antialiased bg-background text-text-primary">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-4 w-0.5 bg-accent" />
              <span className="text-sm font-bold tracking-wide text-text-primary font-display">
                Dividend Tracker
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted font-mono">
              <span>NSE · Live</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
