import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  VIEW_LIVE_LISTING_CARD,
  VIEW_LIVE_LISTING_ID,
  countsFromSpecLine,
  type SavedListingCardData,
} from '@/lib/saved-listings';

const STORAGE_KEY = 'omm_saved_listing_cards_v1';
/** One-shot migration: historical saves were appended (oldest first); reverse once so `[0]` is most recently saved. */
const STORAGE_ORDER_RECENT_FIRST_KEY = 'omm_saved_cards_recent_first_v1';

/** Demo listing id stays in sync with `VIEW_LIVE_LISTING_CARD` (copy + spec line + footers) after app updates. */
function withCanonicalDemoListing(rows: SavedListingCardData[]): SavedListingCardData[] {
  return rows.map((row) =>
    row.id === VIEW_LIVE_LISTING_ID ? { ...VIEW_LIVE_LISTING_CARD } : row,
  );
}

async function readStored(): Promise<SavedListingCardData[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const rows = parsed
      .map(parseSavedListingCard)
      .filter((row): row is SavedListingCardData => row !== null);

    let out = withCanonicalDemoListing(rows);

    try {
      if (JSON.stringify(out) !== JSON.stringify(rows)) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(out));
      }
    } catch {
      /* offline / quota */
    }

    try {
      const migrated = await AsyncStorage.getItem(STORAGE_ORDER_RECENT_FIRST_KEY);
      if (!migrated) {
        if (out.length > 1) out = [...out].reverse();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(out));
        await AsyncStorage.setItem(STORAGE_ORDER_RECENT_FIRST_KEY, '1');
      }
    } catch {
      /* offline / quota */
    }

    return out;
  } catch {
    return [];
  }
}

function parseSavedListingCard(x: unknown): SavedListingCardData | null {
  if (x === null || typeof x !== 'object') return null;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== 'string' || !o.id) return null;
  if (typeof o.title !== 'string') return null;
  if (typeof o.price !== 'string') return null;
  const specLine =
    typeof o.specLine === 'string'
      ? o.specLine
      : typeof o.beds === 'string'
        ? o.beds
        : null;
  if (!specLine) return null;
  if (typeof o.badgeLeft !== 'string') return null;
  if (typeof o.badgeRight !== 'string') return null;
  if (!Array.isArray(o.footerLabels) || o.footerLabels.length !== 3) return null;
  if (typeof o.footerLabels[0] !== 'string' || typeof o.footerLabels[1] !== 'string' || typeof o.footerLabels[2] !== 'string') {
    return null;
  }
  if (typeof o.imageIndex !== 'number' || !Number.isFinite(o.imageIndex)) return null;

  const parsedCounts = countsFromSpecLine(specLine);
  const bedrooms =
    typeof o.bedrooms === 'number' && Number.isFinite(o.bedrooms) ? o.bedrooms : parsedCounts.bedrooms;
  const bathrooms =
    typeof o.bathrooms === 'number' && Number.isFinite(o.bathrooms) ? o.bathrooms : parsedCounts.bathrooms;
  const carSpaces =
    typeof o.carSpaces === 'number' && Number.isFinite(o.carSpaces) ? o.carSpaces : parsedCounts.carSpaces;

  const street =
    typeof o.street === 'string' && o.street.trim().length > 0 ? o.street.trim() : o.title;
  const suburb = typeof o.suburb === 'string' ? o.suburb : '';

  return {
    id: o.id,
    title: o.title,
    street,
    suburb,
    price: o.price,
    specLine,
    bedrooms,
    bathrooms,
    carSpaces,
    badgeLeft: o.badgeLeft,
    badgeRight: o.badgeRight,
    footerLabels: [o.footerLabels[0], o.footerLabels[1], o.footerLabels[2]],
    imageIndex: o.imageIndex,
  };
}

type Ctx = {
  /** Loaded from storage; same reference updates when toggling */
  listings: SavedListingCardData[];
  ready: boolean;
  isSaved: (id: string) => boolean;
  toggleSaved: (card: SavedListingCardData) => Promise<void>;
  removeSaved: (id: string) => Promise<void>;
};

const SavedListingsContext = createContext<Ctx | null>(null);

export function SavedListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<SavedListingCardData[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    readStored().then((rows) => {
      if (!cancelled) setListings(rows);
    }).finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: SavedListingCardData[]) => {
    setListings(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* offline / quota */
    }
  }, []);

  const isSaved = useCallback(
    (id: string) => listings.some((l) => l.id === id),
    [listings],
  );

  const toggleSaved = useCallback(
    async (card: SavedListingCardData) => {
      const has = listings.some((l) => l.id === card.id);
      const withoutDup = listings.filter((l) => l.id !== card.id);
      /** Prepend newest save so Buying home can show `[0]` as most recently saved */
      const next = has ? withoutDup : [card, ...withoutDup];
      await persist(next);
    },
    [listings, persist],
  );

  const removeSaved = useCallback(
    async (id: string) => {
      await persist(listings.filter((l) => l.id !== id));
    },
    [listings, persist],
  );

  const value = useMemo(
    () => ({
      listings,
      ready,
      isSaved,
      toggleSaved,
      removeSaved,
    }),
    [listings, ready, isSaved, toggleSaved, removeSaved],
  );

  return <SavedListingsContext.Provider value={value}>{children}</SavedListingsContext.Provider>;
}

export function useSavedListings(): Ctx {
  const ctx = useContext(SavedListingsContext);
  if (!ctx) {
    throw new Error('useSavedListings must be used within SavedListingsProvider');
  }
  return ctx;
}
