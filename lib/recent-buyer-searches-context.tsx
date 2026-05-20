import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  prependRecentBuyerSearchQuery,
  readRecentBuyerSearchesStored,
  writeRecentBuyerSearchesStored,
  type RecentBuyerSearchRow,
} from '@/lib/recent-buyer-searches';

export type { RecentBuyerSearchRow };

type Ctx = {
  recent: RecentBuyerSearchRow[];
  ready: boolean;
  /** Persist query when buyer opens Explore / lands from saved-search deep link (trimmed). */
  recordBuyerExplore: (rawQuery: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const RecentBuyerSearchesContext = createContext<Ctx | null>(null);

export function RecentBuyerSearchesProvider({ children }: { children: ReactNode }) {
  const [recent, setRecent] = useState<RecentBuyerSearchRow[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const rows = await readRecentBuyerSearchesStored();
    setRecent(rows);
  }, []);

  useEffect(() => {
    readRecentBuyerSearchesStored()
      .then(setRecent)
      .finally(() => setReady(true));
  }, []);

  const recordBuyerExplore = useCallback(async (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed.length) return;
    const prev = await readRecentBuyerSearchesStored();
    const next = prependRecentBuyerSearchQuery(prev, trimmed);
    setRecent(next);
    await writeRecentBuyerSearchesStored(next);
  }, []);

  const value = useMemo(
    () => ({
      recent,
      ready,
      recordBuyerExplore,
      refresh,
    }),
    [recent, ready, recordBuyerExplore, refresh],
  );

  return (
    <RecentBuyerSearchesContext.Provider value={value}>
      {children}
    </RecentBuyerSearchesContext.Provider>
  );
}

export function useRecentBuyerSearches(): Ctx {
  const ctx = useContext(RecentBuyerSearchesContext);
  if (!ctx) {
    throw new Error('useRecentBuyerSearches must be used within RecentBuyerSearchesProvider');
  }
  return ctx;
}
