import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImageSourcePropType } from 'react-native';

import type { PublishedAgentListing } from '@/lib/agent-published-listings';
import { listingHeroImageSource } from '@/lib/agent-published-listings';
import {
  DEMO_AGENT_AGENCY,
  DEMO_CHAT_PROPERTY_REF,
  DEMO_PRIMARY_LISTING_TITLE,
  DEMO_PRIMARY_STREET,
} from '@/lib/melbourne-demo-locations';
import { AGENT_IMG } from '@/lib/propertyImages';

export type MessagePerspective = 'buyer' | 'seller';

const STORAGE_KEY = 'omm_message_threads_v1';

export type MessageDirection = 'inbound' | 'outbound';

export type StoredMessage = {
  id: string;
  threadId: string;
  direction: MessageDirection;
  body: string;
  sentAtIso: string;
};

export type StoredThread = {
  id: string;
  perspective: MessagePerspective;
  participantName: string;
  participantSubtitle: string;
  contextLine: string;
  /** True when the signed-in viewer is buyer on agent-owned LISTING thread. */
  participantView?: boolean;
  propertyRef?: string;
  listingId?: string;
  unread: boolean;
  lastMessageAtIso: string;
  preview: string;
  messages: StoredMessage[];
  thumbSourceKey?: 'agent' | 'listing';
};

export type EnsureThreadInput = {
  perspective: MessagePerspective;
  participantName: string;
  participantSubtitle: string;
  contextLine: string;
  propertyRef?: string;
  listingId?: string;
  thumbSourceKey?: 'agent' | 'listing';
  /** Seed inbound copy when creating a new thread */
  seedInboundBody?: string;
};

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function previewFromBody(body: string): string {
  const t = body.replace(/\s+/g, ' ').trim();
  if (t.length <= 72) return t;
  return `${t.slice(0, 69)}…`;
}

export function relativeTimeFromIso(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d`;
  return `${Math.floor(sec / 604800)}w`;
}

export function sheetTimeFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 120) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} minutes ago`;
  if (sec < 86400) return 'Today';
  if (sec < 172800) return 'Yesterday';
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export function formatMessageClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
}

function parseMessage(v: unknown, threadId: string): StoredMessage | null {
  if (v == null || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.body !== 'string' || typeof o.sentAtIso !== 'string') {
    return null;
  }
  const direction = o.direction === 'outbound' ? 'outbound' : 'inbound';
  return {
    id: o.id,
    threadId,
    direction,
    body: o.body.trim(),
    sentAtIso: o.sentAtIso,
  };
}

function parseThread(v: unknown): StoredThread | null {
  if (v == null || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== 'string' || !o.id) return null;
  if (o.perspective !== 'buyer' && o.perspective !== 'seller') return null;
  if (typeof o.participantName !== 'string') return null;
  if (typeof o.participantSubtitle !== 'string') return null;
  if (typeof o.contextLine !== 'string') return null;
  if (typeof o.lastMessageAtIso !== 'string') return null;
  if (typeof o.preview !== 'string') return null;
  if (!Array.isArray(o.messages)) return null;

  const messages = o.messages
    .map((m) => parseMessage(m, o.id as string))
    .filter((m): m is StoredMessage => m !== null && m.body.length > 0);

  return {
    id: o.id,
    perspective: o.perspective,
    participantName: o.participantName,
    participantSubtitle: o.participantSubtitle,
    contextLine: o.contextLine,
    participantView: o.participantView === true ? true : undefined,
    propertyRef: typeof o.propertyRef === 'string' ? o.propertyRef : undefined,
    listingId: typeof o.listingId === 'string' ? o.listingId : undefined,
    unread: o.unread === true,
    lastMessageAtIso: o.lastMessageAtIso,
    preview: o.preview,
    messages,
    thumbSourceKey: o.thumbSourceKey === 'listing' ? 'listing' : 'agent',
  };
}

async function readStored(): Promise<StoredThread[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseThread).filter((t): t is StoredThread => t !== null);
  } catch {
    return [];
  }
}

