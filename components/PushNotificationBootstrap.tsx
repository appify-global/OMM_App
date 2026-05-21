import { useAuth } from '@clerk/expo';
import * as Notifications from 'expo-notifications';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { usePushPrefs } from '@/lib/push-preferences-context';
import {
  ensureExpoPushNotificationBehavior,
  postExpoPushTokenToBackend,
  registerForExpoPushTokenAsync,
} from '@/lib/expo-push-registration';

/**
 * Registers for Expo push when signed in + preference on; forwards taps via `data.href`.
 * Must render under ClerkProvider + PushPrefsProvider + expo-router.
 */
export function PushNotificationBootstrap() {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const { pushMessages, pushPrefsHydrated } = usePushPrefs();
  const lastPostedToken = useRef<string | null>(null);
  const openedFromNotificationHandled = useRef(false);

  useEffect(() => {
    ensureExpoPushNotificationBehavior();
  }, []);

  useEffect(() => {
    if (!pushPrefsHydrated || Platform.OS === 'web') return;

    let cancelled = false;

    void (async () => {
      if (!isSignedIn || !pushMessages) {
        lastPostedToken.current = null;
        return;
      }

      const result = await registerForExpoPushTokenAsync();
      if (cancelled || !result.ok) return;

      if (lastPostedToken.current === result.token) return;
      lastPostedToken.current = result.token;

      const posted = await postExpoPushTokenToBackend(result.token, async () => {
        try {
          return await getToken();
        } catch {
          return null;
        }
      });

      if (__DEV__ && !posted) {
        console.warn(
          '[push] Token obtained but backend registration failed — check EXPO_PUBLIC_WEB_ORIGIN / EXPO_PUBLIC_API_URL and /api/mobile/push-token.',
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getToken, isSignedIn, pushMessages, pushPrefsHydrated]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const navigateFromData = (data: Record<string, unknown>) => {
      const href = typeof data.href === 'string' ? data.href : null;
      if (href?.startsWith('/')) {
        router.push(href as Href);
      }
    };

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      navigateFromData(data ?? {});
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (openedFromNotificationHandled.current) return;
      if (!response?.notification) return;
      openedFromNotificationHandled.current = true;
      const data = response.notification.request.content.data as Record<string, unknown>;
      navigateFromData(data ?? {});
    });

    return () => sub.remove();
  }, [router]);

  return null;
}
