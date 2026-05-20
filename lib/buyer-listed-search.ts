import type { MobileHomeListing } from '@/lib/mobile-home-api';

/** Included in Buying search catalogue (omit drafts / sold / archived). */
export function isListingVisibleForBuyerSearch(listing: MobileHomeListing): boolean {
  const s = listing.status.trim().toUpperCase();
  if (s.includes('DRAFT')) return false;
  if (s.includes('SOLD')) return false;
  if (s.includes('ARCHIVED')) return false;
  return true;
}

export function normalizeBuyerSearchText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Non-empty lowercase tokens split on whitespace — all must hit the haystack. */
export function buyerSearchTokens(raw: string): string[] {
  const spaced = normalizeBuyerSearchText(raw).replace(/,/g, " ").replace(/\s+/g, " ");
  const parts = spaced.split(" ").map((t) => t.trim()).filter(Boolean);
  return parts
    .map((t) => t.replace(/^[^a-z0-9$.]+|[^a-z0-9$.]+$/gi, ""))
    .filter((t) => t.length > 0);
}

/** Text blob searched for keyword chips (title, address, specs, etc.). */
export function haystackForListedListing(listing: MobileHomeListing): string {
  const parts = [
    listing.title,
    listing.address,
    listing.priceRange,
    listing.status,
    String(listing.beds),
    String(listing.baths),
    String(listing.landSqm),
  ];
  return normalizeBuyerSearchText(parts.join(' · '));
}

export function listingMatchesBuyerQuery(listing: MobileHomeListing, rawQuery: string): boolean {
  const tokens = buyerSearchTokens(rawQuery);
  if (tokens.length === 0) return true;
  const hay = haystackForListedListing(listing);
  return tokens.every((tok) => hay.includes(tok));
}

/**
 * Parses `street` + `suburb` for `/view-live-listing` from API listing rows.
 */
export function viewLiveListingAddressParamsFromListing(
  listing: MobileHomeListing,
): { street: string; suburb: string } {
  const raw = listing.address.trim();
  if (!raw) {
    return { street: listing.title.trim(), suburb: listing.title.trim() };
  }
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  const street = parts[0] ?? listing.title.trim();
  const suburb = parts.length > 1 ? parts.slice(1).join(', ') : listing.title.trim();
  return { street, suburb };
}
