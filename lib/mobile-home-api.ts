import { apiFetch } from '@/lib/api';
import type { AgentHomeMetricsPayload } from '@/lib/agent-home-metrics';

/** Matches `Listing` fixture shape from `/api/mobile/home`. */
export type MobileHomeListing = {
  id: string;
  title: string;
  address: string;
  priceRange: string;
  status: string;
  authorityDaysLeft: number | null;
  beds: number;
  baths: number;
  landSqm: number;
  views7d: number;
  leads: number;
  soiAttached: boolean;
};

export type MobileAuthorityItem = {
  id: string;
  title: string;
  address: string;
  daysLeft: number;
};

export type MobileSoiReminder = {
  id: string;
  titleLine: string;
  subtitleLine: string;
  needsSoi: boolean;
};

/** Saved-search row mirrors web fixture `SavedSearch`-like API payloads. */
export type MobileSavedSearch = {
  id: string;
  title: string;
  criteria: string;
  alertsOn: boolean;
  newCount: number;
};

export type MobileOffMarketMatch = {
  id: string;
  title: string;
  status: 'OFF-MARKET' | 'PRIVATE' | 'EXCLUSIVE';
  matchPercent: number;
  priceRange: string;
  beds: number;
  baths: number;
  landSqm: number;
};

export type MobileHomePayload = {
  userFirstName: string;
  selling: {
    activeListings: MobileHomeListing[];
    authorityExpiringSoon: MobileAuthorityItem[];
    draftCount: number;
    preMarketCount: number;
    soiReminderListings: MobileSoiReminder[];
    /** LIVE + PRE_MARKET + drafts; home carousel (omit if API omits field). */
    pipelineListings: MobileHomeListing[];
    newEnquiriesCount: number;
    totalViews7d: number;
  };
  buying: {
    savedSearches: MobileSavedSearch[];
    offMarketMatches: MobileOffMarketMatch[];
  };
};

function record(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function intField(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return fallback;
}

function optInt(v: unknown): number | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }
  return null;
}

function parseListing(v: unknown): MobileHomeListing | null {
  if (!record(v)) return null;
  const id = typeof v.id === 'string' ? v.id : '';
  if (!id) return null;
  return {
    id,
    title: typeof v.title === 'string' ? v.title : '—',
    address: typeof v.address === 'string' ? v.address : '',
    priceRange: typeof v.priceRange === 'string' ? v.priceRange : '—',
    status: typeof v.status === 'string' ? v.status : 'ACTIVE',
    authorityDaysLeft: optInt(v.authorityDaysLeft),
    beds: intField(v.beds, 0),
    baths: intField(v.baths, 0),
    landSqm: intField(v.landSqm, 0),
    views7d: intField(v.views7d, 0),
    leads: intField(v.leads, 0),
    soiAttached: Boolean(v.soiAttached),
  };
}

function parseAuthority(v: unknown): MobileAuthorityItem | null {
  if (!record(v)) return null;
  const id = typeof v.id === 'string' ? v.id : '';
  const daysLeft =
    typeof v.daysLeft === 'number' && Number.isFinite(v.daysLeft)
      ? Math.max(0, Math.floor(v.daysLeft))
      : null;
  if (!id || daysLeft === null) return null;
  return {
    id,
    title: typeof v.title === 'string' ? v.title : '—',
    address: typeof v.address === 'string' ? v.address : '',
    daysLeft,
  };
}

function parseSoiReminder(v: unknown): MobileSoiReminder | null {
  if (!record(v)) return null;
  const id = typeof v.id === 'string' ? v.id : '';
  const titleLine = typeof v.titleLine === 'string' ? v.titleLine : '';
  if (!id || !titleLine) return null;
  return {
    id,
    titleLine,
    subtitleLine:
      typeof v.subtitleLine === 'string' ? v.subtitleLine : '',
    needsSoi: Boolean(v.needsSoi),
  };
}

function parseSavedSearch(v: unknown): MobileSavedSearch | null {
  if (!record(v)) return null;
  const id = typeof v.id === 'string' ? v.id : '';
  const title = typeof v.title === 'string' ? v.title : '';
  if (!id || !title) return null;
  return {
    id,
    title,
    criteria: typeof v.criteria === 'string' ? v.criteria : '—',
    alertsOn: Boolean(v.alertsOn),
    newCount:
      typeof v.newCount === 'number' && Number.isFinite(v.newCount)
        ? Math.max(0, Math.floor(v.newCount))
        : 0,
  };
}

