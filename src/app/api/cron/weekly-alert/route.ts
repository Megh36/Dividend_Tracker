/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildAlertEmail } from "@/lib/email-template";

const WATCHLIST = [
  "INFY.NS", "HDFCBANK.NS", "COALINDIA.NS", "POWERGRID.NS",
  "HINDZINC.NS", "ITC.NS", "ONGC.NS", "TCS.NS",
  "BAJFINANCE.NS", "NESTLEIND.NS", "BRITANNIA.NS", "SBIN.NS",
];

function daysToEx(exDate: string | null): number | null {
  if (!exDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ex = new Date(exDate);
  ex.setHours(0, 0, 0, 0);
  return Math.round((ex.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function todayDateString(): string {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function runAlert() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const results = await Promise.allSettled(
    WATCHLIST.map((symbol) =>
      fetch(`${baseUrl}/api/stock/${symbol}`).then((r) => r.json())
    )
  );

  const urgentStocks = results
    .filter(
      (r): r is PromiseFulfilledResult<any> =>
        r.status === "fulfilled" && !r.value.error
    )
    .map((r) => {
      const d = r.value;
      const days = daysToEx(d.exDividendDate as string | null) ?? -1;
      return {
        symbol: d.symbol as string,
        name: (d.shortName ?? d.symbol) as string,
        exDate: (d.exDividendDate ?? "") as string,
        daysToEx: days,
        divYield: (d.trailingAnnualDividendYield ?? 0) as number,
        price: (d.regularMarketPrice ?? 0) as number,
      };
    })
    .filter((s) => s.daysToEx >= 0 && s.daysToEx <= 14)
    .sort((a, b) => a.daysToEx - b.daysToEx);

  const dateStr = todayDateString();

  if (urgentStocks.length === 0) {
    await resend.emails.send({
      from: "Dividend Tracker <onboarding@resend.dev>",
      to: process.env.ALERT_EMAIL!,
      subject: `📅 Dividend Tracker — week of ${dateStr}`,
      html: `<p style="font-family: Georgia, serif; font-size: 15px; color: #1A1A1A; padding: 24px;">No urgent ex-dates this week. Enjoy the weekend.</p>`,
    });
    return { sent: true, count: 0 };
  }

  const html = buildAlertEmail(urgentStocks);
  const subject = `📅 ${urgentStocks.length} dividend ex-date${urgentStocks.length === 1 ? "" : "s"} coming up — week of ${dateStr}`;

  await resend.emails.send({
    from: "Dividend Tracker <onboarding@resend.dev>",
    to: process.env.ALERT_EMAIL!,
    subject,
    html,
  });

  return { sent: true, count: urgentStocks.length };
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }
  try {
    const result = await runAlert();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runAlert();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
