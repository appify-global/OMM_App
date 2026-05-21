import { apiFetch, getExpoMobileApiBase } from '@/lib/api';
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

export type PublishListingApiResult =
  | { ok: true; listingId: string; listing: PublishedAgentListing | null }
  | { ok: false; status: number; error: string };

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

function responseBodyLooksHtml(body: string): boolean {
  const t = body.trimStart().slice(0, 120).toLowerCase();
  return (
    t.startsWith('<!doctype') ||
    t.startsWith('<html') ||
    body.includes('/_next/static/')
  );
}

async function readApiErrorBody(res: Response): Promise<string> {
  let raw = '';
  try {
    raw = await res.text();
    const parsed = JSON.parse(raw) as { error?: string; reason?: string };
    if (typeof parsed.error === 'string' && parsed.error.trim()) {
      return parsed.reason?.trim()
        ? `${parsed.error} (${parsed.reason})`
        : parsed.error;
    }
  } catch {
    /* use raw fallback */
  }

  if (raw.trim()) {
    if (responseBodyLooksHtml(raw)) {
      if (res.status === 404) {
        return 'Server returned HTML (route not found). Point EXPO_PUBLIC_WEB_ORIGIN at your Next.js app (e.g. http://127.0.0.1:3101) and ensure `npm run dev` runs with `apps/web/app/api/mobile/*` present.';
      }
      if (res.status >= 500) {
        return [
          `Server crashed (${res.status}) and returned HTML instead of JSON.`,
          'Fix: (1) In the Terminal running `npm run dev` for apps/web, read the stack trace.',
          '(2) Set DATABASE_URL (+ CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET) in apps/web/.env.local and ensure Postgres is running.',
          '(3) Restart Next after middleware/api changes.',
        ].join(' ');
      }
      return `Unexpected HTML response (${res.status}) — wrong API URL or mobile routes missing on this host.`;
    }
    return raw.trim().slice(0, 200);
  }

  switch (res.status) {
    case 401:
      return 'Unauthorized — sign in again in the app.';
    case 503:
      return 'Database not ready — add CLERK_SECRET_KEY and DATABASE_URL in apps/web/.env.local (see apps/web/.env.local.example), run Postgres, then `cd apps/web && npm run db:push`. Restart `npm run dev`.';
    case 424:
      return 'User record missing — add CLERK_SECRET_KEY in apps/web/.env.local (must match your Expo Clerk app).';
    default:
      return `Request failed (${res.status})`;
  }
}

/** POST live listing — never silently fail when the server returns an error. */
export async function publishListingToApi(
  getToken: () => Promise<string | null>,
  input: PublishListingApiInput,
): Promise<PublishListingApiResult | null> {
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
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: await readApiErrorBody(res),
      };
    }
    const json = (await res.json()) as {
      listingId?: string;
      listing?: unknown;
    };
    if (typeof json.listingId !== 'string') {
      return {
        ok: false,
        status: res.status,
        error: 'Server response missing listingId',
      };
    }
    return {
      ok: true,
      listingId: json.listingId,
      listing: json.listing ? parseListing(json.listing) : null,
    };
  } catch (e) {
    const base = getExpoMobileApiBase();
    const msg =
      e instanceof TypeError && e.message === 'Network request failed'
        ? [
            'Network error — the app could not reach the API server.',
            base
              ? `Trying: ${base}/api/mobile/published-listings`
              : 'Set EXPO_PUBLIC_MOBILE_API_ORIGIN in repo-root `.env` (e.g. http://127.0.0.1:3101).',
            'Start the shared backend: `npm run dev` (Next.js on port 3101). Restart Expo after `.env` changes.',
          ].join(' ')
        : e instanceof Error
          ? e.message
          : 'Network error';
    return { ok: false, status: 0, error: msg };
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
