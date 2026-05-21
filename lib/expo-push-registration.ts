import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { getExpoMobileApiOriginHint } from '@/lib/mobile-api-config';

/** Default Android channel — required for heads-up on Android 8+. */
export const ANDROID_DEFAULT_CHANNEL_ID = 'default';

let handlerInstalled = false;

export function ensureExpoPushNotificationBehavior(): void {
  if (handlerInstalled) return;
  handlerInstalled = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_DEFAULT_CHANNEL_ID, {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

function resolveExpoProjectId(): string | undefined {
  const eas = Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined;
  return eas?.projectId ?? Constants.easConfig?.projectId;
}

export type ExpoPushRegistrationResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'web' | 'simulator' | 'permission_denied' | 'no_project_id' | 'unavailable' };

/**
 * Requests notification permission (when needed) and returns an Expo push token.
 * Physical devices only (simulators cannot receive remote push reliably).
 */
export async function registerForExpoPushTokenAsync(): Promise<ExpoPushRegistrationResult> {
  if (Platform.OS === 'web') {
    return { ok: false, reason: 'web' };
  }
  ensureExpoPushNotificationBehavior();

  if (!Device.isDevice) {
    return { ok: false, reason: 'simulator' };
  }

  await ensureAndroidNotificationChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return { ok: false, reason: 'permission_denied' };
  }

  const projectId = resolveExpoProjectId();
  if (!projectId || projectId === 'replace-with-expo-project-id') {
    return { ok: false, reason: 'no_project_id' };
  }

  try {
    const push = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = push.data?.trim();
    if (!token) return { ok: false, reason: 'unavailable' };
    return { ok: true, token };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export async function postExpoPushTokenToBackend(
  token: string,
  getBearerJwt: () => Promise<string | null>,
): Promise<boolean> {
  const base = getExpoMobileApiOriginHint();
  if (!base) return false;

  let jwt: string | null;
  try {
    jwt = await getBearerJwt();
  } catch {
    jwt = null;
  }
  if (!jwt) return false;

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/api/mobile/push-token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
