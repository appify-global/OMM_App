import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  criteriaLineForSavedSearch,
  normalizeSearchKey,
} from '@/lib/saved-searches';

export type RecentBuyerSearchRow = {
  id: string;
  /** Raw trimmed query shown as title / reopened with Explore. */
  query: string;
  subtitle: string;
  updatedAtMs: number;
};

const STORAGE_KEY = 'omm_buyer_recent_searches_v1';

function parseRow(v: unknown): RecentBuyerSearchRow | null {
  if (v === null || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== 'string' || !o.id) return null;
  if (typeof o.query !== 'string' || !o.query.trim()) return null;
  if (typeof o.subtitle !== 'string') return null;
  const updatedAtMs =
    typeof o.updatedAtMs === 'number' && Number.isFinite(o.updatedAtMs)
      ? o.updatedAtMs
      : Date.now();
  return { id: o.id, query: o.query.trim(), subtitle: o.subtitle, updatedAtMs };
}

export async function readRecentBuyerSearchesStored(): Promise<
  RecentBuyerSearchRow[]
> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseRow).filter((r): r is RecentBuyerSearchRow => r !== null);
  } catch {
    return [];
  }
}

export async function writeRecentBuyerSearchesStored(
  rows: RecentBuyerSearchRow[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* quota */
  }
}

/** Dedupe by normalized query; newest first; cap length. */
export function prependRecentBuyerSearchQuery(
  prev: RecentBuyerSearchRow[],
  trimmedQuery: string,
): RecentBuyerSearchRow[] {
  const q = trimmedQuery.trim();
  if (!q.length) return prev;
  const key = normalizeSearchKey(q);
  const filtered = prev.filter((r) => normalizeSearchKey(r.query) !== key);
  const row: RecentBuyerSearchRow = {
    id: `rb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    query: q,
    subtitle: criteriaLineForSavedSearch(q),
    updatedAtMs: Date.now(),
  };
  return [row, ...filtered].slice(0, 25);
}
