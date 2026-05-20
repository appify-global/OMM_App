import { apiFetch } from '@/lib/api';
import type {
  NewPublishedListingInput,
  PublishedAgentListing,
  PublishedListingAnalytics,
  PublishedInspectionBooking,
} from '@/lib/agent-published-listings';
import type { ListingDetailsSnapshot } from '@/lib/agent-published-listings';
import type { InspectionAvailabilityTags } from '@/lib/listing-inspection-availability';
import { isMobileApiConfigured } from '@/lib/mobile-api-config';

export { isMobileApiConfigured };

function record(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function parseListing(v: unknown): PublishedAgentListing | null {
  if (!record(v)) return null;
  if (typeof v.id !== 'string' || typeof v.publishedAt !== 'string') return null;
  return v as unknown as PublishedAgentListing;
}

export async function fetchPublishedListingsFromApi(
  getToken: () => Promise<string | null>,
): Promise<PublishedAgentListing[] | null> {
  if (!isMobileApiConfigured()) return null;
  try {
    const res = await apiFetch('/api/mobile/published-listings', getToken, { method: 'GET' });
    if (!res.ok) return null;
    const json = (await res.json()) as { listings?: unknown };
    if (!Array.isArray(json.listings)) return [];
    return json.listings.map(parseListing).filter((r): r is PublishedAgentListing => r !== null);
  } catch {
    return null;
  }
}

export type PublishListingApiInput = {
  details: ListingDetailsSnapshot;
  listingPriceFromAud: number | null;
  listingPriceToAud: number | null;
  addressDisclosure: 'disclose' | 'not_disclose';
  sellerInspectionAvailability?: string;
  sellerInspectionAvailabilityTags?: InspectionAvailabilityTags;
  sellerInspectionAvailabilityNotes?: string;
  draftPhotos?: { uri: string; id?: string }[];
  draftFloorPlan?: { uri: string; name?: string } | null;
};

export async function publishListingToApi(
  getToken: () => Promise<string | null>,
  input: PublishListingApiInput,
): Promise<{ listingId: string; listing: PublishedAgentListing | null } | null> {
  if (!isMobileApiConfigured()) return null;

  const media = [
    ...(input.draftPhotos ?? []).map((p, i) => ({
      kind: 'PHOTO' as const,
      url: p.uri,
      position: i,
    })),
    ...(input.draftFloorPlan?.uri
      ? [
          {
            kind: 'FLOOR_PLAN' as const,
            url: input.draftFloorPlan.uri,
            caption: input.draftFloorPlan.name ?? 'Floor plan',
            position: 999,
          },
        ]
      : []),
  ];

  try {
    const res = await apiFetch('/api/mobile/published-listings', getToken, {
      method: 'POST',
      body: JSON.stringify({
        details: input.details,
        listingPriceFromAud: input.listingPriceFromAud,
        listingPriceToAud: input.listingPriceToAud,
        addressDisclosure: input.addressDisclosure,
        sellerInspectionAvailability: input.sellerInspectionAvailability,
        sellerInspectionAvailabilityTags: input.sellerInspectionAvailabilityTags,
        sellerInspectionAvailabilityNotes: input.sellerInspectionAvailabilityNotes,
        status: 'LIVE',
        media: media.length ? media : undefined,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      listingId?: string;
      listing?: unknown;
    };
    if (typeof json.listingId !== 'string') return null;
    return {
      listingId: json.listingId,
      listing: json.listing ? parseListing(json.listing) : null,
    };
  } catch {
    return null;
  }
}

export type ListingMobileMetaPatch = {
  listingAnalytics?: PublishedListingAnalytics;
  localInspectionBookings?: PublishedInspectionBooking[];
  listingStatus?: PublishedAgentListing['listingStatus'];
  soldMarkedAt?: string;
  archivedAt?: string;
};

export async function patchListingOnApi(
  getToken: () => Promise<string | null>,
  listingId: string,
  patch: ListingMobileMetaPatch & { action?: 'buyer_enquiry' },
): Promise<boolean> {
  if (!isMobileApiConfigured()) return false;
  try {
    const res = await apiFetch(`/api/mobile/published-listings/${listingId}`, getToken, {
      method: 'PATCH',
      body: JSON.stringify({
        action: patch.action,
        mobileMeta: {
          listingAnalytics: patch.listingAnalytics,
          localInspectionBookings: patch.localInspectionBookings,
          listingStatus: patch.listingStatus,
          soldMarkedAt: patch.soldMarkedAt,
          archivedAt: patch.archivedAt,
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Merge device-only fields onto API rows when PATCH partially failed. */
export function mergeListingOverlays(
  apiRows: PublishedAgentListing[],
  localRows: PublishedAgentListing[],
): PublishedAgentListing[] {
  const localById = new Map(localRows.map((r) => [r.id, r]));
  return apiRows.map((api) => {
    const local = localById.get(api.id);
    if (!local) return api;
    return {
      ...api,
      listingAnalytics: local.listingAnalytics ?? api.listingAnalytics,
      localInspectionBookings:
        local.localInspectionBookings ?? api.localInspectionBookings,
      soldMarkedAt: local.soldMarkedAt ?? api.soldMarkedAt,
      archivedAt: local.archivedAt ?? api.archivedAt,
      listingStatus: local.listingStatus ?? api.listingStatus,
    };
  });
}

export type { NewPublishedListingInput };
