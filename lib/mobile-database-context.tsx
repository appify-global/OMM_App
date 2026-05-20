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

import { apiFetch } from '@/lib/api';
import { isMobileApiConfigured } from '@/lib/mobile-api-config';
import { setMobilePostgresLinked } from '@/lib/mobile-database-link';

type MobileDatabaseContextValue = {
  postgresLinked: boolean;
  checking: boolean;
  lastError: string | null;
  recheck: () => Promise<boolean>;
};

const MobileDatabaseContext = createContext<MobileDatabaseContextValue | null>(null);

const DEFAULT_CTX: MobileDatabaseContextValue = {
  postgresLinked: false,
  checking: false,
  lastError: null,
  recheck: async () => false,
};

export async function pingMobileDatabase(
  getToken: () => Promise<string | null>,
): Promise<boolean> {
  if (!isMobileApiConfigured()) return false;
  try {
    const res = await apiFetch('/api/mobile/health', getToken, { method: 'GET' });
    if (!res.ok) return false;
    const json = (await res.json()) as { database?: boolean; ok?: boolean };
    return json.database === true || json.ok === true;
  } catch {
    return false;
  }
}

export function MobileDatabaseProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [postgresLinked, setPostgresLinked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const tokenGetter = useCallback(async () => {
    try {
      return (await getToken()) ?? null;
    } catch {
      return null;
    }
  }, [getToken]);

  const recheck = useCallback(async () => {
    if (!isSignedIn || !isMobileApiConfigured()) {
      setPostgresLinked(false);
      setMobilePostgresLinked(false);
      setLastError(null);
      return false;
    }
    setChecking(true);
    try {
      const ok = await pingMobileDatabase(tokenGetter);
      setPostgresLinked(ok);
      setMobilePostgresLinked(ok);
      setLastError(ok ? null : 'Could not reach Railway Postgres via API');
      return ok;
    } catch {
      setPostgresLinked(false);
      setMobilePostgresLinked(false);
      setLastError('API unreachable — check EXPO_PUBLIC_API_URL');
      return false;
    } finally {
      setChecking(false);
    }
  }, [isSignedIn, tokenGetter]);

  useEffect(() => {
    if (!isSignedIn) {
      setPostgresLinked(false);
      setMobilePostgresLinked(false);
      setLastError(null);
      return;
    }
    void recheck();
  }, [isSignedIn, recheck]);

  const value = useMemo(
    (): MobileDatabaseContextValue => ({
      postgresLinked,
      checking,
      lastError,
      recheck,
    }),
    [postgresLinked, checking, lastError, recheck],
  );

  return (
    <MobileDatabaseContext.Provider value={value}>{children}</MobileDatabaseContext.Provider>
  );
}

export function useMobileDatabase(): MobileDatabaseContextValue {
  return useContext(MobileDatabaseContext) ?? DEFAULT_CTX;
}
