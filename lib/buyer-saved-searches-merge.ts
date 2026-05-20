import type { MobileSavedSearch } from '@/lib/mobile-home-api';
import { relativeSavedSearchMeta, type SavedSearchRecord } from '@/lib/saved-searches';

/** Row shown on Buying home / Saved searches (device + API fallback). */
export type BuyerSavedSearchMergedRow = {
  id: string;
  title: string;
  criteria: string;
  alertsOn: boolean;
  newCount: number;
  /** When omitted, reopen using `title`. */
  suburbQuery?: string;
};

function mergeByIdLocalFirst<T extends { id: string }>(local: T[], remote: T[]): T[] {
  const seen = new Set(local.map((x) => x.id));
  return [...local, ...remote.filter((r) => !seen.has(r.id))];
}

export function savedRecordToBuyerRow(r: SavedSearchRecord): BuyerSavedSearchMergedRow {
  return {
    id: r.id,
    title: r.title,
    criteria: r.criteria,
    alertsOn: r.alertsOn,
    newCount: r.newCount,
    suburbQuery: r.suburbQuery,
  };
}

export function mobileSavedSearchToBuyerRow(s: MobileSavedSearch): BuyerSavedSearchMergedRow {
  return {
    id: s.id,
    title: s.title,
    criteria: s.criteria,
    alertsOn: s.alertsOn,
    newCount: s.newCount,
  };
}

export function mergeBuyerSavedSearches(
  localRecords: SavedSearchRecord[],
  remote: MobileSavedSearch[],
): BuyerSavedSearchMergedRow[] {
  const localRows = localRecords.map(savedRecordToBuyerRow);
  const remoteRows = remote.map(mobileSavedSearchToBuyerRow);
  return mergeByIdLocalFirst(localRows, remoteRows);
}

export function buyerSavedMetaForRow(
  row: BuyerSavedSearchMergedRow,
  localRecords: SavedSearchRecord[],
): string {
  const local = localRecords.find((r) => r.id === row.id);
  if (local) return relativeSavedSearchMeta(local.updatedAtMs, local.alertsOn);
  return row.alertsOn ? 'Alerts on' : 'Alerts muted';
}
