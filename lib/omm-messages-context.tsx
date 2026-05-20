import { useAuth } from '@clerk/expo';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { PublishedAgentListing } from '@/lib/agent-published-listings';
import { isMobileApiConfigured } from '@/lib/mobile-api-config';
import { isMobilePostgresLinked } from '@/lib/mobile-database-link';
import {
  createThreadOnApi,
  fetchMessageThreadsFromApi,
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
  ready: boolean;
  usingDatabase: boolean;
  refresh: () => Promise<void>;
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

export function OmmMessagesProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [threads, setThreads] = useState<StoredThread[]>([]);
  const [ready, setReady] = useState(false);
  const [usingDatabase, setUsingDatabase] = useState(false);

  const tokenGetter = useCallback(async () => {
    try {
      return (await getToken()) ?? null;
    } catch {
      return null;
    }
  }, [getToken]);

  const refresh = useCallback(async () => {
    if (isSignedIn && isMobileApiConfigured()) {
      const apiRows = await fetchMessageThreadsFromApi(tokenGetter);
      if (apiRows != null) {
        setThreads(apiRows);
        setUsingDatabase(true);
        return;
      }
      if (isMobilePostgresLinked()) {
        setThreads([]);
        setUsingDatabase(true);
        return;
      }
    }
    if (isMobilePostgresLinked()) {
      setThreads([]);
      setUsingDatabase(true);
      return;
    }
    const local = await loadMessageThreads();
    setThreads(local);
    setUsingDatabase(false);
  }, [isSignedIn, tokenGetter]);

  useEffect(() => {
    let alive = true;
    void refresh().finally(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [refresh]);

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
      if (isSignedIn && isMobileApiConfigured() && isMobilePostgresLinked()) {
        const category =
          input.perspective === 'seller' ? ('LISTING' as const) : ('BUYER' as const);
        const created = await createThreadOnApi(tokenGetter, {
          participantName: input.participantName,
          participantFirm: input.participantSubtitle,
          context: input.contextLine,
          category,
          seedInboundBody: input.seedInboundBody,
        });
        if (created) {
          await refresh();
          return created;
        }
      }
      const row = await ensureMessageThread(input);
      await refresh();
      return row;
    },
    [isSignedIn, refresh, tokenGetter],
  );

  const sendMessage = useCallback(
    async (threadId: string, body: string) => {
      if (isSignedIn && isMobileApiConfigured()) {
        const row = await sendMessageToApi(tokenGetter, threadId, body);
        if (row) {
          await refresh();
          return row;
        }
      }
      const local = await appendThreadMessage(threadId, 'outbound', body);
      if (local) await refresh();
      return local;
    },
    [isSignedIn, refresh, tokenGetter],
  );

  const sendMessageWithAutoReply = useCallback(
    async (threadId: string, body: string, autoReply?: string) => {
      const sent = await sendMessage(threadId, body);
      if (!sent) return null;
      if (usingDatabase) {
        await refresh();
        return getById(threadId) ?? sent;
      }
      const reply =
        autoReply?.trim() ||
        "Thanks — I've noted that. I'll follow up shortly with next steps.";
      const row = await appendThreadMessage(threadId, 'inbound', reply);
      if (row) await refresh();
      return row;
    },
    [getById, refresh, sendMessage, usingDatabase],
  );

  const markRead = useCallback(
    async (threadId: string) => {
      await markThreadRead(threadId);
      await refresh();
    },
    [refresh],
  );

  const recordListingEnquiryThread = useCallback(
    async (listing: PublishedAgentListing) => {
      if (isSignedIn && isMobileApiConfigured() && isMobilePostgresLinked()) {
        const created = await createThreadOnApi(tokenGetter, {
          participantName: 'Buyer enquiry',
          participantFirm: `${listing.titleLine} · ${listing.suburbLine}`,
          context: listing.titleLine,
          category: 'LISTING',
          seedInboundBody: `A buyer contacted you about ${listing.streetLine}. They may ask about price, inspections, or contract terms — reply here to keep everything on OMM.`,
        });
        if (created) {
          await refresh();
          return created;
        }
      }
      const row = await ensureListingEnquiryThread(listing);
      await refresh();
      return row;
    },
    [isSignedIn, refresh, tokenGetter],
  );

  const value = useMemo(
    () => ({
      threads,
      ready,
      usingDatabase,
      refresh,
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
      ready,
      usingDatabase,
      refresh,
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
