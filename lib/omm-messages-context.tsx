import { useAuth } from '@clerk/expo';

import { getClerkMobileBearerToken } from '@/lib/clerk-mobile-token';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { InspectionActivityItem } from '../packages/shared/src/mobile-api';

import type { PublishedAgentListing } from '@/lib/agent-published-listings';
import { isMobileApiConfigured } from '@/lib/mobile-api-config';
import { setMobilePostgresLinked } from '@/lib/mobile-database-link';
import {
  createThreadOnApi,
  fetchMessageThreadsFromApi,
  fetchThreadFromApi,
  markThreadReadOnApi,
  sendMessageToApi,
} from '@/lib/mobile-messages-api';
import {
  appendThreadMessage,
  ensureListingEnquiryThread,
  ensureMessageThread,
  loadMessageThreads,
  markThreadRead,
  type EnsureThreadInput,
  type StoredThread,
} from '@/lib/omm-messages';

type Ctx = {
  threads: StoredThread[];
  /** Postgres-backed inspection bookings (merged into Activities when signed in). */
  inspections: InspectionActivityItem[];
  ready: boolean;
  usingDatabase: boolean;
  refresh: () => Promise<void>;
  hydrateThread: (threadId: string) => Promise<StoredThread | null>;
  getById: (id: string) => StoredThread | undefined;
  getByPropertyRef: (propertyRef: string) => StoredThread | undefined;
  ensureThread: (input: EnsureThreadInput) => Promise<StoredThread>;
  sendMessage: (threadId: string, body: string) => Promise<StoredThread | null>;
  sendMessageWithAutoReply: (
    threadId: string,
    body: string,
    autoReply?: string,
  ) => Promise<StoredThread | null>;
  markRead: (threadId: string) => Promise<void>;
  recordListingEnquiryThread: (listing: PublishedAgentListing) => Promise<StoredThread>;
};

const OmmMessagesContext = createContext<Ctx | null>(null);

function mergeThreadIntoList(prev: StoredThread[], row: StoredThread): StoredThread[] {
  const ix = prev.findIndex((t) => t.id === row.id);
  if (ix < 0) return [row, ...prev];
  const next = [...prev];
  next[ix] = row;
  return next;
}

