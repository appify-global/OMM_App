import type { ImageSourcePropType } from 'react-native';

import type { PublishedAgentListing } from '@/lib/agent-published-listings';
import {
  isPublishedListingArchived,
  listingHeroImageSource,
  resolvedPublishedListingStatus,
  sumBucketLastDays,
} from '@/lib/agent-published-listings';
import type { SavedListingCardData } from '@/lib/saved-listings';
import {
  DEMO_PRIMARY_LISTING_TITLE,
  DEMO_PRIMARY_STREET,
} from '@/lib/melbourne-demo-locations';
import { AGENT_IMG, PROPERTY_IMG_1, propertyImageAtIndex } from '@/lib/propertyImages';
import {
  ensureMessageThread,
  relativeTimeFromIso,
  sheetTimeFromIso,
  threadThumbSource,
  type StoredThread,
} from '@/lib/omm-messages';

export type ActivityPerspective = 'buyer' | 'seller';

/** Chips excluding All — drives filtering on Activities. */
export type ActivityCategoryChip = 'offers' | 'inspections' | 'messages';

export type ActivityFeedKind = 'message' | 'inspection';

export type ActivityFeedRow = {
  id: string;
  kind: ActivityFeedKind;
  categories: ActivityCategoryChip[];
  title: string;
  subtitle: string;
  time: string;
  sheetTitle: string;
  sheetSubtitle: string;
  sheetBody: string;
  sheetTime?: string;
  /** Navigate to agent-published listing detail when present */
  listingId?: string;
  /** Persisted OMM message thread */
  threadId?: string;
  thumbSource?: ImageSourcePropType;
};

export function activityMatchesFilter(
  row: ActivityFeedRow,
  filter: 'all' | ActivityCategoryChip,
): boolean {
  if (filter === 'all') return true;
  return row.categories.includes(filter);
}

function parseDayKeyMs(dayKey: string): number {
  const [y, m, d] = dayKey.split('-').map(Number);
  if (!y || !m || !d) return 0;
  return new Date(y, m - 1, d).getTime();
}

/** Relative label from calendar day key (local midnight anchor). */
export function relativeLabelFromDayKey(dayKey: string): string {
  const t = parseDayKeyMs(dayKey);
  if (!t) return '—';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(t);
  day.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1d';
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
  return `${Math.floor(diffDays / 30)}mo`;
}

function latestAnalyticsDayKey(listing: PublishedAgentListing): string | null {
  const a = listing.listingAnalytics;
  if (!a) return null;
  const keys = new Set([
    ...Object.keys(a.viewsByDay ?? {}),
    ...Object.keys(a.savesByDay ?? {}),
    ...Object.keys(a.enquiriesByDay ?? {}),
  ]);
  let best: string | null = null;
  for (const k of keys) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
    const v =
      (a.viewsByDay?.[k] ?? 0) + (a.savesByDay?.[k] ?? 0) + (a.enquiriesByDay?.[k] ?? 0);
    if (v <= 0) continue;
    if (best == null || k > best) best = k;
  }
  return best;
}

