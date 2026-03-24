/**
 * Fetches the historical MXN → USD exchange rate for a given date
 * using the Frankfurter API (free, no API key required).
 *
 * Returns how many USD 1 MXN equals on that date,
 * and also the inverse (MXN per 1 USD) stored as exchangeRate on Product.
 */

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

/**
 * Get the exchange rate for a specific date.
 * @param date - ISO date string "YYYY-MM-DD"
 * @returns { usdPerMxn, mxnPerUsd } — both directions stored for transparency
 */
export async function getHistoricalRate(date: string): Promise<{
  usdPerMxn: number;
  mxnPerUsd: number;
}> {
  // Frankfurter uses ECB data; base=MXN, amount=1, to=USD
  const url = `https://api.frankfurter.app/${date}?from=MXN&to=USD&amount=1`;

  const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h

  if (!res.ok) {
    throw new Error(`Exchange rate lookup failed for date ${date}: ${res.statusText}`);
  }

  const data: FrankfurterResponse = await res.json();
  const usdPerMxn = data.rates["USD"];
  const mxnPerUsd = 1 / usdPerMxn;

  return { usdPerMxn, mxnPerUsd };
}

/**
 * Convert a MXN amount to USD using a known rate (usdPerMxn).
 */
export function mxnToUsd(amountMXN: number, usdPerMxn: number): number {
  return Math.round(amountMXN * usdPerMxn * 100) / 100;
}

/**
 * Format a date as YYYY-MM-DD for the Frankfurter API.
 */
export function toApiDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}
