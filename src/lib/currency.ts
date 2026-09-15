/** Bangladeshi Taka formatting helpers — single source of truth for currency display. */
export const CURRENCY_SYMBOL = "৳";

export function formatTaka(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${CURRENCY_SYMBOL}${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}