function sellerPulseRow(listing: PublishedAgentListing): ActivityFeedRow | null {
  if (isPublishedListingArchived(listing)) return null;
  const a = listing.listingAnalytics;
  if (!a) return null;

  const enq7 = sumBucketLastDays(a.enquiriesByDay ?? {}, 7);
  const saves7 = sumBucketLastDays(a.savesByDay ?? {}, 7);
  const views7 = sumBucketLastDays(a.viewsByDay ?? {}, 7);
  if (enq7 + saves7 + views7 === 0) return null;

  const latestDay = latestAnalyticsDayKey(listing);
  const timeLabel = latestDay ? relativeLabelFromDayKey(latestDay) : 'Recently';
  const thumb = listingHeroImageSource(listing);

  let title: string;
  let subtitle: string;
  let sheetBody: string;
  let categories: ActivityCategoryChip[];

  if (enq7 > 0) {
    title = 'Buyer enquiry';
    subtitle = `${listing.titleLine} · ${enq7} buyer signal${enq7 === 1 ? '' : 's'} (7 days)`;
    sheetBody = `Buyers contacted or expressed interest on this listing in the last week (${enq7} enquiry signal${enq7 === 1 ? '' : 's'} logged on-device).\n\nViews (7d): ${views7}\nSaves (7d): ${saves7}`;
    categories = ['messages', 'offers'];
  } else if (saves7 > 0) {
    title = 'Listing saves';
    subtitle = `${listing.titleLine} · ${saves7} save${saves7 === 1 ? '' : 's'} this week`;
    sheetBody = `Buyers saved this listing ${saves7} time${saves7 === 1 ? '' : 's'} in the last 7 days (device-local analytics until marketplace sync).\n\nViews (7d): ${views7}`;
    categories = ['offers'];
  } else {
    title = 'Listing views';
    subtitle = `${listing.titleLine} · ${views7} buyer view${views7 === 1 ? '' : 's'} (7 days)`;
    sheetBody = `Your listing picked up ${views7} buyer view${views7 === 1 ? '' : 's'} in the last week — tracked on this device when buyers open the live listing.`;
    categories = ['messages'];
  }

  return {
    id: `seller-pulse-${listing.id}`,
    kind: 'message',
    categories,
    title,
    subtitle,
    time: timeLabel,
    sheetTitle: title,
    sheetSubtitle: listing.titleLine,
    sheetBody,
    sheetTime: latestDay ? `Last activity · ${latestDay}` : undefined,
    listingId: listing.id,
    thumbSource: thumb,
  };
}

function sortSellerRows(rows: ActivityFeedRow[], listings: PublishedAgentListing[]): ActivityFeedRow[] {
  const rank = new Map<string, number>();
  for (const L of listings) {
    const day = latestAnalyticsDayKey(L);
    const ms = day ? parseDayKeyMs(day) : Date.parse(L.publishedAt);
    rank.set(`seller-pulse-${L.id}`, ms);
    for (const b of L.localInspectionBookings ?? []) {
      const bookedMs = Date.parse(b.bookedAtIso);
      rank.set(`seller-insp-${b.id}`, Number.isFinite(bookedMs) ? bookedMs : 0);
    }
  }
  return [...rows].sort((a, b) => (rank.get(b.id) ?? 0) - (rank.get(a.id) ?? 0));
}

