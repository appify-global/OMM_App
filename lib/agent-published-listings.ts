import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImageSourcePropType } from 'react-native';

import {
  thumbnailIndexFromListingId,
  type MobileHomeListing,
  type MobileOffMarketMatch,
} from '@/lib/mobile-home-api';
import type { ListingDraftFloorPlan, ListingDraftPhoto } from '@/lib/listing-media-pickers';
import { propertyImageAtIndex } from '@/lib/propertyImages';
import {
  commissionPoolRangeFromGuide,
  formatAudWhole,
  formatSoldPriceCompactWholeAud,
  ILLUSTRATIVE_COMMISSION_OF_SALE_PCT,
  parseFormattedAudWholeDollars,
  resolvePriceGuideRange,
} from '@/lib/referral-pricing';
import type { SavedListingCardData } from '@/lib/saved-listings';
import type { RecentlySoldItem } from '@/lib/agent-home-metrics';
import type { InspectionAvailabilityTags } from '@/lib/listing-inspection-availability';

const STORAGE_KEY = 'omm_agent_published_listings_v1';

/** Device-local (`omm-*`) or Railway Postgres (`lst-*`) listing ids. */
export function isPersistedAgentListingId(id: string | undefined | null): boolean {
  if (!id) return false;
  return id.startsWith('omm-') || id.startsWith('lst-');
}

/** Same values as listing draft “address visibility” (kept local to avoid import cycles). */
export type StoredAddressDisclosure = 'disclose' | 'not_disclose';

/** Listing lifecycle on Manage listings / marketplace visibility. */
export type PublishedListingStatus = 'live' | 'pending' | 'sold';

/** Device-local analytics (until backend). Keys are calendar dates `YYYY-MM-DD` in local time. */
export type PublishedListingAnalytics = {
  viewsByDay: Record<string, number>;
  savesByDay: Record<string, number>;
  enquiriesByDay: Record<string, number>;
};

/** Buyer inspection slot chosen from live listing flow — persisted with listing until CRM sync. */
export type PublishedInspectionBooking = {
  id: string;
  bookedAtIso: string;
  aprilDay2026: number;
  slotId: string;
  slotLabel: string;
};

export type InspectionBookingInput = {
  aprilDay2026: number;
  slotId: string;
  slotLabel: string;
};

/** Agent-owned listing persisted after tapping Publish (device-local until API exists). */
export type PublishedAgentListing = {
  id: string;
  publishedAt: string;
  addressLine: string;
  /** Short headline (e.g. `12 Foo St · Richmond`) */
  titleLine: string;
  suburbLine: string;
  streetLine: string;
  priceRangeDisplay: string;
  /** Whole-dollar guide when known (supports edit round-trip). */
  listingPriceFromAud?: number | null;
  listingPriceToAud?: number | null;
  beds: number;
  baths: number;
  cars: number;
  landSqm: number | null;
  propertyType: string;
  addressDisclosure: StoredAddressDisclosure;
  /** Optional agent-authored body copy on listing detail. */
  description?: string;
  /** Seller-facing inspection availability captured at publish (step 3); shown on live listing. */
  sellerInspectionAvailability?: string;
  /** Structured prefs from step 3 — drives Schedule inspection slot options. */
  sellerInspectionAvailabilityTags?: InspectionAvailabilityTags;
  sellerInspectionAvailabilityNotes?: string;
  /** Ordered listing photos (index 0 = cover). Device-local URIs until upload API exists. */
  listingPhotos?: ListingDraftPhoto[];
  listingFloorPlan?: ListingDraftFloorPlan;
  /** Buyer engagement tracked on-device when listings are viewed/saved/contacted. */
  listingAnalytics?: PublishedListingAnalytics;
  /** Inspection slots buyers booked via Schedule inspection on live listing (device-local). */
  localInspectionBookings?: PublishedInspectionBooking[];
  /** Manage listings status — omit or `live` means active on marketplace. */
  listingStatus?: PublishedListingStatus;
  /** ISO timestamp when marked Sold (device-local); drives Home “Recently sold” ordering. */
  soldMarkedAt?: string;
  /** ISO timestamp when archived (hidden from buyers / primary tabs). */
  archivedAt?: string;
};

export type ListingDetailsSnapshot = {
  address: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  carSpaces: string;
  landAreaSize: string;
  internalArea: string;
};

function countFromPick(s: string): number {
  const m = /^(\d+)/.exec(s.trim());
  if (m) return Math.max(0, parseInt(m[1], 10));
  return 0;
}

export function parseLandSqm(raw: string): number | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}

export function formatListingPriceRangeDisplay(
  fromAud: number | null,
  toAud: number | null,
): string {
  if (fromAud != null && toAud != null) {
    const lo = Math.min(fromAud, toAud);
    const hi = Math.max(fromAud, toAud);
    if (lo === hi) return formatAudWhole(lo);
    return `${formatAudWhole(lo)} — ${formatAudWhole(hi)}`;
  }
  const v = fromAud ?? toAud;
  return v != null ? formatAudWhole(v) : '—';
}

