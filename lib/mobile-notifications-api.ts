import { apiFetch } from '@/lib/api';
import { isMobileApiConfigured } from '@/lib/mobile-api-config';

function record(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export type NotificationKind =
  | 'NEW_MATCH'
  | 'NEW_ENQUIRY'
  | 'NEW_OFFER'
  | 'INSPECTION'
  | 'MESSAGE'
  | 'BRIEF_REPLY'
  | 'REVIEW'
  | 'DISPUTE'
  | 'BILLING'
  | 'SYSTEM';

export type StoredNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  read: boolean;
  occurredAtLabel: string;
  occurredAtIso: string;
  listingId?: string;
  threadId?: string;
};

type ApiNotification = {
  id: string;
  kind: string;
  title: string;
  body?: string;
  href?: string;
  read?: boolean;
  occurredAt?: string;
  occurredAtIso?: string;
  listingId?: string;
  threadId?: string;
};

function mapApiNotification(row: ApiNotification): StoredNotification {
  const iso =
    typeof row.occurredAtIso === 'string' && row.occurredAtIso.trim()
      ? row.occurredAtIso
      : new Date().toISOString();
  const kind = (row.kind ?? 'SYSTEM') as NotificationKind;
  return {
    id: row.id,
    kind,
    title: row.title,
    body: typeof row.body === 'string' ? row.body : '',
    href: typeof row.href === 'string' && row.href.trim() ? row.href : '/notifications',
    read: Boolean(row.read),
    occurredAtLabel:
      typeof row.occurredAt === 'string' && row.occurredAt.trim()
        ? row.occurredAt
        : 'Just now',
    occurredAtIso: iso,
    listingId: typeof row.listingId === 'string' ? row.listingId : undefined,
    threadId: typeof row.threadId === 'string' ? row.threadId : undefined,
  };
}

async function readApiError(res: Response, fallback: string): Promise<string> {
  try {
    const json = (await res.json()) as { error?: string; reason?: string };
    if (typeof json.error === 'string' && json.error.trim()) {
      return json.reason?.trim() ? `${json.error} (${json.reason})` : json.error;
    }
  } catch {
    /* use fallback */
  }
  return `${fallback} (${res.status})`;
}

export async function fetchNotificationsFromApi(
  getToken: () => Promise<string | null>,
): Promise<{ ok: true; items: StoredNotification[] } | { ok: false; error: string }> {
  if (!isMobileApiConfigured()) {
    return { ok: false, error: 'API not configured' };
  }
  try {
    const res = await apiFetch('/api/mobile/notifications', getToken, { method: 'GET' });
    if (res.status === 401) {
      return {
        ok: false,
        error:
          'Unauthorized — sign in again. Expo and OMM_BACKEND must use the same Clerk application.',
      };
    }
    if (!res.ok) {
      return { ok: false, error: await readApiError(res, 'Could not load notifications') };
    }
    const json = (await res.json()) as { items?: unknown };
    if (!Array.isArray(json.items)) return { ok: true, items: [] };
    const items = json.items
      .filter((row): row is ApiNotification => record(row) && typeof row.id === 'string')
      .map(mapApiNotification);
    return { ok: true, items };
  } catch {
    return {
      ok: false,
      error: 'Network error loading notifications — is OMM_BACKEND running on port 3102?',
    };
  }
}

export async function markNotificationReadOnApi(
  getToken: () => Promise<string | null>,
  notificationId: string,
): Promise<boolean> {
  if (!isMobileApiConfigured()) return false;
  try {
    const res = await apiFetch(
      `/api/mobile/notifications/${notificationId}/read`,
      getToken,
      { method: 'POST' },
    );
    return res.ok;
  } catch {
    return false;
  }
}