async function writeStored(rows: StoredThread[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function defaultSeedThreads(): StoredThread[] {
  const now = Date.now();
  const mk = (
    id: string,
    perspective: MessagePerspective,
    participantName: string,
    participantSubtitle: string,
    contextLine: string,
    propertyRef: string | undefined,
    inbound: string,
    outbound: string | null,
    offsetMin: number,
  ): StoredThread => {
    const inboundAt = new Date(now - offsetMin * 60_000).toISOString();
    const messages: StoredMessage[] = [
      {
        id: newId('msg'),
        threadId: id,
        direction: 'inbound',
        body: inbound,
        sentAtIso: inboundAt,
      },
    ];
    let lastAt = inboundAt;
    if (outbound) {
      const outAt = new Date(now - (offsetMin - 1) * 60_000).toISOString();
      messages.push({
        id: newId('msg'),
        threadId: id,
        direction: 'outbound',
        body: outbound,
        sentAtIso: outAt,
      });
      lastAt = outAt;
    }
    const preview = previewFromBody(messages[messages.length - 1].body);
    return {
      id,
      perspective,
      participantName,
      participantSubtitle,
      contextLine,
      propertyRef,
      unread: outbound == null,
      lastMessageAtIso: lastAt,
      preview,
      messages,
      thumbSourceKey: 'agent',
    };
  };

  return [
    mk(
      'thread-demo-patel',
      'buyer',
      'M. Patel',
      `Real Estate Agent · ${DEMO_PRIMARY_LISTING_TITLE}`,
      DEMO_PRIMARY_LISTING_TITLE,
      undefined,
      'Thanks for your offer. It is below what the seller will accept for this property. They are open to a counter closer to the list price.',
      null,
      2,
    ),
    mk(
      'thread-demo-lin',
      'buyer',
      'Sarah Lin',
      `Jellis Craig · Camberwell`,
      'Camberwell terrace',
      undefined,
      'Floorplan v2 is in the data room — want a walk-through? I can do a 15-min video tonight.',
      null,
      1440,
    ),
    mk(
      'thread-demo-chat',
      'buyer',
      'Anton Zhouk',
      `${DEMO_AGENT_AGENCY} · ${DEMO_PRIMARY_LISTING_TITLE}`,
      DEMO_PRIMARY_LISTING_TITLE,
      DEMO_CHAT_PROPERTY_REF,
      'Floorplan v2 received — loading into data room now.',
      'Legend — thanks, pinging vendor for sign-off.',
      18,
    ),
  ];
}

export async function loadMessageThreads(): Promise<StoredThread[]> {
  const rows = await readStored();
  if (rows.length > 0) {
    return rows.sort(
      (a, b) => Date.parse(b.lastMessageAtIso) - Date.parse(a.lastMessageAtIso),
    );
  }
  const seeded = defaultSeedThreads();
  await writeStored(seeded);
  return seeded;
}

export async function getMessageThread(threadId: string): Promise<StoredThread | null> {
  const rows = await loadMessageThreads();
  return rows.find((t) => t.id === threadId) ?? null;
}

export async function getThreadByPropertyRef(propertyRef: string): Promise<StoredThread | null> {
  const rows = await loadMessageThreads();
  return rows.find((t) => t.propertyRef === propertyRef) ?? null;
}

export async function ensureMessageThread(input: EnsureThreadInput): Promise<StoredThread> {
  const rows = await loadMessageThreads();
  const existing = rows.find(
    (t) =>
      (input.propertyRef && t.propertyRef === input.propertyRef) ||
      (input.listingId && t.listingId === input.listingId && t.perspective === input.perspective),
  );
  if (existing) return existing;

  const id = input.propertyRef
    ? `thread-${input.propertyRef}`
    : input.listingId
      ? `thread-listing-${input.listingId}-${input.perspective}`
      : newId('thread');

  const now = new Date().toISOString();
  const messages: StoredMessage[] = [];
  if (input.seedInboundBody?.trim()) {
    messages.push({
      id: newId('msg'),
      threadId: id,
      direction: 'inbound',
      body: input.seedInboundBody.trim(),
      sentAtIso: now,
    });
  }

  const preview =
    messages.length > 0 ? previewFromBody(messages[messages.length - 1].body) : 'No messages yet';

  const row: StoredThread = {
    id,
    perspective: input.perspective,
    participantName: input.participantName,
    participantSubtitle: input.participantSubtitle,
    contextLine: input.contextLine,
    propertyRef: input.propertyRef,
    listingId: input.listingId,
    unread: messages.length > 0 && messages[messages.length - 1].direction === 'inbound',
    lastMessageAtIso: now,
    preview,
    messages,
    thumbSourceKey: input.thumbSourceKey ?? 'agent',
  };

  await writeStored([row, ...rows.filter((r) => r.id !== id)]);
  return row;
}

export async function appendThreadMessage(
  threadId: string,
  direction: MessageDirection,
  body: string,
): Promise<StoredThread | null> {
  const trimmed = body.trim();
  if (!trimmed) return null;

  const rows = await loadMessageThreads();
  const ix = rows.findIndex((t) => t.id === threadId);
  if (ix < 0) return null;

  const now = new Date().toISOString();
  const msg: StoredMessage = {
    id: newId('msg'),
    threadId,
    direction,
    body: trimmed,
    sentAtIso: now,
  };

  const thread = rows[ix];
  const next: StoredThread = {
    ...thread,
    messages: [...thread.messages, msg],
    lastMessageAtIso: now,
    preview: previewFromBody(trimmed),
    unread: direction === 'inbound',
  };

  rows[ix] = next;
  await writeStored(rows);
  return next;
}

export async function markThreadRead(threadId: string): Promise<void> {
  const rows = await loadMessageThreads();
  const ix = rows.findIndex((t) => t.id === threadId);
  if (ix < 0) return;
  if (!rows[ix].unread) return;
  rows[ix] = { ...rows[ix], unread: false };
  await writeStored(rows);
}

/** Seller inbox row when a buyer enquires on a published listing. */
export async function ensureListingEnquiryThread(
  listing: PublishedAgentListing,
): Promise<StoredThread> {
  return ensureMessageThread({
    perspective: 'seller',
    participantName: 'Buyer enquiry',
    participantSubtitle: `${listing.titleLine} · ${listing.suburbLine}`,
    contextLine: listing.titleLine,
    listingId: listing.id,
    thumbSourceKey: 'listing',
    seedInboundBody: `A buyer contacted you about ${listing.streetLine}. They may ask about price, inspections, or contract terms — reply here to keep everything on OMM.`,
  });
}

export function threadThumbSource(
  thread: StoredThread,
  listing?: PublishedAgentListing,
): ImageSourcePropType {
  if (thread.thumbSourceKey === 'listing' && listing) {
    return listingHeroImageSource(listing);
  }
  return AGENT_IMG;
}

export function messageThreadsForPerspective(
  threads: StoredThread[],
  perspective: MessagePerspective,
): StoredThread[] {
  return threads.filter((t) => t.perspective === perspective);
}
