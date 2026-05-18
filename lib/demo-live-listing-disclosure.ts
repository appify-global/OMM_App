import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'omm.demo.liveListing.addressDisclosure';

export type LiveListingAddressDisclosure = 'disclose' | 'not_disclose';

export function parseAddressDisclosureParam(raw: string | string[] | undefined): LiveListingAddressDisclosure {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === 'not_disclose' ? 'not_disclose' : 'disclose';
}

export async function persistDemoLiveListingDisclosure(value: LiveListingAddressDisclosure): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, value);
}

export async function readDemoLiveListingDisclosure(): Promise<LiveListingAddressDisclosure | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw !== 'disclose' && raw !== 'not_disclose') return null;
  return raw;
}