function parseOffMarketMatch(v: unknown): MobileOffMarketMatch | null {
  if (!record(v)) return null;
  const id = typeof v.id === 'string' ? v.id : '';
  if (!id) return null;
  const status =
    v.status === 'PRIVATE' || v.status === 'EXCLUSIVE' ? v.status : 'OFF-MARKET';
  const matchPercent =
    typeof v.matchPercent === 'number' && Number.isFinite(v.matchPercent)
      ? Math.round(v.matchPercent)
      : 0;
  return {
    id,
    title: typeof v.title === 'string' ? v.title : '—',
    status,
    matchPercent,
    priceRange: typeof v.priceRange === 'string' ? v.priceRange : '—',
    beds: typeof v.beds === 'number' ? v.beds : 0,
    baths: typeof v.baths === 'number' ? v.baths : 0,
    landSqm: typeof v.landSqm === 'number' ? v.landSqm : 0,
  };
}

/** Deterministic décor image index from a listing id. */
export function thumbnailIndexFromListingId(id: string, modulo = 12): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % modulo;
}

export function parseMobileHome(json: unknown): MobileHomePayload | null {
  if (!record(json)) return null;

  const first =
    typeof json.userFirstName === 'string' ? json.userFirstName : 'There';
  const selling = record(json.selling) ? json.selling : null;
  const buying = record(json.buying) ? json.buying : null;

  if (!selling || !buying) return null;

  const activeListings = Array.isArray(selling.activeListings)
    ? selling.activeListings.map(parseListing).filter(Boolean) as MobileHomeListing[]
    : [];

  const hpRaw =
    selling && 'homePipelineListings' in selling
      ? (selling as Record<string, unknown>).homePipelineListings
      : undefined;
  const pipelineListings = Array.isArray(hpRaw)
    ? hpRaw.map(parseListing).filter(Boolean) as MobileHomeListing[]
    : activeListings;

  const authorityExpiringSoon = Array.isArray(selling.authorityExpiringSoon)
    ? selling.authorityExpiringSoon
        .map(parseAuthority)
        .filter(Boolean) as MobileAuthorityItem[]
    : [];

  const draftCount =
    typeof selling.draftCount === 'number' && Number.isFinite(selling.draftCount)
      ? Math.max(0, Math.floor(selling.draftCount))
      : 0;
  const preMarketCount =
    typeof selling.preMarketCount === 'number' &&
    Number.isFinite(selling.preMarketCount)
      ? Math.max(0, Math.floor(selling.preMarketCount))
      : 0;

  const soiReminderListings = Array.isArray(selling.soiReminderListings)
    ? selling.soiReminderListings.map(parseSoiReminder).filter(Boolean) as MobileSoiReminder[]
    : [];

  const newEnquiriesCount =
    typeof selling.newEnquiriesCount === 'number' &&
    Number.isFinite(selling.newEnquiriesCount)
      ? Math.max(0, Math.floor(selling.newEnquiriesCount))
      : 0;

  const totalViews7d =
    typeof selling.totalViews7d === 'number' && Number.isFinite(selling.totalViews7d)
      ? Math.max(0, Math.floor(selling.totalViews7d))
      : 0;

  const savedSearches = Array.isArray(buying.savedSearches)
    ? buying.savedSearches.map(parseSavedSearch).filter(Boolean) as MobileSavedSearch[]
    : [];

  const offMarketMatches = Array.isArray(buying.offMarketMatches)
    ? buying.offMarketMatches
        .map(parseOffMarketMatch)
        .filter(Boolean) as MobileOffMarketMatch[]
    : [];

  return {
    userFirstName: first,
    selling: {
      activeListings,
      pipelineListings,
      authorityExpiringSoon,
      draftCount,
      preMarketCount,
      soiReminderListings,
      newEnquiriesCount,
      totalViews7d,
    },
    buying: {
      savedSearches,
      offMarketMatches,
    },
  };
}

/** Merge KPI row from catalogue payload with `/api/agent-home-metrics` (when shipped). */
export function deriveAgentMetricsFromHome(
  home: MobileHomePayload | null,
  baseline: AgentHomeMetricsPayload,
): AgentHomeMetricsPayload {
  if (!home) return baseline;
  return {
    ...baseline,
    activeListingsCount: home.selling.activeListings.length,
    pendingListingsCount: Math.max(
      0,
      home.selling.draftCount + home.selling.preMarketCount,
    ),
  };
}

export async function fetchMobileHome(
  getToken: () => Promise<string | null>,
): Promise<MobileHomePayload | null> {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base) return null;

  try {
    const res = await apiFetch('/api/mobile/home', getToken, { method: 'GET' });
    if (!res.ok) {
      if (__DEV__) {
        try {
          const t = await res.text();
          // eslint-disable-next-line no-console
          console.warn('[fetchMobileHome]', res.status, t.slice(0, 280));
        } catch {
          // eslint-disable-next-line no-console
          console.warn('[fetchMobileHome]', res.status);
        }
      }
      return null;
    }
    const json: unknown = await res.json();
    return parseMobileHome(json);
  } catch (e) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[fetchMobileHome] failed', e);
    }
    return null;
  }
}
