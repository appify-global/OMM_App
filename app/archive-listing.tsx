import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
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
import {
  mergePublishedListingArchived,
  isPublishedListingArchived,
} from '@/lib/agent-published-listings';
import { useAgentPublishedListings } from '@/lib/agent-published-listings-context';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

/**
 * Archive listing confirmation.
 * [Figma 1053:9411](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-9411&t=2eZigRM0BwNtC5wd-4)
 */

const FIELD_RADIUS = 12;
const ACCENT = '#C07A50';

const CARD_OUTLINE = {
  borderWidth: FIELD_OUTLINE_WIDTH,
  borderColor: FIELD_OUTLINE_COLOR,
  backgroundColor: '#fff',
};

const BULLETS = [
  'Listing becomes invisible to buyers',
  'Removed from search results',
  'Can be restored anytime',
];

function firstQueryParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default function ArchiveListingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { listingId: listingIdParam } = useLocalSearchParams<{ listingId?: string }>();
  const listingId = firstQueryParam(listingIdParam)?.trim();
  const { listings, ready, updateListing } = useAgentPublishedListings();

  const listing = useMemo(
    () => (listingId ? listings.find((l) => l.id === listingId) : undefined),
    [listingId, listings],
  );

  const displayTitle = listing?.titleLine ?? listing?.addressLine ?? 'this listing';

  const archive = async () => {
    if (!listingId || !listing) {
      Alert.alert(
        'Listing unavailable',
        'Open Manage listings and choose a listing you published from this device.',
      );
      return;
    }
    if (isPublishedListingArchived(listing)) {
      Alert.alert('Already archived', 'This listing is already in your Archive tab.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }
    const next = mergePublishedListingArchived(listing, true);
    const ok = await updateListing(next);
    if (!ok) {
      Alert.alert('Could not archive', 'Listing could not be updated on this device.');
      return;
    }
    Alert.alert('Archived', 'Listing moved to Archive — hidden from buyers.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (!listingId) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingHorizontal: layout.screenGutter }]}>
        <Text style={styles.title}>Archive listing</Text>
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
        <Text style={styles.title}>Archive listing</Text>
        <Text style={styles.helperMuted}>
          Only listings published from this device can be archived here. Demo listings use sample data that
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
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.title}>Archive listing</Text>

        <Text style={styles.lead}>
          Archiving hides <Text style={styles.leadBold}>{displayTitle}</Text> from active search. Buyers will
          no longer see it. You can restore it later from the Archive tab.
        </Text>

        <View style={[styles.infoCard, CARD_OUTLINE]}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="alert-circle" size={22} color={ACCENT} />
            <Text style={styles.infoTitle}>Your data is preserved</Text>
          </View>
          <Text style={styles.infoBody}>
            This does not delete your listing data. All photos, details, and performance history remain
            accessible.
          </Text>
        </View>

        <View style={[styles.infoCard, CARD_OUTLINE]}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="archive-outline" size={22} color="rgba(0, 0, 0, 0.45)" />
            <Text style={styles.infoTitle}>What happens when you archive</Text>
          </View>
          {BULLETS.map((line, i) => (
            <View
              key={line}
              style={[styles.bulletRow, i === BULLETS.length - 1 && styles.bulletRowLast]}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.archiveBtn}
          onPress={() => void archive()}
          accessibilityRole="button">
          <Text style={styles.archiveBtnText}>ARCHIVE LISTING</Text>
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
    marginBottom: 14,
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
  lead: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 22,
    marginBottom: 20,
  },
  leadBold: { fontFamily: 'Satoshi-Medium', color: '#000000' },
  infoCard: {
    borderRadius: FIELD_RADIUS,
    padding: 16,
    marginBottom: 14,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', flex: 1 },
  infoBody: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 21,
    paddingLeft: 32,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
    paddingLeft: 32,
  },
  bulletRowLast: { marginBottom: 0 },
  bulletDot: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.45)',
    lineHeight: 21,
    marginTop: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 21,
  },
  archiveBtn: {
    backgroundColor: accent,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  archiveBtnText: {
    color: ink,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.45,
  },
  cancelWrap: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  cancel: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)' },
});