export function titleLineFromAddress(address: string): string {
  const parts = address.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]} · ${parts[1]}`;
  }
  return address.trim() || '—';
}

export function streetFromAddress(address: string): string {
  return address.split(',')[0]?.trim() || address.trim();
}

export function suburbFromAddress(address: string): string {
  const parts = address.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return '';
  return parts.slice(1).join(', ');
}

export function buildPublishedAgentListingPayload(input: {
  details: ListingDetailsSnapshot;
  listingPriceFromAud: number | null;
  listingPriceToAud: number | null;
  addressDisclosure: StoredAddressDisclosure;
  sellerInspectionAvailability?: string;
  sellerInspectionAvailabilityTags?: InspectionAvailabilityTags;
  sellerInspectionAvailabilityNotes?: string;
}): Omit<PublishedAgentListing, 'id' | 'publishedAt'> {
  const addressLine = input.details.address.trim();
  const avail =
    typeof input.sellerInspectionAvailability === 'string' &&
    input.sellerInspectionAvailability.trim().length > 0
      ? input.sellerInspectionAvailability.trim()
      : undefined;
  const availTags = input.sellerInspectionAvailabilityTags;
  const availNotes =
    typeof input.sellerInspectionAvailabilityNotes === 'string' &&
    input.sellerInspectionAvailabilityNotes.trim().length > 0
      ? input.sellerInspectionAvailabilityNotes.trim()
      : undefined;
  return {
    addressLine,
    titleLine: titleLineFromAddress(addressLine),
    streetLine: streetFromAddress(addressLine),
    suburbLine: suburbFromAddress(addressLine),
    priceRangeDisplay: formatListingPriceRangeDisplay(
      input.listingPriceFromAud,
      input.listingPriceToAud,
    ),
    listingPriceFromAud: input.listingPriceFromAud,
    listingPriceToAud: input.listingPriceToAud,
    beds: countFromPick(input.details.bedrooms || '0'),
    baths: countFromPick(input.details.bathrooms || '0'),
    cars: countFromPick(input.details.carSpaces || '0'),
    landSqm: parseLandSqm(input.details.landAreaSize),
    propertyType: input.details.propertyType || 'House',
    addressDisclosure: input.addressDisclosure,
    ...(avail !== undefined ? { sellerInspectionAvailability: avail } : {}),
    ...(availTags !== undefined ? { sellerInspectionAvailabilityTags: availTags } : {}),
    ...(availNotes !== undefined ? { sellerInspectionAvailabilityNotes: availNotes } : {}),
  };
}

/** Split typed guide like `$532,321 — $652,000` into whole AUD bounds. */
export function parseListingPriceRangeInput(display: string): {
  fromAud: number | null;
  toAud: number | null;
} {
  const trimmed = display.trim();
  if (!trimmed) return { fromAud: null, toAud: null };
  const normalized = trimmed.replace(/\u2014/g, '—').replace(/\u2013/g, '—');
  const parts = normalized.split(/\s*[—–-]\s*/).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const a = parseFormattedAudWholeDollars(parts[0]);
    const b = parseFormattedAudWholeDollars(parts[1]);
    return { fromAud: a, toAud: b };
  }
  const single = parseFormattedAudWholeDollars(trimmed);
  return { fromAud: single, toAud: single };
}

export type ListingEditFormSnapshot = {
  titleLine: string;
  priceInput: string;
  streetLine: string;
  suburbLine: string;
  bedrooms: string;
  bathrooms: string;
  carSpaces: string;
  description: string;
};

/** Apply edit-listing form values onto an existing stored listing (device-local). */
export function mergePublishedListingFromEditForm(
  existing: PublishedAgentListing,
  form: ListingEditFormSnapshot,
): PublishedAgentListing {
  const street = form.streetLine.trim();
  const suburb = form.suburbLine.trim();
  const addressLine = [street, suburb].filter(Boolean).join(', ');
  const parsed = parseListingPriceRangeInput(form.priceInput);

  let priceRangeDisplay = existing.priceRangeDisplay;
  let fromAud = existing.listingPriceFromAud ?? null;
  let toAud = existing.listingPriceToAud ?? null;

  if (parsed.fromAud != null || parsed.toAud != null) {
    fromAud = parsed.fromAud ?? parsed.toAud;
    toAud = parsed.toAud ?? parsed.fromAud;
    priceRangeDisplay = formatListingPriceRangeDisplay(fromAud, toAud);
  }

  const beds = countFromPick(form.bedrooms || '0');
  const baths = countFromPick(form.bathrooms || '0');
  const cars = countFromPick(form.carSpaces || '0');

  const addressResolved =
    addressLine.trim().length > 0 ? addressLine.trim() : existing.addressLine;
  const titleLine =
    form.titleLine.trim() ||
    titleLineFromAddress(addressResolved || existing.addressLine);

  const streetResolved =
    street.length > 0 ? street : streetFromAddress(addressResolved);
  const suburbResolved =
    suburb.length > 0 ? suburb : suburbFromAddress(addressResolved);

  const descriptionTrimmed = form.description.trim();

  return {
    ...existing,
    addressLine: addressResolved,
    streetLine: streetResolved,
    suburbLine: suburbResolved,
    titleLine,
    priceRangeDisplay,
    listingPriceFromAud: fromAud,
    listingPriceToAud: toAud,
    beds,
    baths,
    cars,
    description: descriptionTrimmed.length > 0 ? descriptionTrimmed : undefined,
  };
}

export function emptyListingAnalytics(): PublishedListingAnalytics {
  return { viewsByDay: {}, savesByDay: {}, enquiriesByDay: {} };
}

/** Local calendar date key for analytics buckets. */
export function calendarDayKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDayCountRecord(v: unknown): Record<string, number> {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return {};
  const out: Record<string, number> = {};
  for (const [k, raw] of Object.entries(v as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
    if (typeof raw !== 'number' || !Number.isFinite(raw)) continue;
    out[k] = Math.max(0, Math.floor(raw));
  }
  return out;
}

function parseListingAnalytics(v: unknown): PublishedListingAnalytics | undefined {
  if (v === null || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const viewsByDay = parseDayCountRecord(o.viewsByDay);
  const savesByDay = parseDayCountRecord(o.savesByDay);
  const enquiriesByDay = parseDayCountRecord(o.enquiriesByDay);
  const legacySaves =
    typeof o.savesCount === 'number' && Number.isFinite(o.savesCount)
      ? Math.max(0, Math.floor(o.savesCount))
      : 0;
  const legacyEnq =
    typeof o.enquiriesCount === 'number' && Number.isFinite(o.enquiriesCount)
      ? Math.max(0, Math.floor(o.enquiriesCount))
      : 0;

  let mergedSaves = savesByDay;
  if (legacySaves > 0 && Object.keys(savesByDay).length === 0) {
    const k = calendarDayKeyLocal(new Date());
    mergedSaves = { [k]: legacySaves };
  }
  let mergedEnq = enquiriesByDay;
  if (legacyEnq > 0 && Object.keys(enquiriesByDay).length === 0) {
    const k = calendarDayKeyLocal(new Date());
    mergedEnq = { [k]: legacyEnq };
  }

  if (
    Object.keys(viewsByDay).length === 0 &&
    Object.keys(mergedSaves).length === 0 &&
    Object.keys(mergedEnq).length === 0
  ) {
    return undefined;
  }
  return { viewsByDay, savesByDay: mergedSaves, enquiriesByDay: mergedEnq };
}

export function mergePublishedListingAnalyticsView(row: PublishedAgentListing): PublishedAgentListing {
  const prev = row.listingAnalytics ?? emptyListingAnalytics();
  const key = calendarDayKeyLocal(new Date());
  return {
    ...row,
    listingAnalytics: {
      ...prev,
      viewsByDay: { ...prev.viewsByDay, [key]: (prev.viewsByDay[key] ?? 0) + 1 },
    },
  };
}

export function mergePublishedListingAnalyticsSaveDelta(
  row: PublishedAgentListing,
  delta: number,
): PublishedAgentListing {
  const prev = row.listingAnalytics ?? emptyListingAnalytics();
  const key = calendarDayKeyLocal(new Date());
  const nextDayVal = Math.max(0, (prev.savesByDay[key] ?? 0) + delta);
  const nextSaves = { ...prev.savesByDay, [key]: nextDayVal };
  return {
    ...row,
    listingAnalytics: {
      ...prev,
      savesByDay: nextSaves,
    },
  };
}

export function mergePublishedListingAnalyticsEnquiry(row: PublishedAgentListing): PublishedAgentListing {
  const prev = row.listingAnalytics ?? emptyListingAnalytics();
  const key = calendarDayKeyLocal(new Date());
  return {
    ...row,
    listingAnalytics: {
      ...prev,
      enquiriesByDay: {
        ...prev.enquiriesByDay,
        [key]: (prev.enquiriesByDay[key] ?? 0) + 1,
      },
    },
  };
}

/** Sum bucket counts for today and the previous `days - 1` days (inclusive). */
export function sumBucketLastDays(bucket: Record<string, number>, days: number): number {
  let s = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    s += bucket[calendarDayKeyLocal(d)] ?? 0;
  }
  return s;
}

function sumBucketWindow(bucket: Record<string, number>, startDayAgo: number, len: number): number {
  let s = 0;
  for (let i = 0; i < len; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (startDayAgo + i));
    s += bucket[calendarDayKeyLocal(d)] ?? 0;
  }
  return s;
}

export function formatAnalyticsTrendPct(currentWindow: number, previousWindow: number): string {
  if (currentWindow === 0 && previousWindow === 0) return '—';
  if (previousWindow <= 0 && currentWindow > 0) return '+100%';
  const pct = Math.round(((currentWindow - previousWindow) / previousWindow) * 100);
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct}%`;
}

