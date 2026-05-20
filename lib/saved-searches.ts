/** Device-local buyer saved search rows (until `/api/mobile/saved-searches` ships). */

export type SavedSearchRecord = {
  id: string;
  /** Short headline (typically suburb / area). */
  title: string;
  /** Dense criteria line shown on cards. */
  criteria: string;
  /** Normalised suburb or free-text query for deep-link reopen. */
  suburbQuery: string;
  alertsOn: boolean;
  /** Demo counter for NEW badge (would come from notifications later). */
  newCount: number;
  createdAtMs: number;
  updatedAtMs: number;
};

const ID_PREFIX = 'srch-local-';

export function newSavedSearchId(): string {
  return `${ID_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeSearchKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function criteriaLineForSavedSearch(queryTrimmed: string): string {
  if (!queryTrimmed) return 'Buy · Off‑market aware';
  return `Buy · Off‑market aware · ${queryTrimmed}`;
}

export function titleFromSearchQuery(queryTrimmed: string, fallbackTitle: string): string {
  if (queryTrimmed.length > 0) return queryTrimmed.length <= 52 ? queryTrimmed : `${queryTrimmed.slice(0, 49)}…`;
  return fallbackTitle;
}

export function relativeSavedSearchMeta(updatedAtMs: number, alertsOn: boolean): string {
  if (!alertsOn) return 'Alerts muted';
  const s = Math.floor((Date.now() - updatedAtMs) / 1000);
  if (s < 90) return 'Just now · Alerts on';
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago · Alerts on`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago · Alerts on`;
  const d = Math.floor(s / 86400);
  if (d === 1) return 'Yesterday · Alerts on';
  if (d < 7) return `${d}d ago · Alerts on`;
  return 'Saved · Alerts on';
}
