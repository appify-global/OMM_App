/**
 * Referral fee percentage applies to the **listing agent’s commission** (or agreed referral pool
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
