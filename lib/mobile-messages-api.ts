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
};

type ApiThread = {
  id: string;
  category: string;
  participant: { name: string; firm: string };
  context: string;
  unread: boolean;
  preview: string;
  messages: ApiMessage[];
};

function mapApiMessage(m: ApiMessage, threadId: string): StoredMessage {
  return {
    id: m.id,
    threadId,
    direction: m.direction === 'OUT' ? 'outbound' : 'inbound',
    body: m.body,
    sentAtIso: new Date().toISOString(),
  };
}

function mapApiThread(t: ApiThread): StoredThread {
  const perspective =
    t.category === 'BUYER' || t.category === 'LISTING' ? 'buyer' : 'seller';
  return {
    id: t.id,
    perspective,
    participantName: t.participant.name,
    participantSubtitle: [t.participant.firm, t.context].filter(Boolean).join(' · '),
    contextLine: t.context,
    unread: t.unread,
    lastMessageAtIso: new Date().toISOString(),
    preview: t.preview,
    messages: t.messages.map((m) => mapApiMessage(m, t.id)),
    thumbSourceKey: 'agent',
  };
}

export async function fetchMessageThreadsFromApi(
  getToken: () => Promise<string | null>,
): Promise<StoredThread[] | null> {
  if (!isMobileApiConfigured()) return null;
  try {
    const res = await apiFetch('/api/mobile/messages', getToken, { method: 'GET' });
    if (!res.ok) return null;
    const json = (await res.json()) as { threads?: unknown };
    if (!Array.isArray(json.threads)) return [];
    return json.threads
      .filter((t): t is ApiThread => record(t) && typeof t.id === 'string')
      .map(mapApiThread);
  } catch {
    return null;
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
): Promise<StoredThread | null> {
  if (!isMobileApiConfigured()) return null;
  try {
    const res = await apiFetch('/api/mobile/messages', getToken, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { thread?: ApiThread; threadId?: string };
    if (json.thread && record(json.thread) && typeof json.thread.id === 'string') {
      return mapApiThread(json.thread);
    }
    if (typeof json.threadId === 'string') {
      return fetchThreadFromApi(getToken, json.threadId);
    }
    return null;
  } catch {
    return null;
  }
}

export async function sendMessageToApi(
  getToken: () => Promise<string | null>,
  threadId: string,
  body: string,
): Promise<StoredThread | null> {
  if (!isMobileApiConfigured()) return null;
  try {
    const res = await apiFetch(`/api/mobile/messages/${threadId}`, getToken, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { thread?: ApiThread };
    if (!json.thread) return fetchThreadFromApi(getToken, threadId);
    return mapApiThread(json.thread);
  } catch {
    return null;
  }
}
