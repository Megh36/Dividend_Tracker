export interface AlertStock {
  symbol: string;
  name: string;
  exDate: string;
  daysToEx: number;
  divYield: number;
  price: number;
}

function formatExDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function todayString(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function badgeBg(daysToEx: number): string {
  return daysToEx <= 7 ? "#C0392B" : "#E67E22";
}

export function buildAlertEmail(stocks: AlertStock[]): string {
  const rows = stocks
    .map((s) => {
      const ticker = s.symbol.replace(/\.(NS|BO)$/, "");
      const bg = badgeBg(s.daysToEx);
      const yieldStr = (s.divYield * 100).toFixed(2) + "%";
      const exDateStr = formatExDate(s.exDate);

      return `
        <tr>
          <td style="padding: 16px 24px; border-bottom: 0.5px solid #D5CFC4;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align: top;">
                  <div style="font-size: 18px; font-weight: bold; color: #C0392B; font-family: Georgia, serif;">${ticker}</div>
                  <div style="font-size: 13px; color: #8C877E; font-family: Georgia, serif; margin-top: 3px;">${s.name}</div>
                </td>
                <td style="vertical-align: top; text-align: right;">
                  <span style="display: inline-block; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.04em; color: #fff; background: ${bg}; padding: 3px 8px; border-radius: 4px; font-family: Georgia, serif;">BUY BEFORE ${exDateStr}</span>
                  <div style="font-size: 13px; color: #1A1A1A; font-family: Georgia, serif; margin-top: 5px;">Yield: ${yieldStr}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join("\n");

  const n = stocks.length;
  const countLabel = `${n} stock${n === 1 ? "" : "s"} need${n === 1 ? "s" : ""} action this week`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; background: #F7F5F0;">
  <center>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F7F5F0;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; font-family: Georgia, serif;">

            <tr>
              <td style="background: #1A1A1A; padding: 24px; border-radius: 6px 6px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="color: #fff; font-size: 22px; font-weight: bold; font-family: Georgia, serif;">Dividend Tracker</td>
                    <td style="color: #8C877E; font-size: 13px; text-align: right; font-family: Georgia, serif;">Weekly Alert</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 16px 24px; font-size: 13px; color: #8C877E; font-family: Georgia, serif; border-bottom: 0.5px solid #D5CFC4;">${todayString()}</td>
            </tr>

            ${rows}

            <tr>
              <td style="background: #EDE9E0; padding: 16px 24px;">
                <span style="font-size: 15px; font-weight: bold; color: #1A1A1A; font-family: Georgia, serif;">${countLabel}</span>
              </td>
            </tr>

            <tr>
              <td style="padding: 20px 24px; font-size: 13px; color: #8C877E; text-align: center; font-family: Georgia, serif;">
                You're receiving this every Monday at 8am IST
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}