/** Oldest → newest day (length `days`). */
export function dailySeries(bucket: Record<string, number>, days: number): number[] {
  const out: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(bucket[calendarDayKeyLocal(d)] ?? 0);
  }
  return out;
}

export function normalizeSeriesToFractions(series: number[]): number[] {
  const mx = Math.max(1, ...series);
  return series.map((n) => Math.max(0, n / mx));
}

export type ListingPerformanceComputed = {
  titleLine: string;
  views30: number;
  saves30: number;
  enquiries30: number;
  viewsTrend: string;
  savesTrend: string;
  enquiriesTrend: string;
  chartBarFracs: number[];
  chartMax: number;
};

export function computeListingPerformanceMetrics(
  analytics: PublishedListingAnalytics | undefined,
  titleLine: string,
): ListingPerformanceComputed {
  const a = analytics ?? emptyListingAnalytics();
  const views30 = sumBucketLastDays(a.viewsByDay, 30);
  const saves30 = sumBucketLastDays(a.savesByDay, 30);
  const enquiries30 = sumBucketLastDays(a.enquiriesByDay, 30);

  const vLast7 = sumBucketWindow(a.viewsByDay, 0, 7);
  const vPrev7 = sumBucketWindow(a.viewsByDay, 7, 7);
  const sLast7 = sumBucketWindow(a.savesByDay, 0, 7);
  const sPrev7 = sumBucketWindow(a.savesByDay, 7, 7);
  const eLast7 = sumBucketWindow(a.enquiriesByDay, 0, 7);
  const ePrev7 = sumBucketWindow(a.enquiriesByDay, 7, 7);

  const series = dailySeries(a.viewsByDay, 30);
  const chartMax = Math.max(1, ...series);
  const chartBarFracs = normalizeSeriesToFractions(series);

  return {
    titleLine,
    views30,
    saves30,
    enquiries30,
    viewsTrend: formatAnalyticsTrendPct(vLast7, vPrev7),
    savesTrend: formatAnalyticsTrendPct(sLast7, sPrev7),
    enquiriesTrend: formatAnalyticsTrendPct(eLast7, ePrev7),
    chartBarFracs,
    chartMax,
  };
}

