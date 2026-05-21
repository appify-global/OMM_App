import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@clerk/expo';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text } from '@/components/OMMText';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, borderHairline, Fonts, ink, inkMuted, palette, slateNavy } from '@/constants/theme';
import { useAgentPublishedListings } from '@/lib/agent-published-listings-context';
import {
  isPublishedListingArchived,
  publishedToMobileHomeListing,
  resolvedPublishedListingStatus,
} from '@/lib/agent-published-listings';
import {
  filterAuthorityRows,
  formatAuthorityDaysLeft,
  mergeAuthorityExpiringRows,
  soiStatusPill,
  type AuthorityExpiringFilter,
  type AuthorityExpiringRow,
} from '@/lib/home-soi-authority';
import { fetchMobileHome } from '@/lib/mobile-home-api';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';

/** [Figma 1053:1981](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-1981) */

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}>
      <Text style={[styles.chipLabel, active && styles.chipLabelOn]}>{label}</Text>
    </Pressable>
  );
}

function AuthorityListCard({
  title,
  address,
  daysLeft,
  soiLine,
  onPress,
}: {
  title: string;
  address: string;
  daysLeft: string;
  soiLine: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.daysPill}>
          <Text style={styles.daysPillText}>{daysLeft}</Text>
        </View>
      </View>
      <Text style={styles.cardAddr} numberOfLines={2}>
        {address}
      </Text>
      <Text style={styles.cardSoi}>{soiLine}</Text>
      <View style={styles.cardRule} />
      <View style={styles.cardActions}>
        <Text style={styles.actionStrong}>RENEW AUTHORITY</Text>
        <Text style={styles.actionBullet}> • </Text>
        <Text style={styles.actionMuted}>CONTACT VENDOR</Text>
      </View>
    </Pressable>
  );
}

export default function AuthorityExpiringScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const hPad = useScreenHorizontalPadding();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const { listings: publishedListings } = useAgentPublishedListings();
  const [filter, setFilter] = useState<AuthorityExpiringFilter>('all');
  const [authorityRows, setAuthorityRows] = useState<AuthorityExpiringRow[]>([]);
  const [ready, setReady] = useState(false);

  const loadAuthorityRows = useCallback(async () => {
    if (!isLoaded) return;
    const tokenGetter = async () => (await getTokenRef.current()) ?? null;
    const home = await fetchMobileHome(tokenGetter);
    const pipelinePublished = publishedListings
      .filter((p) => !isPublishedListingArchived(p))
      .filter((p) => resolvedPublishedListingStatus(p) !== 'sold')
      .map(publishedToMobileHomeListing);
    const rows = mergeAuthorityExpiringRows(
      home?.selling.authorityExpiringSoon ?? [],
      pipelinePublished,
    );
    setAuthorityRows(rows);
    setReady(true);
  }, [isLoaded, publishedListings]);

  useEffect(() => {
    void loadAuthorityRows();
  }, [loadAuthorityRows, isSignedIn]);

  useFocusEffect(
    useCallback(() => {
      void loadAuthorityRows();
    }, [loadAuthorityRows]),
  );

  const filtered = useMemo(
    () => filterAuthorityRows(authorityRows, filter),
    [authorityRows, filter],
  );

  const openListing = useCallback(
    (listingId: string) => {
      router.push({
        pathname: '/view-live-listing',
        params: { listingId },
      });
    },
    [router],
  );

  const count = filtered.length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.headerChrome, hPad]}>
        <ScreenHeader title="Authority expiring" onBack={() => router.back()} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
        <View style={[styles.stickyFilters, hPad]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterStrip}>
            <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
            <FilterChip label="Week" active={filter === 'week'} onPress={() => setFilter('week')} />
            <FilterChip label="Month" active={filter === 'month'} onPress={() => setFilter('month')} />
            <FilterChip
              label="Expired"
              active={filter === 'expired'}
              onPress={() => setFilter('expired')}
            />
          </ScrollView>
        </View>

        <View style={[styles.body, hPad]}>
          {!ready ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={slateNavy} />
            </View>
          ) : (
            <>
              <View style={styles.metaRow}>
                <Text style={styles.metaCount}>
                  {count} listing{count === 1 ? '' : 's'} expiring
                </Text>
                <Text style={styles.metaSort}>SORT • SOONEST</Text>
              </View>

              {count === 0 ? (
                <Text style={styles.emptyCopy}>
                  {authorityRows.length === 0
                    ? 'No authorities expiring in the next 30 days.'
                    : 'Nothing in this filter.'}
                </Text>
              ) : (
                filtered.map((item) => (
                  <AuthorityListCard
                    key={item.id}
                    title={item.title}
                    address={item.address}
                    daysLeft={formatAuthorityDaysLeft(item.daysLeft)}
                    soiLine={soiStatusPill(item.soiAttached)}
                    onPress={() => openListing(item.id)}
                  />
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.white },
  headerChrome: {
    paddingBottom: 4,
  },
  stickyFilters: {
    backgroundColor: palette.white,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderHairline,
  },
  body: {
    paddingTop: 16,
  },
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: inkMuted,
    fontFamily: Fonts.sansMedium,
  },
  filterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    height: 31,
    paddingHorizontal: 14,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: accent },
  chipOff: { backgroundColor: 'rgba(0,0,0,0.06)' },
  chipLabel: {
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    color: inkMuted,
  },
  chipLabelOn: { color: palette.white },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metaCount: {
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    color: ink,
  },
  metaSort: {
    fontSize: 11,
    fontFamily: Fonts.sansMedium,
    color: inkMuted,
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: borderHairline,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.sansMedium,
    color: ink,
  },
  daysPill: {
    backgroundColor: slateNavy,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  daysPillText: {
    fontSize: 10,
    fontFamily: Fonts.sansMedium,
    color: palette.white,
    letterSpacing: 0.3,
  },
  cardAddr: {
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    color: inkMuted,
    marginBottom: 8,
  },
  cardSoi: {
    fontSize: 11,
    fontFamily: Fonts.sansMedium,
    color: inkMuted,
    letterSpacing: 0.3,
  },
  cardRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: borderHairline,
    marginVertical: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionStrong: {
    fontSize: 11,
    fontFamily: Fonts.sansMedium,
    color: ink,
    letterSpacing: 0.4,
  },
  actionBullet: {
    fontSize: 11,
    color: inkMuted,
  },
  actionMuted: {
    fontSize: 11,
    fontFamily: Fonts.sansMedium,
    color: inkMuted,
    letterSpacing: 0.4,
  },
});