export function OmmMessagesProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [threads, setThreads] = useState<StoredThread[]>([]);
  const [inspectionActivities, setInspectionActivities] = useState<InspectionActivityItem[]>(
    [],
  );
  const [ready, setReady] = useState(false);
  const [usingDatabase, setUsingDatabase] = useState(false);

  const tokenGetter = useCallback(
    () => getClerkMobileBearerToken(getToken),
    [getToken],
  );

  const useApi = isLoaded && isSignedIn && isMobileApiConfigured();

  const refresh = useCallback(async () => {
    if (useApi) {
      if (!(await tokenGetter())) {
        return;
      }
      const result = await fetchMessageThreadsFromApi(tokenGetter);
      if (result.ok) {
        setThreads(result.threads);
        setInspectionActivities(result.inspections);
        setUsingDatabase(true);
        setMobilePostgresLinked(true);
        return;
      }
      if (result.error.includes('Unauthorized')) {
        console.warn(
          '[messages] API refresh failed: Unauthorized — sign out and sign in again. ' +
            'Confirm EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY matches CLERK_SECRET_KEY on OMM_BACKEND (same Clerk app).',
        );
      } else {
        console.warn('[messages] API refresh failed:', result.error);
      }
    }
    const local = await loadMessageThreads();
    setThreads(local);
    setInspectionActivities([]);
    setUsingDatabase(false);
  }, [useApi, tokenGetter]);

  useEffect(() => {
    if (!isLoaded) return;
    let alive = true;
    void refresh().finally(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [refresh, isLoaded]);

  const hydrateThread = useCallback(
    async (threadId: string) => {
      if (!useApi || !threadId.startsWith('thr-')) {
        return null;
      }
      const detail = await fetchThreadFromApi(tokenGetter, threadId);
      if (detail) {
        setThreads((prev) => mergeThreadIntoList(prev, detail));
        return detail;
      }
      return null;
    },
    [useApi, tokenGetter],
  );

  const getById = useCallback(
    (id: string) => threads.find((t) => t.id === id),
    [threads],
  );

  const getByPropertyRef = useCallback(
    (propertyRef: string) => threads.find((t) => t.propertyRef === propertyRef),
    [threads],
  );

  const ensureThread = useCallback(
    async (input: EnsureThreadInput) => {
      if (useApi) {
        const category =
          input.perspective === 'seller' ? ('LISTING' as const) : ('BUYER' as const);
        const created = await createThreadOnApi(tokenGetter, {
          participantName: input.participantName,
          participantFirm: input.participantSubtitle,
          context: input.contextLine,
          category,
          seedInboundBody: input.seedInboundBody,
        });
        if (created.ok) {
          setThreads((prev) => mergeThreadIntoList(prev, created.thread));
          setUsingDatabase(true);
          return created.thread;
        }
        throw new Error(created.error);
      }
      const row = await ensureMessageThread(input);
      await refresh();
      return row;
    },
    [useApi, refresh, tokenGetter],
  );

  const sendMessage = useCallback(
    async (threadId: string, body: string) => {
      if (useApi && threadId.startsWith('thr-')) {
        const sent = await sendMessageToApi(tokenGetter, threadId, body);
        if (sent.ok) {
          setThreads((prev) => mergeThreadIntoList(prev, sent.thread));
          setUsingDatabase(true);
          return sent.thread;
        }
        throw new Error(sent.error);
      }
      const local = await appendThreadMessage(threadId, 'outbound', body);
      if (local) {
        setThreads((prev) => mergeThreadIntoList(prev, local));
      }
      return local;
    },
    [useApi, tokenGetter],
  );

  const sendMessageWithAutoReply = useCallback(
    async (threadId: string, body: string, autoReply?: string) => {
      const sent = await sendMessage(threadId, body);
      if (!sent) return null;
      if (usingDatabase) {
        return sent;
      }
      const reply =
        autoReply?.trim() ||
        "Thanks — I've noted that. I'll follow up shortly with next steps.";
      const row = await appendThreadMessage(threadId, 'inbound', reply);
      if (row) {
        setThreads((prev) => mergeThreadIntoList(prev, row));
      }
      return row;
    },
    [sendMessage, usingDatabase],
  );

  const markRead = useCallback(
    async (threadId: string) => {
      if (useApi && threadId.startsWith('thr-')) {
        const updated = await markThreadReadOnApi(tokenGetter, threadId);
        if (updated) {
          setThreads((prev) => mergeThreadIntoList(prev, updated));
          return;
        }
      }
      await markThreadRead(threadId);
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, unread: false } : t)),
      );
    },
    [useApi, tokenGetter],
  );

  const recordListingEnquiryThread = useCallback(
    async (listing: PublishedAgentListing) => {
      if (useApi && listing.id.startsWith('lst-')) {
        return ensureListingEnquiryThread(listing);
      }
      const row = await ensureListingEnquiryThread(listing);
      await refresh();
      return row;
    },
    [useApi, refresh],
  );

  const value = useMemo(
    () => ({
      threads,
      inspections: inspectionActivities,
      ready,
      usingDatabase,
      refresh,
      hydrateThread,
      getById,
      getByPropertyRef,
      ensureThread,
      sendMessage,
      sendMessageWithAutoReply,
      markRead,
      recordListingEnquiryThread,
    }),
    [
      threads,
      inspectionActivities,
      ready,
      usingDatabase,
      refresh,
      hydrateThread,
      getById,
      getByPropertyRef,
      ensureThread,
      sendMessage,
      sendMessageWithAutoReply,
      markRead,
      recordListingEnquiryThread,
    ],
  );

  return <OmmMessagesContext.Provider value={value}>{children}</OmmMessagesContext.Provider>;
}

export function useOmmMessages() {
  const ctx = useContext(OmmMessagesContext);
  if (!ctx) {
    throw new Error('useOmmMessages must be used within OmmMessagesProvider');
  }
  return ctx;
}