export function computeListingPerformance(listing: PublishedAgentListing): ListingPerformanceComputed {
  return computeListingPerformanceMetrics(listing.listingAnalytics, listing.titleLine);
}

function formatIntComma(n: number): string {
  return Math.round(n).toLocaleString('en-AU');
}

export function formatPerformanceMetric(n: number): string {
  return formatIntComma(n);
}

/** Hero image for cards / listing detail — first uploaded photo or catalog fallback. */
export function listingHeroImageSource(p: PublishedAgentListing): ImageSourcePropType {
  const uri = p.listingPhotos?.[0]?.uri?.trim();
  if (uri) return { uri };
  return propertyImageAtIndex(thumbnailIndexFromListingId(p.id));
}

/** Persist photos & optional floor plan from the manage-media editor. */
export function mergePublishedListingMedia(
  existing: PublishedAgentListing,
  photos: ListingDraftPhoto[],
  floorPlan: ListingDraftFloorPlan | null,
): PublishedAgentListing {
  return {
    ...existing,
    listingPhotos: photos.length > 0 ? photos.map((x) => ({ ...x })) : undefined,
    listingFloorPlan: floorPlan ?? undefined,
  };
}

/** Append a buyer inspection booking (live listing Schedule inspection confirm). */
export function mergePublishedListingAppendInspectionBooking(
  existing: PublishedAgentListing,
  input: InspectionBookingInput,
): PublishedAgentListing {
  const id = `insp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const april = Math.max(1, Math.min(30, Math.floor(input.aprilDay2026)));
  const entry: PublishedInspectionBooking = {
    id,
    bookedAtIso: new Date().toISOString(),
    aprilDay2026: april,
    slotId: input.slotId.trim(),
    slotLabel: input.slotLabel.trim(),
  };
  const prev = [...(existing.localInspectionBookings ?? [])];
  return {
    ...existing,
    localInspectionBookings: [entry, ...prev],
  };
}

export function resolvedPublishedListingStatus(p: PublishedAgentListing): PublishedListingStatus {
  return p.listingStatus ?? 'live';
}

/** Rolling window for Selling KPI “Inspections booked” (device bookings only). */
export const INSPECTION_BOOKING_KPI_WINDOW_MS = 30 * 86_400_000;

/** Home Selling KPI strip derived from device-stored listings (Manage tab semantics). */
export type SellingKpisFromPublishedListings = {
  activeListingsCount: number;
  pendingListingsCount: number;
  soldListingsCount: number;
  /** Confirmed inspection bookings on active listings in the KPI window (device-local). */
  inspectionsBookedCount: number;
  /** Illustrative gross commission sum from price guides (`referral-pricing` pool formula); null when no eligible priced listings. */
  pipelineCommissionEstimateAud: { lowAud: number; highAud: number } | null;
};

/**
 * Active = live & not archived; pending = pending & not archived; sold = sold & not archived.
 * Pipeline sums illustrative gross commission pools for non-sold, non-archived rows with numeric guides.
 */
export function sellingKpisFromPublishedListings(
  rows: PublishedAgentListing[],
): SellingKpisFromPublishedListings {
  let activeListingsCount = 0;
  let pendingListingsCount = 0;
  let soldListingsCount = 0;
  let inspectionsBookedCount = 0;
  let lowAudSum = 0;
  let highAudSum = 0;
  let pipelineAny = false;

  const cutoffMs = Date.now() - INSPECTION_BOOKING_KPI_WINDOW_MS;

  for (const p of rows) {
    if (isPublishedListingArchived(p)) continue;
    const st = resolvedPublishedListingStatus(p);
    if (st === 'live') activeListingsCount += 1;
    else if (st === 'pending') pendingListingsCount += 1;
    else if (st === 'sold') soldListingsCount += 1;

    if (st !== 'sold') {
      for (const b of p.localInspectionBookings ?? []) {
        const t = Date.parse(b.bookedAtIso);
        if (Number.isFinite(t) && t >= cutoffMs) inspectionsBookedCount += 1;
      }
    }

    if (st === 'sold') continue;

    const guide = resolvePriceGuideRange(p.listingPriceFromAud ?? null, p.listingPriceToAud ?? null);
    if (!guide) continue;
    const pool = commissionPoolRangeFromGuide(guide, ILLUSTRATIVE_COMMISSION_OF_SALE_PCT);
    lowAudSum += pool.lowAud;
    highAudSum += pool.highAud;
    pipelineAny = true;
  }

  return {
    activeListingsCount,
    pendingListingsCount,
    soldListingsCount,
    inspectionsBookedCount,
    pipelineCommissionEstimateAud: pipelineAny
      ? { lowAud: lowAudSum, highAud: highAudSum }
      : null,
  };
}

/** Relative sold caption for Home strip (`Sold 3d ago`, `Sold 1w ago`). */
export function soldStripRelativeCaption(isoUtc: string): string {
  const t = Date.parse(isoUtc);
  if (!Number.isFinite(t)) return 'Sold recently';
  const diffDays = Math.floor(Math.max(0, Date.now() - t) / 86_400_000);
  if (diffDays <= 0) return 'Sold today';
  if (diffDays === 1) return 'Sold 1d ago';
  if (diffDays < 7) return `Sold ${diffDays}d ago`;
  const w = Math.floor(diffDays / 7);
  if (diffDays < 30) return w === 1 ? 'Sold 1w ago' : `Sold ${w}w ago`;
  const mo = Math.floor(diffDays / 30);
  return mo === 1 ? 'Sold 1mo ago' : `Sold ${mo}mo ago`;
}

/** Maps stored Sold listings → Home “Recently sold” carousel items (newest first). */
export function recentlySoldStripFromPublishedListings(
  rows: PublishedAgentListing[],
): RecentlySoldItem[] {
  const soldRows = rows.filter(
    (p) => !isPublishedListingArchived(p) && resolvedPublishedListingStatus(p) === 'sold',
  );
  soldRows.sort((a, b) => {
    const ta = Date.parse(a.soldMarkedAt ?? a.publishedAt) || 0;
    const tb = Date.parse(b.soldMarkedAt ?? b.publishedAt) || 0;
    return tb - ta;
  });

  return soldRows.map((p) => {
    const guide = resolvePriceGuideRange(p.listingPriceFromAud ?? null, p.listingPriceToAud ?? null);
    let soldPriceDisplay = p.priceRangeDisplay.trim() || '—';
    if (guide) {
      if (guide.lowAud === guide.highAud) {
        soldPriceDisplay = formatSoldPriceCompactWholeAud(guide.lowAud);
      } else {
        soldPriceDisplay = `${formatSoldPriceCompactWholeAud(guide.lowAud)} — ${formatSoldPriceCompactWholeAud(guide.highAud)}`;
      }
    }

    const anchor = (p.soldMarkedAt ?? p.publishedAt).trim();
    const street = p.streetLine.trim() || streetFromAddress(p.addressLine);
    const suburb = p.suburbLine.trim() || suburbFromAddress(p.addressLine);
    const uri = p.listingPhotos?.[0]?.uri?.trim();

    return {
      id: p.id,
      addressLine: street || p.titleLine,
      suburb: suburb.length > 0 ? suburb : '—',
      soldPriceDisplay,
      soldAtDisplay: soldStripRelativeCaption(anchor),
      imageIndex: thumbnailIndexFromListingId(p.id),
      ...(uri ? { coverImageUri: uri } : {}),
    };
  });
}

/** Persist Manage listings status; `live` clears stored status so legacy rows stay compact. */
export function mergePublishedListingStatus(
  existing: PublishedAgentListing,
  status: PublishedListingStatus,
): PublishedAgentListing {
  if (status === 'live') {
    const next = { ...existing };
    delete next.listingStatus;
    delete next.soldMarkedAt;
    return next;
  }
  if (status === 'sold') {
    const stamp =
      typeof existing.soldMarkedAt === 'string' && existing.soldMarkedAt.trim().length > 0
        ? existing.soldMarkedAt.trim()
        : new Date().toISOString();
    return { ...existing, listingStatus: status, soldMarkedAt: stamp };
  }
  const next = { ...existing, listingStatus: status };
  delete next.soldMarkedAt;
  return next;
}

/** Archived listings are hidden from buyer surfaces and Live / Contract / Sold tabs. */
export function isPublishedListingArchived(p: PublishedAgentListing): boolean {
  return typeof p.archivedAt === 'string' && p.archivedAt.trim().length > 0;
}

export function mergePublishedListingArchived(
  existing: PublishedAgentListing,
  archive: boolean,
): PublishedAgentListing {
  if (!archive) {
    const next = { ...existing };
    delete next.archivedAt;
    return next;
  }
  return { ...existing, archivedAt: new Date().toISOString() };
}

export function publishedListingArchivedRibbon(p: PublishedAgentListing): string {
  const raw = p.archivedAt?.trim();
  const d = raw ? new Date(raw) : null;
  const dateStr =
    d != null && !Number.isNaN(d.getTime())
      ? d.toLocaleDateString('en-AU', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Recently';
  return `Archived ${dateStr} • Hidden from buyers`;
}

export function publishedListingArchivedManageSubtitle(p: PublishedAgentListing): string {
  const price = p.priceRangeDisplay;
  return `${price} • Archived • Hidden from search`;
}

export function publishedListingStatusBadge(st: PublishedListingStatus): string {
  switch (st) {
    case 'live':
      return 'LIVE';
    case 'pending':
      return 'PENDING';
    case 'sold':
      return 'SOLD';
  }
}

export function publishedListingRibbonLine(p: PublishedAgentListing): string {
  const st = resolvedPublishedListingStatus(p);
  if (st === 'sold') return 'Sold • Removed from active search';
  if (st === 'pending') return 'Under offer or contract in progress';
  return 'Just published • Authority expires in 30 days';
}

export function publishedListingManageSubtitleLine(p: PublishedAgentListing): string {
  const st = resolvedPublishedListingStatus(p);
  const price = p.priceRangeDisplay;
  if (st === 'sold') return `${price} • Sold • Removed from active search`;
  if (st === 'pending') return `${price} • Pending • Under offer or contract`;
  return `${price} • Live • Published recently • SOI attached`;
}

function mobileHomeStatusFromPublished(p: PublishedAgentListing): string {
  if (isPublishedListingArchived(p)) return 'ARCHIVED';
  switch (resolvedPublishedListingStatus(p)) {
    case 'live':
      return 'ACTIVE';
    case 'pending':
      return 'PENDING';
    case 'sold':
      return 'SOLD';
  }
}

function parseStoredPhoto(v: unknown): ListingDraftPhoto | null {
  if (v === null || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== 'string' || !o.id) return null;
  if (typeof o.uri !== 'string' || !o.uri) return null;
  if (typeof o.name !== 'string') return null;
  const sizeBytes =
    typeof o.sizeBytes === 'number' && Number.isFinite(o.sizeBytes)
      ? Math.max(0, o.sizeBytes)
      : 0;
  return { id: o.id, uri: o.uri, name: o.name, sizeBytes };
}

function parseStoredFloorPlan(v: unknown): ListingDraftFloorPlan | null {
  if (v === null || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.uri !== 'string' || !o.uri) return null;
  if (typeof o.name !== 'string') return null;
  if (typeof o.mimeType !== 'string') return null;
  const sizeBytes =
    typeof o.sizeBytes === 'number' && Number.isFinite(o.sizeBytes)
      ? Math.max(0, o.sizeBytes)
      : 0;
  return { uri: o.uri, name: o.name, mimeType: o.mimeType, sizeBytes };
}

function parseLocalInspectionBookings(raw: unknown): PublishedInspectionBooking[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: PublishedInspectionBooking[] = [];
  for (const item of raw) {
    if (item === null || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id.trim() : '';
    const bookedAtIso = typeof o.bookedAtIso === 'string' ? o.bookedAtIso.trim() : '';
    const aprilRaw = o.aprilDay2026;
    const aprilDay2026 =
      typeof aprilRaw === 'number' && Number.isFinite(aprilRaw)
        ? Math.floor(aprilRaw)
        : null;
    const slotId = typeof o.slotId === 'string' ? o.slotId.trim() : '';
    const slotLabel = typeof o.slotLabel === 'string' ? o.slotLabel.trim() : '';
    if (
      !id ||
      !bookedAtIso ||
      Number.isNaN(Date.parse(bookedAtIso)) ||
      aprilDay2026 == null ||
      aprilDay2026 < 1 ||
      aprilDay2026 > 31 ||
      !slotId ||
      !slotLabel
    ) {
      continue;
    }
    out.push({
      id,
      bookedAtIso,
      aprilDay2026,
      slotId,
      slotLabel,
    });
  }
  return out.length > 0 ? out : undefined;
}

function parseRow(v: unknown): PublishedAgentListing | null {
  if (v === null || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== 'string' || !o.id) return null;
  if (typeof o.publishedAt !== 'string' || !o.publishedAt) return null;
  if (typeof o.addressLine !== 'string') return null;
  if (typeof o.titleLine !== 'string') return null;
  if (typeof o.suburbLine !== 'string') return null;
  if (typeof o.streetLine !== 'string') return null;
  if (typeof o.priceRangeDisplay !== 'string') return null;
  if (typeof o.beds !== 'number' || !Number.isFinite(o.beds)) return null;
  if (typeof o.baths !== 'number' || !Number.isFinite(o.baths)) return null;
  if (typeof o.cars !== 'number' || !Number.isFinite(o.cars)) return null;
  if (o.landSqm !== null && (typeof o.landSqm !== 'number' || !Number.isFinite(o.landSqm))) return null;
  if (typeof o.propertyType !== 'string') return null;
  const disc = o.addressDisclosure === 'not_disclose' ? 'not_disclose' : 'disclose';

  const lpFrom =
    typeof o.listingPriceFromAud === 'number' && Number.isFinite(o.listingPriceFromAud)
      ? o.listingPriceFromAud
      : undefined;
  const lpTo =
    typeof o.listingPriceToAud === 'number' && Number.isFinite(o.listingPriceToAud)
      ? o.listingPriceToAud
      : undefined;
  const description =
    typeof o.description === 'string' && o.description.trim().length > 0
      ? o.description.trim()
      : undefined;
  const sellerInspectionAvailability =
    typeof o.sellerInspectionAvailability === 'string' && o.sellerInspectionAvailability.trim().length > 0
      ? o.sellerInspectionAvailability.trim()
      : undefined;

  let sellerInspectionAvailabilityTags: InspectionAvailabilityTags | undefined;
  if (o.sellerInspectionAvailabilityTags != null && typeof o.sellerInspectionAvailabilityTags === 'object') {
    const t = o.sellerInspectionAvailabilityTags as Record<string, unknown>;
    sellerInspectionAvailabilityTags = {
      byAppointment: t.byAppointment === true,
      openHome: t.openHome === true,
      flexibleHours: t.flexibleHours === true,
    };
  }

  const sellerInspectionAvailabilityNotes =
    typeof o.sellerInspectionAvailabilityNotes === 'string' &&
    o.sellerInspectionAvailabilityNotes.trim().length > 0
      ? o.sellerInspectionAvailabilityNotes.trim()
      : undefined;

  let listingPhotos: ListingDraftPhoto[] | undefined;
  if (Array.isArray(o.listingPhotos)) {
    const pics = o.listingPhotos
      .map(parseStoredPhoto)
      .filter((x): x is ListingDraftPhoto => x !== null);
    listingPhotos = pics.length > 0 ? pics : undefined;
  }

  let listingFloorPlan: ListingDraftFloorPlan | undefined;
  if (o.listingFloorPlan != null && typeof o.listingFloorPlan === 'object') {
    const fp = parseStoredFloorPlan(o.listingFloorPlan);
    if (fp) listingFloorPlan = fp;
  }

  const listingAnalytics =
    o.listingAnalytics !== undefined ? parseListingAnalytics(o.listingAnalytics) : undefined;

  const lsRaw = o.listingStatus;
  const listingStatus: PublishedListingStatus | undefined =
    lsRaw === 'pending' || lsRaw === 'sold' ? lsRaw : undefined;

  let archivedAt: string | undefined;
  if (typeof o.archivedAt === 'string') {
    const t = o.archivedAt.trim();
    if (t.length > 0 && !Number.isNaN(Date.parse(t))) archivedAt = t;
  }

  let soldMarkedAt: string | undefined;
  if (typeof o.soldMarkedAt === 'string') {
    const t = o.soldMarkedAt.trim();
    if (t.length > 0 && !Number.isNaN(Date.parse(t))) soldMarkedAt = t;
  }

  const localInspectionBookings = parseLocalInspectionBookings(o.localInspectionBookings);

  return {
    id: o.id,
    publishedAt: o.publishedAt,
    addressLine: o.addressLine,
    titleLine: o.titleLine,
    suburbLine: o.suburbLine,
    streetLine: o.streetLine,
    priceRangeDisplay: o.priceRangeDisplay,
    listingPriceFromAud: lpFrom ?? null,
    listingPriceToAud: lpTo ?? null,
    beds: Math.max(0, Math.floor(o.beds)),
    baths: Math.max(0, Math.floor(o.baths)),
    cars: Math.max(0, Math.floor(o.cars)),
    landSqm: o.landSqm == null ? null : Math.max(0, Math.floor(o.landSqm)),
    propertyType: o.propertyType,
    addressDisclosure: disc,
    description,
    ...(sellerInspectionAvailability !== undefined ? { sellerInspectionAvailability } : {}),
    ...(sellerInspectionAvailabilityTags !== undefined
      ? { sellerInspectionAvailabilityTags }
      : {}),
    ...(sellerInspectionAvailabilityNotes !== undefined
      ? { sellerInspectionAvailabilityNotes }
      : {}),
    listingPhotos,
    listingFloorPlan,
    listingAnalytics,
    ...(listingStatus !== undefined ? { listingStatus } : {}),
    ...(archivedAt !== undefined ? { archivedAt } : {}),
    ...(soldMarkedAt !== undefined ? { soldMarkedAt } : {}),
    ...(localInspectionBookings !== undefined ? { localInspectionBookings } : {}),
  };
}

async function readStored(): Promise<PublishedAgentListing[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseRow).filter((r): r is PublishedAgentListing => r !== null);
  } catch {
    return [];
  }
}

async function writeStored(rows: PublishedAgentListing[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* offline / quota */
  }
}

export async function appendPublishedListingStored(
  row: PublishedAgentListing,
): Promise<void> {
  const existing = await readStored();
  const next = [row, ...existing.filter((r) => r.id !== row.id)];
  await writeStored(next);
}

export async function loadPublishedAgentListings(): Promise<PublishedAgentListing[]> {
  const rows = await readStored();
  return rows.sort(
    (a, b) =>
      Date.parse(b.publishedAt || '0') - Date.parse(a.publishedAt || '0'),
  );
}

export type NewPublishedListingInput = Omit<
  PublishedAgentListing,
  'id' | 'publishedAt'
>;

/** Returns new listing id */
export async function persistNewPublishedListing(
  payload: NewPublishedListingInput,
): Promise<string> {
  const id = `omm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const row: PublishedAgentListing = {
    ...payload,
    id,
    publishedAt: new Date().toISOString(),
  };
  await appendPublishedListingStored(row);
  return id;
}

