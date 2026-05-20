import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text } from '@/components/OMMText';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { accent, ink, layout } from '@/constants/theme';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';
import {
  mergePublishedListingStatus,
  resolvedPublishedListingStatus,
  type PublishedListingStatus,
} from '@/lib/agent-published-listings';
import { useAgentPublishedListings } from '@/lib/agent-published-listings-context';

/**
 * Change listing status — option cards + radio.
 * [Figma 1053:9353](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-9353&t=2eZigRM0BwNtC5wd-4)
 */

const FIELD_RADIUS = 7;

const CARD_OUTLINE = {
  borderWidth: FIELD_OUTLINE_WIDTH,
  borderColor: FIELD_OUTLINE_COLOR,
  backgroundColor: '#fff',
};

const OPTIONS: { id: PublishedListingStatus; title: string; description: string }[] = [
  {
    id: 'live',
    title: 'Live',
    description: 'Live on marketplace • visible to buyers',
  },
  {
    id: 'pending',
    title: 'Pending',
    description: 'Under offer or contract in progress',
  },
  {
    id: 'sold',
    title: 'Sold',
    description: 'Remove from active search',
  },
];

function firstQueryParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={styles.radioOuter}>
      {selected ? <View style={styles.radioInner} /> : null}
    </View>
  );
}

export default function ChangeListingStatusScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { listingId: listingIdParam } = useLocalSearchParams<{ listingId?: string }>();
  const listingId = firstQueryParam(listingIdParam)?.trim();
  const { listings, ready, updateListing } = useAgentPublishedListings();

  const listing = useMemo(
    () => (listingId ? listings.find((l) => l.id === listingId) : undefined),
    [listingId, listings],
  );

  const [status, setStatus] = useState<PublishedListingStatus>('live');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing) {
      setStatus(resolvedPublishedListingStatus(listing));
    }
  }, [listing]);

  const save = useCallback(async () => {
    if (!listingId || !listing) {
      Alert.alert(
        'Listing unavailable',
        'Open Manage listings and choose a listing you published from this device.',
      );
      return;
    }
    setSaving(true);
    try {
      const next = mergePublishedListingStatus(listing, status);
      const ok = await updateListing(next);
      if (!ok) {
        Alert.alert('Could not save', 'Status could not be updated on this device.');
        return;
      }
      Alert.alert('Updated', 'Listing status saved.', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setSaving(false);
    }
  }, [listingId, listing, status, updateListing, router]);

  if (!listingId) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingHorizontal: layout.screenGutter }]}>
        <Text style={styles.title}>Change status</Text>
        <Text style={styles.helperMuted}>Missing listing reference.</Text>
        <View style={{ marginTop: 28 }}>
          <AppButton variant="filled" onPress={() => router.back()} textStyle={styles.primaryBtnLabel}>
            GO BACK
          </AppButton>
        </View>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top + 40 }]}>
        <ActivityIndicator color="#111" />
        <Text style={[styles.helperMuted, { marginTop: 16 }]}>Loading listing…</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingHorizontal: layout.screenGutter }]}>
        <Text style={styles.title}>Change status</Text>
        <Text style={styles.helperMuted}>
          Only listings published from this device can be updated here. Demo listings use sample data that
          isn&apos;t saved locally.
        </Text>
        <View style={{ marginTop: 28 }}>
          <AppButton variant="filled" onPress={() => router.back()} textStyle={styles.primaryBtnLabel}>
            GO BACK
          </AppButton>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.title}>Change status</Text>
        <Text style={styles.subtitle}>Select a new status for this listing.</Text>

        <View style={styles.options}>
          {OPTIONS.map((opt) => {
            const selected = status === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setStatus(opt.id)}
                style={[styles.optionCard, CARD_OUTLINE]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}>
                <Radio selected={selected} />
                <View style={styles.optionTextCol}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  <Text style={styles.optionDesc}>{opt.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.updateBtn, saving && styles.updateBtnDisabled]}
          onPress={() => void save()}
          disabled={saving}
          accessibilityRole="button">
          <Text style={styles.updateBtnText}>{saving ? 'SAVING…' : 'UPDATE STATUS'}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          style={styles.cancelWrap}
          accessibilityRole="button"
          accessibilityLabel="Cancel">
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  centered: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: layout.screenGutter },
  scroll: { paddingHorizontal: layout.screenGutter, paddingTop: 4 },
  title: {
    fontSize: 28,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 20,
    marginBottom: 24,
  },
  helperMuted: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 22,
  },
  primaryBtnLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.35,
  },
  options: { gap: 12, marginBottom: 28 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: FIELD_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: accent,
  },
  optionTextCol: { flex: 1, minWidth: 0 },
  optionTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', marginBottom: 6 },
  optionDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 19,
  },
  updateBtn: {
    backgroundColor: accent,
    height: 52,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnDisabled: { opacity: 0.65 },
  updateBtnText: {
    color: ink,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.45,
  },
  cancelWrap: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  cancel: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)' },
});
