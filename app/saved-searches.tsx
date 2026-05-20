import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@clerk/expo';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/OMMText';
import { AppButton } from '@/components/AppButton';
import { slateNavy } from '@/constants/theme';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';
import {
  buyerSavedMetaForRow,
  mergeBuyerSavedSearches,
  type BuyerSavedSearchMergedRow,
} from '@/lib/buyer-saved-searches-merge';
import { fetchMobileHome, type MobileHomePayload } from '@/lib/mobile-home-api';
import { useSavedSearches } from '@/lib/saved-searches-context';

/** Inset from card border — inner `View` only; `Pressable` padding can collapse on some RN builds. */
const CARD_INNER_PAD_H = 34;

function resultsHref(query?: string): Href {
  const ts = Date.now();
  if (query && query.trim()) {
    const enc = encodeURIComponent(query.trim());
    return `/(tabs)?openBuyingSearch=results&buyingQuery=${enc}&_ts=${ts}` as Href;
  }
  return `/(tabs)?openBuyingSearch=results&_ts=${ts}` as Href;
}

function SavedSearchListCard({
  row,
  meta,
  canManage,
  onOpen,
  onToggleAlerts,
  onRemove,
}: {
  row: BuyerSavedSearchMergedRow;
  meta: string;
  canManage: boolean;
  onOpen: () => void;
  onToggleAlerts?: () => void;
  onRemove?: () => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open saved search ${row.title}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.cardPressable, pressed && styles.cardPressed]}>
        <View
          style={[
            styles.cardInner,
            { paddingHorizontal: CARD_INNER_PAD_H },
          ]}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {row.title}
          </Text>
          {row.newCount > 0 ? (
            <View style={styles.badgeWrap}>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>
                  {Math.min(row.newCount, 99)} NEW
                </Text>
              </View>
            </View>
          ) : null}
          <Text
            style={[
              styles.cardCriteria,
              row.newCount > 0 ? styles.cardCriteriaAfterBadge : styles.cardCriteriaSolo,
            ]}>
            {row.criteria}
          </Text>
          <View style={styles.cardDivider} />
          <View style={styles.cardFooter}>
            <View style={styles.footerAlertsCol}>
              <Text style={styles.footerAlertsOuter} selectable={false}>
                <Text style={row.alertsOn ? styles.footerDotOn : styles.footerDotOff}>●</Text>
                <Text
                  style={
                    row.alertsOn ? styles.footerAlertsLabelOn : styles.footerAlertsLabelOff
                  }>
                  {row.alertsOn ? ' ALERTS ON' : ' ALERTS OFF'}
                </Text>
              </Text>
            </View>
            <Text style={styles.footerMeta} numberOfLines={2}>
              {meta}
            </Text>
          </View>
        </View>
      </Pressable>
      {canManage && onToggleAlerts && onRemove ? (
        <View style={[styles.manageRow, { paddingHorizontal: CARD_INNER_PAD_H }]}>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onToggleAlerts}
            style={({ pressed }) => [styles.manageBtn, pressed && { opacity: 0.72 }]}>
            <Text style={styles.manageBtnLabel}>
              {row.alertsOn ? 'Mute alerts' : 'Turn alerts on'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onRemove}
            style={({ pressed }) => [styles.manageBtn, pressed && { opacity: 0.72 }]}>
            <Text style={styles.manageDanger}>Remove</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function SavedSearchesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const { searches: deviceRows, toggleAlerts, removeSearch } = useSavedSearches();
  const [mobileHome, setMobileHome] = useState<MobileHomePayload | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    let alive = true;
    const tokenGetter = async () => (await getTokenRef.current()) ?? null;
    void (async () => {
      const home = await fetchMobileHome(tokenGetter);
      if (!alive) return;
      setMobileHome(home);
    })();
    return () => {
      alive = false;
    };
  }, [isLoaded, isSignedIn]);

  const merged = mergeBuyerSavedSearches(
    deviceRows,
    mobileHome?.buying.savedSearches ?? [],
  );

  const countLabel =
    merged.length === 1
      ? '1 saved search'
      : `${merged.length} saved searches`;

  const confirmRemove = (id: string, title: string) => {
    Alert.alert('Remove saved search?', `Remove "${title}" from this device?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void removeSearch(id);
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.headerSide}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>Saved Searches</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <AppButton
          variant="filled"
          onPress={() => router.replace(resultsHref())}
          textStyle={styles.newSearchBtnText}
          style={styles.newSearchBtn}>
          + NEW SEARCH
        </AppButton>
        <Text style={styles.helper}>
          Get notified the moment a listing or off-market matches your brief.
        </Text>

        <View style={styles.listMetaRow}>
          <Text style={styles.countLabel}>{countLabel}</Text>
          <Text style={styles.sortLabel}>SORT • NEWEST</Text>
        </View>

        {merged.length === 0 ? (
          <Text style={styles.emptyHint}>
            You have no saved searches yet. Explore matches on Buying, then tap{' '}
            <Text style={styles.emptyHintEmphasis}>Save search</Text>.
          </Text>
        ) : (
          merged.map((row) => {
            const canManage = deviceRows.some((r) => r.id === row.id);
            const meta = buyerSavedMetaForRow(row, deviceRows);
            const q = (row.suburbQuery ?? row.title).trim();
            return (
              <View key={row.id} style={styles.cardGap}>
                <SavedSearchListCard
                  row={row}
                  meta={meta}
                  canManage={canManage}
                  onOpen={() => router.replace(resultsHref(q))}
                  onToggleAlerts={
                    canManage
                      ? () => {
                          void toggleAlerts(row.id);
                        }
                      : undefined
                  }
                  onRemove={
                    canManage
                      ? () => {
                          confirmRemove(row.id, row.title);
                        }
                      : undefined
                  }
                />
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerSide: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  scroll: { paddingHorizontal: 24 },
  newSearchBtn: { marginTop: 4 },
  newSearchBtnText: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.6 },
  helper: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    lineHeight: 20,
  },
  listMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
  },
  countLabel: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)' },
  sortLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    letterSpacing: 0.4,
  },
  emptyHint: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    lineHeight: 22,
  },
  emptyHintEmphasis: { color: slateNavy },
  cardGap: { marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
    /* Avoid overflow:hidden — it clips multi-line/footer text inside rounded rects on some RN layouts. */
  },
  cardPressable: {
    alignSelf: 'stretch',
    width: '100%',
  },
  cardPressed: {
    backgroundColor: '#f6f6f6',
  },
  cardInner: {
    alignSelf: 'stretch',
    width: '100%',
    paddingTop: 26,
    paddingBottom: 26,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  badgeWrap: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  newBadge: {
    backgroundColor: '#111111',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  newBadgeText: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: '#fff', letterSpacing: 0.4 },
  cardCriteria: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 22,
  },
  cardCriteriaAfterBadge: {
    marginTop: 12,
  },
  cardCriteriaSolo: {
    marginTop: 16,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 22,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    minHeight: 22,
    paddingBottom: 2,
  },
  footerAlertsCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    justifyContent: 'center',
  },
  footerAlertsOuter: {
    fontSize: 12,
    lineHeight: 19,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.4,
  },
  footerDotOn: { color: '#000000', fontSize: 12, lineHeight: 19 },
  footerDotOff: { color: 'rgba(0, 0, 0, 0.35)', fontSize: 12, lineHeight: 19 },
  footerAlertsLabelOn: {
    fontSize: 12,
    lineHeight: 19,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: 0.35,
  },
  footerAlertsLabelOff: {
    fontSize: 12,
    lineHeight: 19,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 0.35,
  },
  footerMeta: {
    flexShrink: 0,
    maxWidth: '50%',
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    lineHeight: 19,
    textAlign: 'right',
  },
  manageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#fafafa',
  },
  manageBtn: {},
  manageBtnLabel: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: slateNavy,
  },
  manageDanger: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#b91c1c',
  },
});
