import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { SavedListingCardData } from '@/lib/saved-listings';

const STORAGE_KEY = 'omm_saved_listing_cards_v1';

async function readStored(): Promise<SavedListingCardData[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCard);
  } catch {
    return [];
  }
}

function isValidCard(x: unknown): x is SavedListingCardData {
  if (x === null || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== 'string' || !o.id) return false;
  if (typeof o.title !== 'string') return false;
  if (typeof o.price !== 'string') return false;
  if (typeof o.beds !== 'string') return false;
  if (typeof o.badgeLeft !== 'string') return false;
  if (typeof o.badgeRight !== 'string') return false;
  if (!Array.isArray(o.footerLabels) || o.footerLabels.length !== 3) return false;
  if (typeof o.footerLabels[0] !== 'string' || typeof o.footerLabels[1] !== 'string' || typeof o.footerLabels[2] !== 'string') {
    return false;
  }
  if (typeof o.imageIndex !== 'number' || !Number.isFinite(o.imageIndex)) return false;
  return true;
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
      const next = has ? listings.filter((l) => l.id !== card.id) : [...listings, card];
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