function calendarDayKeyFromIsoLocal(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function inspectionAprilDetailLine(aprilDay2026: number, slotLabel: string): string {
  const d = new Date(2026, 3, aprilDay2026);
  const w = d.toLocaleDateString('en-AU', { weekday: 'short' }).replace(/\.$/, '');
  return `${w} ${aprilDay2026} Apr · ${slotLabel}`;
}

/** Real inspection bookings from live listings (seller Activities). */
function sellerInspectionBookingRows(listings: PublishedAgentListing[]): ActivityFeedRow[] {
  const ACTIVITY_BOOKING_WINDOW_MS = 90 * 86_400_000;
  const cutoff = Date.now() - ACTIVITY_BOOKING_WINDOW_MS;
  const rows: ActivityFeedRow[] = [];

  for (const L of listings) {
    if (isPublishedListingArchived(L)) continue;
    const st = resolvedPublishedListingStatus(L);
    if (st === 'sold') continue;

    for (const b of L.localInspectionBookings ?? []) {
      const t = Date.parse(b.bookedAtIso);
      if (!Number.isFinite(t) || t < cutoff) continue;

      const dayKey = calendarDayKeyFromIsoLocal(b.bookedAtIso);
      const timeLabel = dayKey ? relativeLabelFromDayKey(dayKey) : 'Recently';
      const detail = inspectionAprilDetailLine(b.aprilDay2026, b.slotLabel);

      rows.push({
        id: `seller-insp-${b.id}`,
        kind: 'inspection',
        categories: ['inspections'],
        title: 'Inspection scheduled',
        subtitle: `${L.titleLine} · Buyer booked`,
        time: timeLabel,
        sheetTitle: 'Inspection scheduled',
        sheetSubtitle: L.titleLine,
        sheetBody: `${detail}\n\nBuyer requested this slot from your live listing (saved on this device until CRM sync ships).`,
        sheetTime: `Requested · ${new Date(b.bookedAtIso).toLocaleString('en-AU', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}`,
        listingId: L.id,
        thumbSource: listingHeroImageSource(L),
      });
    }
  }

  return rows;
}

const DEMO_SELLER_FALLBACK: ActivityFeedRow[] = [
  {
    id: 'demo-seller-msg-1',
    kind: 'message',
    categories: ['messages', 'offers'],
    title: 'M. Patel',
    subtitle: 'Offer $2.35m — vendor wants $2.42m walk-away.',
    time: '2m',
    sheetTitle: 'M. Patel',
    sheetSubtitle: `Real Estate Agent · ${DEMO_PRIMARY_LISTING_TITLE}`,
    sheetBody:
      'Thanks for your offer. It is below what the seller will accept for this property. They are open to a counter closer to the list price.',
    sheetTime: '2 minutes ago',
    threadId: 'thread-demo-patel',
    thumbSource: AGENT_IMG,
  },
  {
    id: 'demo-seller-inspection-1',
    kind: 'inspection',
    categories: ['inspections'],
    title: 'Inspection scheduled',
    subtitle: `You've booked 137, Art Colony, Colling……`,
    time: '8h',
    sheetTitle: 'Inspection scheduled',
    sheetSubtitle: DEMO_PRIMARY_STREET,
    sheetBody:
      'Sat 26 Apr · 10:30—11:15 · Buyer tour · Arrive 10:20 for check-in.',
    thumbSource: PROPERTY_IMG_1,
  },
];

const DEMO_BUYER_THREADS: ActivityFeedRow[] = [
  {
    id: 'demo-buyer-thread-patel',
    kind: 'message',
    categories: ['messages', 'offers'],
    title: 'M. Patel',
    subtitle: 'Offer $2.35m — vendor wants $2.42m walk-away.',
    time: '2m',
    sheetTitle: 'M. Patel',
    sheetSubtitle: `Real Estate Agent · ${DEMO_PRIMARY_LISTING_TITLE}`,
    sheetBody:
      'Thanks for your offer. It is below what the seller will accept for this property. They are open to a counter closer to the list price.',
    sheetTime: '2 minutes ago',
    threadId: 'thread-demo-patel',
    thumbSource: AGENT_IMG,
  },
  {
    id: 'demo-buyer-thread-lin',
    kind: 'message',
    categories: ['messages'],
    title: 'Sarah Lin',
    subtitle: 'Floorplan v2 is in the data room — want a walk-through?',
    time: '1d',
    sheetTitle: 'Sarah Lin',
    sheetSubtitle: 'Jellis Craig · Camberwell',
    sheetBody:
      'Floorplan v2 is in the data room — want a walk-through? I can do a 15-min video tonight.',
    sheetTime: 'Yesterday',
    threadId: 'thread-demo-lin',
    thumbSource: AGENT_IMG,
  },
];

const DEMO_BUYER_INSPECTION: ActivityFeedRow = {
  id: 'demo-buyer-inspection-1',
  kind: 'inspection',
  categories: ['inspections'],
  title: 'Inspection scheduled',
  subtitle: "You've booked 137, Art Colony, Colling……",
  time: '8h',
  sheetTitle: 'Inspection scheduled',
  sheetSubtitle: DEMO_PRIMARY_STREET,
  sheetBody: 'Sat 26 Apr · 10:30—11:15 · Buyer tour · Arrive 10:20 for check-in.',
  thumbSource: PROPERTY_IMG_1,
};

function savedListingActivity(saved: SavedListingCardData, index: number): ActivityFeedRow {
  const thumb = propertyImageAtIndex(saved.imageIndex);
  const label = index === 0 ? 'Just saved' : index === 1 ? 'Recently saved' : 'Saved';
  return {
    id: `buyer-saved-${saved.id}`,
    kind: 'message',
    categories: ['messages', 'offers'],
    title: 'Saved property',
    subtitle: `${saved.title} · ${saved.price}`,
    time: label,
    sheetTitle: 'Saved property',
    sheetSubtitle: `${saved.title}${saved.suburb ? ` · ${saved.suburb}` : ''}`,
    sheetBody: `You saved this listing from search or a live card. Open it anytime from Saved properties.\n\n${saved.specLine}`,
    listingId: saved.id,
    thumbSource: thumb,
  };
}

function threadToActivityRow(
  thread: StoredThread,
  listings: PublishedAgentListing[],
): ActivityFeedRow {
  const listing = thread.listingId
    ? listings.find((l) => l.id === thread.listingId)
    : undefined;
  const lastInbound = [...thread.messages].reverse().find((m) => m.direction === 'inbound');
  const last = thread.messages[thread.messages.length - 1];
  const displayBody = lastInbound?.body ?? last?.body ?? thread.preview;

  return {
    id: `activity-${thread.id}`,
    kind: 'message',
    categories: thread.perspective === 'seller' ? ['messages', 'offers'] : ['messages'],
    title: thread.participantName,
    subtitle: thread.preview,
    time: relativeTimeFromIso(thread.lastMessageAtIso),
    sheetTitle: thread.participantName,
    sheetSubtitle: thread.participantSubtitle,
    sheetBody: displayBody,
    sheetTime: last ? sheetTimeFromIso(last.sentAtIso) : undefined,
    threadId: thread.id,
    listingId: thread.listingId,
    thumbSource: threadThumbSource(thread, listing),
  };
}

export function buildActivitiesFeed(input: {
  perspective: ActivityPerspective;
  listings: PublishedAgentListing[];
  savedListings: SavedListingCardData[];
  messageThreads?: StoredThread[];
}): ActivityFeedRow[] {
  const messageRows = (input.messageThreads ?? [])
    .filter((t) => t.perspective === input.perspective)
    .map((t) => threadToActivityRow(t, input.listings));

  if (input.perspective === 'seller') {
    const pulses = input.listings
      .map(sellerPulseRow)
      .filter((r): r is ActivityFeedRow => r != null);
    const bookingRows = sellerInspectionBookingRows(input.listings);
    const sorted = sortSellerRows([...messageRows, ...bookingRows, ...pulses], input.listings);
    if (sorted.length === 0) return [...DEMO_SELLER_FALLBACK];
    return sorted;
  }

  const savedRows = input.savedListings.slice(0, 8).map(savedListingActivity);
  const merged =
    messageRows.length > 0
      ? [...messageRows, ...savedRows, DEMO_BUYER_INSPECTION]
      : [...savedRows, ...DEMO_BUYER_THREADS, DEMO_BUYER_INSPECTION];

  const seen = new Set<string>();
  const out: ActivityFeedRow[] = [];
  for (const r of merged) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

export async function ensureThreadFromActivityRow(row: ActivityFeedRow): Promise<string> {
  if (row.threadId) return row.threadId;

  const thread = await ensureMessageThread({
    perspective: row.categories.includes('offers') ? 'seller' : 'buyer',
    participantName: row.sheetTitle,
    participantSubtitle: row.sheetSubtitle,
    contextLine: row.sheetSubtitle,
    listingId: row.listingId,
    seedInboundBody: row.sheetBody,
  });
  return thread.id;
}
