import AsyncStorage from '@react-native-async-storage/async-storage';
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
  criteriaLineForSavedSearch,
  newSavedSearchId,
  normalizeSearchKey,
  titleFromSearchQuery,
  type SavedSearchRecord,
} from '@/lib/saved-searches';

const STORAGE_KEY = 'omm_saved_searches_v1';
const STORAGE_ORDER_FIXED_KEY = 'omm_saved_searches_recent_first_v1';

function parseRow(x: unknown): SavedSearchRecord | null {
  if (x === null || typeof x !== 'object') return null;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== 'string' || !o.id) return null;
  if (typeof o.title !== 'string') return null;
  if (typeof o.criteria !== 'string') return null;
  if (typeof o.suburbQuery !== 'string') return null;
  if (typeof o.alertsOn !== 'boolean') return null;
  const newCount =
    typeof o.newCount === 'number' && Number.isFinite(o.newCount)
      ? Math.max(0, Math.floor(o.newCount))
      : 0;
  const createdAtMs =
    typeof o.createdAtMs === 'number' && Number.isFinite(o.createdAtMs)
      ? o.createdAtMs
      : Date.now();
  const updatedAtMs =
    typeof o.updatedAtMs === 'number' && Number.isFinite(o.updatedAtMs)
      ? o.updatedAtMs
      : createdAtMs;
  return {
    id: o.id,
    title: o.title,
    criteria: o.criteria,
    suburbQuery: o.suburbQuery,
    alertsOn: o.alertsOn,
    newCount,
    createdAtMs,
    updatedAtMs,
  };
}

export async function readSavedSearchesStored(): Promise<SavedSearchRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    let out = parsed.map(parseRow).filter((r): r is SavedSearchRecord => r !== null);

    try {
      const fixed = await AsyncStorage.getItem(STORAGE_ORDER_FIXED_KEY);
      if (!fixed && out.length > 1) {
        out = [...out].reverse();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(out));
      }
      if (!fixed) await AsyncStorage.setItem(STORAGE_ORDER_FIXED_KEY, '1');
    } catch {
      /* quota */
    }

    return out;
  } catch {
    return [];
  }
}

function upsertIntoList(prev: SavedSearchRecord[], nextRow: SavedSearchRecord): SavedSearchRecord[] {
  const key = normalizeSearchKey(nextRow.suburbQuery || nextRow.title);
  const ix = prev.findIndex((s) => normalizeSearchKey(s.suburbQuery || s.title) === key);
  if (ix >= 0) return [nextRow, ...prev.filter((_, i) => i !== ix)];
  return [nextRow, ...prev];
}

type Ctx = {
  searches: SavedSearchRecord[];
  ready: boolean;
  upsertSearch: (
    queryRaw: string,
    options?: { alertsOn?: boolean; fallbackTitle?: string },
  ) => Promise<string | null>;
  toggleAlerts: (id: string) => Promise<void>;
  removeSearch: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const SavedSearchesContext = createContext<Ctx | null>(null);

export function SavedSearchesProvider({ children }: { children: ReactNode }) {
  const [searches, setSearches] = useState<SavedSearchRecord[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const rows = await readSavedSearchesStored();
    setSearches(rows);
  }, []);

  useEffect(() => {
    readSavedSearchesStored()
      .then(setSearches)
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback(async (next: SavedSearchRecord[]) => {
    setSearches(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* offline */
    }
  }, []);

  const upsertSearch = useCallback(
    async (
      queryRaw: string,
      options?: { alertsOn?: boolean; fallbackTitle?: string },
    ): Promise<string | null> => {
      const trimmed = queryRaw.trim();
      const fallback = (options?.fallbackTitle ?? '').trim();
      const effective = trimmed.length > 0 ? trimmed : fallback;
      if (effective.length === 0) return null;

      const prev = await readSavedSearchesStored();
      const now = Date.now();
      const alertsOn = options?.alertsOn ?? true;
      const key = normalizeSearchKey(effective);

      const existing = prev.find(
        (s) => normalizeSearchKey(s.suburbQuery || s.title) === key,
      );

      const nextRow: SavedSearchRecord = existing
        ? {
            ...existing,
            title: titleFromSearchQuery(effective, existing.title),
            criteria: criteriaLineForSavedSearch(trimmed || effective),
            suburbQuery: effective,
            alertsOn,
            updatedAtMs: now,
          }
        : {
            id: newSavedSearchId(),
            title: titleFromSearchQuery(effective, 'Saved search'),
            criteria: criteriaLineForSavedSearch(trimmed || effective),
            suburbQuery: effective,
            alertsOn,
            newCount: 0,
            createdAtMs: now,
            updatedAtMs: now,
          };

      const next = upsertIntoList(prev, nextRow);
      await persist(next);
      return nextRow.id;
    },
    [persist],
  );

  const toggleAlerts = useCallback(
    async (id: string) => {
      const prev = await readSavedSearchesStored();
      const next = prev.map((s) =>
        s.id === id ? { ...s, alertsOn: !s.alertsOn, updatedAtMs: Date.now() } : s,
      );
      await persist(next);
    },
    [persist],
  );

  const removeSearch = useCallback(
    async (id: string) => {
      const prev = await readSavedSearchesStored();
      await persist(prev.filter((s) => s.id !== id));
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      searches,
      ready,
      upsertSearch,
      toggleAlerts,
      removeSearch,
      refresh,
    }),
    [searches, ready, upsertSearch, toggleAlerts, removeSearch, refresh],
  );

  return <SavedSearchesContext.Provider value={value}>{children}</SavedSearchesContext.Provider>;
}

export function useSavedSearches(): Ctx {
  const ctx = useContext(SavedSearchesContext);
  if (!ctx) {
    throw new Error('useSavedSearches must be used within SavedSearchesProvider');
  }
  return ctx;
}
