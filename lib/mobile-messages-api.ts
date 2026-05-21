import type { InspectionActivityItem } from '../packages/shared/src/mobile-api';

import { apiFetch } from '@/lib/api';
import type { StoredMessage, StoredThread } from '@/lib/omm-messages';
import { isMobileApiConfigured } from '@/lib/mobile-api-config';

function record(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

type ApiMessage = {
  id: string;
  direction: string;
  body: string;
  time?: string;
  sentAt?: string;
};

type ApiThread = {
  id: string;
  category: string;
  participant: { name: string; firm: string };
  context: string;
  unread: boolean;
  preview: string;
  /** ISO8601 from Next `/api/mobile/messages` inbox sync. */
  lastMessageAt?: string;
  lastMessageAtIso?: string;
  messages: ApiMessage[];
  participantView?: boolean;
  listingId?: string;
};

function mapApiMessage(m: ApiMessage, threadId: string): StoredMessage {
  const iso =
    typeof m.sentAt === 'string' && m.sentAt.trim()
      ? m.sentAt
      : new Date().toISOString();
  return {
    id: m.id,
    threadId,
    direction: m.direction === 'OUT' ? 'outbound' : 'inbound',
    body: m.body,
    sentAtIso: iso,
  };
}

function mapApiThread(t: ApiThread): StoredThread {
  const participantView = t.participantView === true;

  let perspective: 'buyer' | 'seller';
  if (t.category === 'LISTING') {
    perspective = participantView ? 'buyer' : 'seller';
  } else if (t.category === 'BUYER') {
    perspective = 'buyer';
  } else {
    perspective = 'seller';
  }

  const lastIso =
    (typeof t.lastMessageAt === 'string' && t.lastMessageAt.trim()
      ? t.lastMessageAt
      : typeof t.lastMessageAtIso === 'string' && t.lastMessageAtIso.trim()
        ? t.lastMessageAtIso
        : '') || new Date().toISOString();

  const listingIdParsed =
    typeof t.listingId === 'string' && t.listingId.startsWith('lst-')
      ? t.listingId
      : undefined;

  return {
    id: t.id,
    perspective,
    participantName: t.participant.name,
    participantSubtitle: [t.participant.firm, t.context].filter(Boolean).join(' · '),
    contextLine: t.context,
    participantView: participantView ? true : undefined,
    unread: t.unread,
    lastMessageAtIso: lastIso,
    preview: t.preview,
    messages: (t.messages ?? []).map((m) => mapApiMessage(m, t.id)),
    thumbSourceKey: 'agent',
    listingId: listingIdParsed,
  };
}

function parseInspectionActivityItem(v: unknown): InspectionActivityItem | null {
  if (!record(v)) return null;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.listingId !== 'string') return null;
  if (typeof o.listingTitle !== 'string') return null;
  if (typeof o.listingAddress !== 'string') return null;
  if (typeof o.slotLabel !== 'string') return null;
  if (typeof o.bookedAtIso !== 'string') return null;
  if (o.perspective !== 'buyer' && o.perspective !== 'seller') return null;
  if (typeof o.counterpartyLabel !== 'string') return null;
  return {
    id: o.id,
    listingId: o.listingId,
    listingTitle: o.listingTitle,
    listingAddress: o.listingAddress,
    slotLabel: o.slotLabel,
    bookedAtIso: o.bookedAtIso,
    perspective: o.perspective,
    counterpartyLabel: o.counterpartyLabel,
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

export async function fetchMessageThreadsFromApi(
  getToken: () => Promise<string | null>,
): Promise<
  | { ok: true; threads: StoredThread[]; inspections: InspectionActivityItem[] }
  | { ok: false; error: string }
> {
  if (!isMobileApiConfigured()) {
    return { ok: false, error: 'API not configured' };
  }
  try {
    const res = await apiFetch('/api/mobile/messages', getToken, { method: 'GET' });
    if (res.status === 401) {
      return {
        ok: false,
        error:
          'Unauthorized — sign in again. Expo and OMM_BACKEND must use the same Clerk application (matching publishable + secret keys).',
      };
    }
    if (!res.ok) {
      return { ok: false, error: await readApiError(res, 'Could not load messages') };
    }
    const json = (await res.json()) as { threads?: unknown; inspections?: unknown };
    const threadsRaw = json.threads;
    if (!Array.isArray(threadsRaw)) return { ok: true, threads: [], inspections: [] };
    const threads = threadsRaw
      .filter((t): t is ApiThread => record(t) && typeof t.id === 'string')
      .map(mapApiThread);

    let inspections: InspectionActivityItem[] = [];
    if (Array.isArray(json.inspections)) {
      inspections = json.inspections
        .map(parseInspectionActivityItem)
        .filter((x): x is InspectionActivityItem => x !== null);
    }

    return { ok: true, threads, inspections };
  } catch {
    return {
      ok: false,
      error: 'Network error loading messages — is OMM_BACKEND running on port 3102?',
    };
  }
}

export async function fetchThreadFromApi(
  getToken: () => Promise<string | null>,
  threadId: string,
): Promise<StoredThread | null> {
  if (!isMobileApiConfigured()) return null;
  try {
    const res = await apiFetch(`/api/mobile/messages/${threadId}`, getToken, {
      method: 'GET',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiThread;
    if (!record(json) || typeof json.id !== 'string') return null;
    return mapApiThread(json);
  } catch {
    return null;
  }
}

export type CreateThreadApiInput = {
  participantName: string;
  participantFirm?: string;
  context: string;
  category?: 'BUYER' | 'LISTING' | 'BRIEF' | 'VENDOR' | 'PLATFORM';
  seedInboundBody?: string;
};

export async function createThreadOnApi(
  getToken: () => Promise<string | null>,
  input: CreateThreadApiInput,
): Promise<{ ok: true; thread: StoredThread } | { ok: false; error: string }> {
  if (!isMobileApiConfigured()) {
    return { ok: false, error: 'API not configured' };
  }
  try {
    const res = await apiFetch('/api/mobile/messages', getToken, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      return { ok: false, error: await readApiError(res, 'Could not create thread') };
    }
    const json = (await res.json()) as { thread?: ApiThread; threadId?: string };
    if (json.thread && record(json.thread) && typeof json.thread.id === 'string') {
      return { ok: true, thread: mapApiThread(json.thread) };
    }
    if (typeof json.threadId === 'string') {
      const detail = await fetchThreadFromApi(getToken, json.threadId);
      if (detail) return { ok: true, thread: detail };
    }
    return { ok: false, error: 'Server response missing thread' };
  } catch {
    return { ok: false, error: 'Network error creating thread' };
  }
}

export async function sendMessageToApi(
  getToken: () => Promise<string | null>,
  threadId: string,
  body: string,
): Promise<{ ok: true; thread: StoredThread } | { ok: false; error: string }> {
  if (!isMobileApiConfigured()) return { ok: false, error: 'API not configured' };
  try {
    const res = await apiFetch(`/api/mobile/messages/${threadId}`, getToken, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      return { ok: false, error: await readApiError(res, 'Could not send message') };
    }
    const json = (await res.json()) as { thread?: ApiThread };
    if (json.thread && record(json.thread)) {
      return { ok: true, thread: mapApiThread(json.thread) };
    }
    const detail = await fetchThreadFromApi(getToken, threadId);
    if (detail) return { ok: true, thread: detail };
    return { ok: false, error: 'Send succeeded but thread refresh failed' };
  } catch {
    return { ok: false, error: 'Network error sending message' };
  }
}

export async function markThreadReadOnApi(
  getToken: () => Promise<string | null>,
  threadId: string,
): Promise<StoredThread | null> {
  if (!isMobileApiConfigured()) return null;
  try {
    const res = await apiFetch(`/api/mobile/messages/${threadId}/read`, getToken, {
      method: 'POST',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { thread?: ApiThread };
    if (json.thread && record(json.thread)) return mapApiThread(json.thread);
    return fetchThreadFromApi(getToken, threadId);
  } catch {
    return null;
  }
}