export async function updatePublishedListingStored(
  row: PublishedAgentListing,
): Promise<boolean> {
  const rows = await readStored();
  const ix = rows.findIndex((r) => r.id === row.id);
  if (ix < 0) return false;
  rows[ix] = row;
  await writeStored(rows);
  return true;
}

async function mutateListingById(
  listingId: string,
  mutator: (row: PublishedAgentListing) => PublishedAgentListing,
): Promise<boolean> {
  const rows = await readStored();
  const ix = rows.findIndex((r) => r.id === listingId);
  if (ix < 0) return false;
  rows[ix] = mutator(rows[ix]);
  await writeStored(rows);
  return true;
}

/** Buyer opened live listing detail — increments today's view bucket. */
export async function incrementPublishedListingBuyerView(listingId: string): Promise<boolean> {
  return mutateListingById(listingId, mergePublishedListingAnalyticsView);
}

export async function incrementPublishedListingSaveDelta(
  listingId: string,
  delta: number,
): Promise<boolean> {
  if (delta === 0) return true;
  return mutateListingById(listingId, (row) =>
    mergePublishedListingAnalyticsSaveDelta(row, delta),
  );
}

export async function incrementPublishedListingBuyerEnquiry(listingId: string): Promise<boolean> {
  return mutateListingById(listingId, mergePublishedListingAnalyticsEnquiry);
}

