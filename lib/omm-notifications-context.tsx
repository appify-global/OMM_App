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

import { getClerkMobileBearerToken } from '@/lib/clerk-mobile-token';
import { isMobileApiConfigured } from '@/lib/mobile-api-config';
import { setMobilePostgresLinked } from '@/lib/mobile-database-link';
import {
  fetchNotificationsFromApi,
  markNotificationReadOnApi,
  type StoredNotification,
} from '@/lib/mobile-notifications-api';

type Ctx = {
  items: StoredNotification[];
  ready: boolean;
  usingDatabase: boolean;
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
};

const OmmNotificationsContext = createContext<Ctx | null>(null);

export function OmmNotificationsProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [items, setItems] = useState<StoredNotification[]>([]);
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
      const result = await fetchNotificationsFromApi(tokenGetter);
      if (result.ok) {
        setItems(result.items);
        setUsingDatabase(true);
        setMobilePostgresLinked(true);
        return;
      }
      if (!result.error.includes('Unauthorized')) {
        console.warn('[notifications] API refresh failed:', result.error);
      }
    }
    setItems([]);
    setUsingDatabase(false);
  }, [useApi, tokenGetter]);

  const markRead = useCallback(
    async (id: string) => {
      setItems((prev) =>
        prev.map((row) => (row.id === id ? { ...row, read: true } : row)),
      );
      if (useApi && (await tokenGetter())) {
        const ok = await markNotificationReadOnApi(tokenGetter, id);
        if (!ok) void refresh();
      }
    },
    [refresh, tokenGetter, useApi],
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setItems([]);
      setUsingDatabase(false);
      setReady(true);
      return;
    }
    let cancelled = false;
    void (async () => {
      await refresh();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, refresh]);

  const unreadCount = useMemo(
    () => items.filter((row) => !row.read).length,
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      ready,
      usingDatabase,
      unreadCount,
      refresh,
      markRead,
    }),
    [items, ready, usingDatabase, unreadCount, refresh, markRead],
  );

  return (
    <OmmNotificationsContext.Provider value={value}>
      {children}
    </OmmNotificationsContext.Provider>
  );
}

export function useOmmNotifications(): Ctx {
  const ctx = useContext(OmmNotificationsContext);
  if (!ctx) {
    throw new Error('useOmmNotifications must be used within OmmNotificationsProvider');
  }
  return ctx;
}
