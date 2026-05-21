import type {
  MobileAuthorityItem,
  MobileHomeListing,
  MobileSoiReminder,
} from '@/lib/mobile-home-api';

export type AuthorityExpiringRow = MobileAuthorityItem & {
  soiAttached: boolean;
};

export function formatAuthorityDaysLeft(daysLeft: number): string {
  if (daysLeft <= 0) return 'EXPIRED';
  return `${daysLeft}D LEFT`;
}

export function soiStatusPill(soiAttached: boolean): string {
  return soiAttached ? 'SOI ATTACHED' : 'SOI MISSING — ACTION NEEDED';
}

export function deriveAuthorityExpiringSoon(
  listings: MobileHomeListing[],
  options?: { maxDays?: number; limit?: number },
): AuthorityExpiringRow[] {
  const maxDays = options?.maxDays ?? 30;
  const rows = listings
    .filter(
      (l) =>
        l.authorityDaysLeft != null &&
        l.authorityDaysLeft <= maxDays,
    )
    .sort(
      (a, b) => (a.authorityDaysLeft ?? 99) - (b.authorityDaysLeft ?? 99),
    )
    .map((l) => ({
      id: l.id,
      title: l.title,
      address: l.address,
      daysLeft: l.authorityDaysLeft ?? 0,
      soiAttached: l.soiAttached,
    }));
  const limit = options?.limit;
  return limit != null ? rows.slice(0, limit) : rows;
}

/** API rows win on id; pipeline fills gaps so home counts stay current after publish. */
export function mergeAuthorityExpiringRows(
  apiRows: AuthorityExpiringRow[],
  listings: MobileHomeListing[],
  maxDays = 30,
): AuthorityExpiringRow[] {
  const fromPipeline = deriveAuthorityExpiringSoon(listings, { maxDays });
  const byId = new Map<string, AuthorityExpiringRow>();
  for (const row of fromPipeline) byId.set(row.id, row);
  for (const row of apiRows) byId.set(row.id, row);
  return [...byId.values()].sort((a, b) => a.daysLeft - b.daysLeft);
}

/** Listing headline first — avoids showing a street number (e.g. "1") as the card title. */
export function formatSoiReminderFromListing(l: MobileHomeListing): MobileSoiReminder {
  const title = (l.title || '').replace(/\s+/g, ' ').trim();
  const address = (l.address || '').replace(/\s+/g, ' ').trim();
  const titleLine = title || address || 'Listing';
  const subtitleLine =
    address && address !== titleLine
      ? address
      : (l.priceRange || '').trim();
  const authorityDaysLeft =
    l.authorityDaysLeft != null && l.authorityDaysLeft <= 21
      ? l.authorityDaysLeft
      : undefined;
  return {
    id: l.id,
    titleLine,
    subtitleLine,
    needsSoi: false,
    authorityDaysLeft,
  };
}

/**
 * “SOI expiring soon” — SOI must already be on file; authority due within window.
 * Listings without an attached SOI are excluded (not “SOI missing” rows).
 */
function listingSoiExpiringSoon(
  l: MobileHomeListing,
  authoritySoonDays: number,
): boolean {
  if (!l.soiAttached) return false;
  if (l.authorityDaysLeft == null) return false;
  return l.authorityDaysLeft <= authoritySoonDays;
}

export function deriveSoiReminderListings(
  listings: MobileHomeListing[],
  options?: { authoritySoonDays?: number; limit?: number },
): MobileSoiReminder[] {
  const authoritySoonDays = options?.authoritySoonDays ?? 21;
  const rows = listings
    .filter((l) => l.id.startsWith('lst-'))
    .filter((l) => listingSoiExpiringSoon(l, authoritySoonDays))
    .sort(
      (a, b) => (a.authorityDaysLeft ?? 99) - (b.authorityDaysLeft ?? 99),
    )
    .map(formatSoiReminderFromListing);
  const limit = options?.limit;
  return limit != null ? rows.slice(0, limit) : rows;
}

export function mergeSoiReminderListings(
  apiRows: MobileSoiReminder[],
  listings: MobileHomeListing[],
): MobileSoiReminder[] {
  const fromPipeline = deriveSoiReminderListings(listings);
  const apiAttached = apiRows.filter(
    (r) =>
      !r.needsSoi &&
      (r.authorityDaysLeft == null || r.authorityDaysLeft <= 21),
  );
  const byId = new Map<string, MobileSoiReminder>();
  for (const row of fromPipeline) byId.set(row.id, row);
  for (const row of apiAttached) byId.set(row.id, row);
  return [...byId.values()].sort(
    (a, b) => (a.authorityDaysLeft ?? 99) - (b.authorityDaysLeft ?? 99),
  );
}

export function soiReminderSubtitle(item: MobileSoiReminder): string {
  const base = item.subtitleLine.trim();
  if (item.authorityDaysLeft != null) {
    const d = item.authorityDaysLeft;
    const label = d <= 0 ? 'Authority expired' : `Authority · ${d}d left`;
    return base ? `${base} · ${label}` : label;
  }
  return base;
}

/** Distinct listings needing SOI or authority attention (for callout headline). */
export function countExpiringAttention(
  authorityRows: AuthorityExpiringRow[],
  soiRows: MobileSoiReminder[],
): { authorityCount: number; missingSoiCount: number; attentionCount: number } {
  const authorityCount = authorityRows.length;
  const missingSoiCount = 0;
  const attentionIds = new Set([
    ...authorityRows.map((r) => r.id),
    ...soiRows.map((r) => r.id),
  ]);
  return {
    authorityCount,
    missingSoiCount,
    attentionCount: attentionIds.size,
  };
}

export type AuthorityExpiringFilter = 'all' | 'week' | 'month' | 'expired';

export function authorityExpiringFilterBucket(
  daysLeft: number,
): AuthorityExpiringFilter {
  if (daysLeft <= 0) return 'expired';
  if (daysLeft <= 7) return 'week';
  if (daysLeft <= 30) return 'month';
  return 'month';
}

export function filterAuthorityRows(
  rows: AuthorityExpiringRow[],
  filter: AuthorityExpiringFilter,
): AuthorityExpiringRow[] {
  if (filter === 'all') return rows;
  return rows.filter((row) => authorityExpiringFilterBucket(row.daysLeft) === filter);
}

export function soiAuthorityHeadline(
  authorityCount: number,
  missingSoiCount: number,
  attentionCount: number,
): string {
  if (authorityCount > 0) {
    return authorityCount === 1
      ? '1 authority expiring soon'
      : `${authorityCount} authorities expiring soon`;
  }
  if (attentionCount > 0) {
    return attentionCount === 1
      ? '1 SOI due for renewal soon'
      : `${attentionCount} SOIs due for renewal soon`;
  }
  return 'All SOIs and authorities are up to date';
}

export function soiAuthoritySubcopy(missingSoiCount: number, authorityCount: number): string {
  if (authorityCount > 0) {
    return 'Renew vendor authority or update the SOI from each listing.';
  }
  return 'Listings with an SOI on file and authority due within 21 days appear here.';
}