/** Buyer confirmed Schedule inspection on live listing — appends booking on listing row. */
export async function appendInspectionBookingForListing(
  listingId: string,
  input: InspectionBookingInput,
): Promise<boolean> {
  return mutateListingById(listingId, (row) => {
    if (isPublishedListingArchived(row)) return row;
    if (resolvedPublishedListingStatus(row) === 'sold') return row;
    return mergePublishedListingAppendInspectionBooking(row, input);
  });
}

export function publishedToMobileHomeListing(p: PublishedAgentListing): MobileHomeListing {
  const a = p.listingAnalytics ?? emptyListingAnalytics();
  const views7d = sumBucketLastDays(a.viewsByDay, 7);
  const leads7d = sumBucketLastDays(a.enquiriesByDay, 7);
  return {
    id: p.id,
    title: p.titleLine,
    address: p.addressLine,
    priceRange: p.priceRangeDisplay,
    status: mobileHomeStatusFromPublished(p),
    /** Omit placeholder authority — home SOI/authority rows come from Postgres when synced. */
    authorityDaysLeft: null,
    beds: p.beds,
    baths: p.baths,
    landSqm: p.landSqm ?? 0,
    views7d,
    leads: leads7d,
    soiAttached: true,
  };
}

export function publishedToOffMarketMatch(p: PublishedAgentListing): MobileOffMarketMatch {
  return {
    id: p.id,
    title: p.titleLine,
    status: 'OFF-MARKET',
    matchPercent: 100,
    priceRange: p.priceRangeDisplay,
    beds: p.beds,
    baths: p.baths,
    landSqm: p.landSqm ?? 0,
  };
}

