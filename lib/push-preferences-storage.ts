import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'omm_push_prefs_v1';

export type PushPrefsStored = {
  pushMessages: boolean;
};

const DEFAULTS: PushPrefsStored = {
  pushMessages: true,
};

export async function loadPushPrefs(): Promise<PushPrefsStored> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<PushPrefsStored>;
    return {
      pushMessages:
        typeof parsed.pushMessages === 'boolean' ? parsed.pushMessages : DEFAULTS.pushMessages,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function savePushPrefs(next: PushPrefsStored): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* offline */
  }
}
