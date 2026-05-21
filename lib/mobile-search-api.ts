import type { MobileHomeListing } from '@/lib/mobile-home-api';
import { apiFetch } from '@/lib/api';

type ApiOffMarketMatch = {
  id: string;
  title: string;
  status: string;
  priceRange: string;
  beds: number;
  baths: number;
  landSqm: number;
};

type ApiListingRow = {
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

function record(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function parseListingRow(v: unknown): MobileHomeListing | null {
  if (!record(v)) return null;
  const id = typeof v.id === 'string' ? v.id : '';
  if (!id) return null;
  return {
    id,
    title: typeof v.title === 'string' ? v.title : '—',
    address: typeof v.address === 'string' ? v.address : '',
    priceRange: typeof v.priceRange === 'string' ? v.priceRange : '—',
    status: typeof v.status === 'string' ? v.status : 'ACTIVE',
    authorityDaysLeft:
      typeof v.authorityDaysLeft === 'number' && Number.isFinite(v.authorityDaysLeft)
        ? Math.trunc(v.authorityDaysLeft)
        : null,
    beds: typeof v.beds === 'number' && Number.isFinite(v.beds) ? Math.trunc(v.beds) : 0,
    baths: typeof v.baths === 'number' && Number.isFinite(v.baths) ? Math.trunc(v.baths) : 0,
    landSqm: typeof v.landSqm === 'number' && Number.isFinite(v.landSqm) ? Math.trunc(v.landSqm) : 0,
    views7d: typeof v.views7d === 'number' && Number.isFinite(v.views7d) ? Math.trunc(v.views7d) : 0,
    leads: typeof v.leads === 'number' && Number.isFinite(v.leads) ? Math.trunc(v.leads) : 0,
    soiAttached: Boolean(v.soiAttached),
  };
}

function offMarketToMobileHome(m: ApiOffMarketMatch): MobileHomeListing {
  return {
    id: m.id,
    title: m.title,
    address: m.title,
    priceRange: m.priceRange,
    status: m.status,
    authorityDaysLeft: null,
    beds: m.beds,
    baths: m.baths,
    landSqm: m.landSqm,
    views7d: 0,
    leads: 0,
    soiAttached: false,
  };
}

function parseOffMarket(v: unknown): ApiOffMarketMatch | null {
  if (!record(v)) return null;
  const id = typeof v.id === 'string' ? v.id : '';
  if (!id) return null;
  return {
    id,
    title: typeof v.title === 'string' ? v.title : '—',
    status: typeof v.status === 'string' ? v.status : 'OFF-MARKET',
    priceRange: typeof v.priceRange === 'string' ? v.priceRange : '—',
    beds: typeof v.beds === 'number' && Number.isFinite(v.beds) ? Math.trunc(v.beds) : 0,
    baths: typeof v.baths === 'number' && Number.isFinite(v.baths) ? Math.trunc(v.baths) : 0,
    landSqm: typeof v.landSqm === 'number' && Number.isFinite(v.landSqm) ? Math.trunc(v.landSqm) : 0,
  };
}

/**
 * Postgres-backed buyer search via `GET /api/mobile/search?q=`.
 * Merges on-market rows + pre-market (off-market) matches; dedupes by id.
 */
export async function fetchBuyerSearchCatalogFromApi(
  getToken: () => Promise<string | null>,
  query: string,
  init: RequestInit = {},
): Promise<MobileHomeListing[] | null> {
  const q = query.trim();
  if (!q) return null;

  const params = new URLSearchParams();
  params.set('q', q);

  try {
    const res = await apiFetch(
      `/api/mobile/search?${params.toString()}`,
      getToken,
      {
        method: 'GET',
        ...init,
      },
    );
    if (!res.ok) return null;

    const json = (await res.json()) as {
      activeListings?: unknown;
      offMarketMatches?: unknown;
    };

    const seen = new Set<string>();
    const out: MobileHomeListing[] = [];

    const active = Array.isArray(json.activeListings) ? json.activeListings : [];
    for (const row of active) {
      const m = parseListingRow(row);
      if (m && !seen.has(m.id)) {
        seen.add(m.id);
        out.push(m);
      }
    }

    const om = Array.isArray(json.offMarketMatches) ? json.offMarketMatches : [];
    for (const row of om) {
      const raw = parseOffMarket(row);
      if (!raw || seen.has(raw.id)) continue;
      seen.add(raw.id);
      out.push(offMarketToMobileHome(raw));
    }

    return out;
  } catch {
    return null;
  }
}