export function savedListingCardFromPublished(p: PublishedAgentListing): SavedListingCardData {
  const specLine = `${p.beds} bedrooms · ${p.baths} bathrooms · ${p.cars} car spaces`;
  const suburbShort = p.suburbLine.split(',')[0]?.trim() || p.suburbLine;
  const a = p.listingAnalytics ?? emptyListingAnalytics();
  const views7d = sumBucketLastDays(a.viewsByDay, 7);
  const viewsLabel = `${views7d} VIEWS (7D)`;
  const st = resolvedPublishedListingStatus(p);
  const badgeLeft = isPublishedListingArchived(p)
    ? 'ARCHIVED'
    : publishedListingStatusBadge(st);
  return {
    id: p.id,
    title: p.titleLine,
    street: p.streetLine,
    suburb: suburbShort,
    price: p.priceRangeDisplay,
    specLine,
    bedrooms: p.beds,
    bathrooms: p.baths,
    carSpaces: p.cars,
    badgeLeft,
    badgeRight: 'YOUR LISTING',
    footerLabels: ['NEW LISTING', viewsLabel, 'SOI ATTACHED'],
    imageIndex: thumbnailIndexFromListingId(p.id),
  };
}

/** Omit saved cards tied to archived agent-published listings (still on device). */
export function filterSavedListingsNotArchivedPublished(
  cards: SavedListingCardData[],
  publishedRows: PublishedAgentListing[],
): SavedListingCardData[] {
  return cards.filter((item) => {
    if (!item.id.startsWith('omm-')) return true;
    const p = publishedRows.find((x) => x.id === item.id);
    if (!p) return true;
    return !isPublishedListingArchived(p);
  });
}
