import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { loadPushPrefs, savePushPrefs } from '@/lib/push-preferences-storage';

type Ctx = {
  pushMessages: boolean;
  pushPrefsHydrated: boolean;
  setPushMessagesEnabled: (value: boolean) => Promise<void>;
};

const PushPrefsContext = createContext<Ctx | null>(null);

export function PushPrefsProvider({ children }: { children: ReactNode }) {
  const [pushMessages, setPushMessages] = useState(true);
  const [pushPrefsHydrated, setPushPrefsHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    loadPushPrefs().then((p) => {
      if (!alive) return;
      setPushMessages(p.pushMessages);
      setPushPrefsHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const setPushMessagesEnabled = useCallback(async (value: boolean) => {
    setPushMessages(value);
    await savePushPrefs({ pushMessages: value });
  }, []);

  const value = useMemo(
    () => ({
      pushMessages,
      pushPrefsHydrated,
      setPushMessagesEnabled,
    }),
    [pushMessages, pushPrefsHydrated, setPushMessagesEnabled],
  );

  return <PushPrefsContext.Provider value={value}>{children}</PushPrefsContext.Provider>;
}

export function usePushPrefs() {
  const ctx = useContext(PushPrefsContext);
  if (!ctx) {
    throw new Error('usePushPrefs must be used within PushPrefsProvider');
  }
  return ctx;
}
