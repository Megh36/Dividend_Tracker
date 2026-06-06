# 📈 Dividend Tracker

**🔗 Live:** [dividend-tracker-rkqg.vercel.app](https://dividend-tracker-rkqg.vercel.app)

A real-time NSE dividend tracker built with Next.js 14 — track high-dividend stocks, monitor ex-dates, compare stocks, and get weekly email alerts every Monday.

---

## ✨ Features

- **Live Stock Data** — Fetches real-time NSE stock prices and dividend info via `yahoo-finance2`
- **Ex-Date Monitoring** — Track upcoming ex-dividend dates so you never miss a payout
- **Stock Comparison** — Side-by-side comparison table for dividend yield, payout history, and more
- **Weekly Email Alerts** — Automated Monday morning alerts via Resend + Vercel Cron for stocks nearing their ex-date
- **Interactive Charts** — Dividend history and yield trends powered by Recharts
- **Clean UI** — Built with Tailwind CSS and shadcn/ui components

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Stock Data | yahoo-finance2 |
| Charts | Recharts |
| Email | Resend |
| Cron Jobs | Vercel Cron |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Resend](https://resend.com) account for email alerts
- A Vercel account for deployment

### Installation

```bash
# Clone the repository
git clone https://github.com/Megh36/Dividend_Tracker.git
cd Dividend_Tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Resend API Key (for weekly email alerts)
RESEND_API_KEY=your_resend_api_key

# Cron job secret (for securing the cron endpoint)
CRON_SECRET=your_cron_secret

# Alert recipient email
ALERT_EMAIL=your@email.com
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📬 Weekly Email Alerts

Alerts are sent every **Monday at 8:00 AM** via Vercel Cron. The cron job hits the `/api/cron/weekly-alert` endpoint which:

1. Fetches all tracked stocks
2. Filters for stocks with ex-dates within the next 7 days
3. Sends a summary email via Resend

To configure the cron schedule, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-alert",
      "schedule": "0 8 * * 1"
    }
  ]
}
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── cron/
│   │       └── weekly-alert/   # Cron job endpoint
│   └── page.tsx                # Main dashboard
├── components/
│   ├── compare/
│   │   └── ComparisonTable.tsx # Stock comparison UI
│   └── ...
└── lib/
    └── ...                     # Utilities and helpers
```

---

## 🌐 Deployment

This project is live at **[dividend-tracker-rkqg.vercel.app](https://dividend-tracker-rkqg.vercel.app)**. Every push to `main` triggers an automatic deployment.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Megh36/Dividend_Tracker)

---

## 📄 License

MIT — feel free to fork and adapt for your own stock tracking needs.

---

Built by [Megh36](https://github.com/Megh36)
