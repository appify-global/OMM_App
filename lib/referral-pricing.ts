/**
 * Referral fee percentage applies to the **selling agent’s commission** (or agreed referral pool
 * — same numeric base once authority is wired), **not** to the sale price directly.
 *
 * Until an authority provides the real commission, we **illustrate** total commission as
 * `price guide × assumed commission % of sale`, then referral $ = `referral % × that pool`.
 */

/** Stand-in for gross commission % of sale when authority data is not available. */
export const ILLUSTRATIVE_COMMISSION_OF_SALE_PCT = 2.5;

/** Parse formatted field e.g. "$850,000" → whole dollars. */
export function parseFormattedAudWholeDollars(display: string): number | null {
  const digits = display.replace(/\D/g, '');
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}

const MAX_SUGGESTION_AUD = 99_000_000;
const MIN_DIGITS_FOR_PRICE_SUGGEST = 4;

/**
 * Whole-dollar completions while typing (e.g. digits `123042` → `$1,230,420` via ×10).
 * Returns sorted unique values, capped for UI (typical listing prices).
 */
export function suggestAudCompletionsFromDisplay(display: string): number[] {
  const digits = display.replace(/\D/g, '');
  if (digits.length < MIN_DIGITS_FOR_PRICE_SUGGEST) return [];
  const n = Number.parseInt(digits, 10);
  if (!Number.isFinite(n) || n <= 0) return [];

  const raw: number[] = [];
  const current = parseFormattedAudWholeDollars(display);
  for (const m of [10, 100, 1000] as const) {
    const v = n * m;
    if (v > 0 && v <= MAX_SUGGESTION_AUD && v !== n && v !== current) raw.push(v);
  }

  return [...new Set(raw)].sort((a, b) => a - b).slice(0, 4);
}

export type PriceGuideRange = { lowAud: number; highAud: number };

export function resolvePriceGuideRange(
  fromAud: number | null,
  toAud: number | null,
): PriceGuideRange | null {
  if (fromAud == null && toAud == null) return null;
  if (fromAud != null && toAud != null) {
    return { lowAud: Math.min(fromAud, toAud), highAud: Math.max(fromAud, toAud) };
  }
  const v = (fromAud ?? toAud) as number;
  return { lowAud: v, highAud: v };
}

export function formatAudWhole(amountAud: number): string {
  return `$${Math.round(amountAud).toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
}

/** Compact headline for sold strips (e.g. `$1.85M`, `$850k`). Whole AUD input. */
export function formatSoldPriceCompactWholeAud(amountAud: number): string {
  const n = Math.round(Math.abs(amountAud));
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    const s = new Intl.NumberFormat('en-AU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(m);
    return `$${s}M`;
  }
  if (n >= 1000) {
    const k = Math.round(n / 1000);
    return `$${k.toLocaleString('en-AU')}k`;
  }
  return formatAudWhole(n);
}

/**
 * Estimated gross commission pool (whole AUD) from the published guide, using
 * commission as a % of sale — replace with authority figures when available.
 */
export function commissionPoolRangeFromGuide(
  guide: PriceGuideRange,
  commissionPctOfSale: number,
): { lowAud: number; highAud: number } {
  const c = Math.max(0, Math.min(100, commissionPctOfSale));
  return {
    lowAud: Math.round((guide.lowAud * c) / 100),
    highAud: Math.round((guide.highAud * c) / 100),
  };
}

/**
 * Referral dollars = referralPct% of the commission pool (each bound).
 */
export function referralFeeFromCommissionPool(
  pool: { lowAud: number; highAud: number },
  referralPct: number,
): { lowFeeAud: number; highFeeAud: number } {
  const p = Math.max(0, Math.min(100, referralPct));
  return {
    lowFeeAud: Math.round((pool.lowAud * p) / 100),
    highFeeAud: Math.round((pool.highAud * p) / 100),
  };
}

export function formatReferralEstimateLine(
  guide: PriceGuideRange | null,
  referralPct: number,
  commissionPctOfSale: number = ILLUSTRATIVE_COMMISSION_OF_SALE_PCT,
): string {
  if (!guide) return '—';
  const pool = commissionPoolRangeFromGuide(guide, commissionPctOfSale);
  const { lowFeeAud, highFeeAud } = referralFeeFromCommissionPool(pool, referralPct);
  if (lowFeeAud === highFeeAud) return formatAudWhole(lowFeeAud);
  return `${formatAudWhole(lowFeeAud)} — ${formatAudWhole(highFeeAud)}`;
}

/** Illustrative gross commission pool from the guide (AUD range). */
export function formatCommissionPoolLine(
  guide: PriceGuideRange | null,
  commissionPctOfSale: number = ILLUSTRATIVE_COMMISSION_OF_SALE_PCT,
): string {
  if (!guide) return '—';
  const pool = commissionPoolRangeFromGuide(guide, commissionPctOfSale);
  if (pool.lowAud === pool.highAud) return formatAudWhole(pool.lowAud);
  return `${formatAudWhole(pool.lowAud)} — ${formatAudWhole(pool.highAud)}`;
}

/**
 * Single whole‑dollar referral estimate at the sale price midpoint (for compact slider tick labels).
 */
export function referralFeeMidEstimateAud(
  guide: PriceGuideRange,
  referralPct: number,
  commissionPctOfSale: number,
): number {
  const midSale = Math.round((guide.lowAud + guide.highAud) / 2);
  const poolMid = Math.round((midSale * Math.max(0, Math.min(100, commissionPctOfSale))) / 100);
  return Math.round((poolMid * Math.max(0, Math.min(100, referralPct))) / 100);
}
