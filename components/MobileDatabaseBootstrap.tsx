import { useAuth } from '@clerk/expo';
import { useEffect, useRef } from 'react';

import { useAgentPublishedListings } from '@/lib/agent-published-listings-context';
import { useMobileDatabase } from '@/lib/mobile-database-context';
import { useOmmMessages } from '@/lib/omm-messages-context';
import { useOmmNotifications } from '@/lib/omm-notifications-context';

/**
 * When Postgres is connected, refresh listing + message contexts so mobile
 * reads/writes Railway instead of device-only AsyncStorage.
 */
export function MobileDatabaseBootstrap() {
  const { isSignedIn } = useAuth();
  const { postgresLinked } = useMobileDatabase();
  const { refresh: refreshListings } = useAgentPublishedListings();
  const { refresh: refreshMessages } = useOmmMessages();
  const { refresh: refreshNotifications } = useOmmNotifications();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !postgresLinked) {
      syncedRef.current = false;
      return;
    }
    if (syncedRef.current) return;
    syncedRef.current = true;
    void Promise.all([refreshListings(), refreshMessages(), refreshNotifications()]);
  }, [postgresLinked, isSignedIn, refreshListings, refreshMessages, refreshNotifications]);

  return null;
}
