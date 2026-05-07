import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Agent — full active listings (See all).
 * [Figma 1053:6822](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-6822&t=2eZigRM0BwNtC5wd-4)
 */

const AVATAR = require('@/assets/images/welcome-bg.jpg');
const H_PAD = 16;
const CARD_R = 12;
const AGENT_CARD_R = 10;

type ListingStatus = 'live' | 'under_offer' | 'sold';

type ListingRow = {
  id: string;
  address: string;
  specs: string;
  /** Price range or sold line, e.g. "$2.1m — $2.3m" or "SOLD $2.65m" */
  priceLine: string;
  status: ListingStatus;
  listedLine: string;
  enquiries: number;
};

const ALL_LISTINGS: ListingRow[] = [
  {
    id: '1',
    address: '22 Lilac Ave, Hawthorn',
    specs: 'HOUSE · 4 BED · 2 BATH · 2 CAR',
    priceLine: '$2.1m — $2.3m',
    status: 'live',
    listedLine: 'LISTED 3 DAYS AGO',
    enquiries: 12,
  },
  {
    id: '2',
    address: '18 Gordon St, Balwyn',
    specs: 'HOUSE · 4 BED · 2 BATH · 2 CAR',
    priceLine: '$2.1m — $2.3m',
    status: 'under_offer',
    listedLine: 'LISTED 12 WEEKS AGO',
    enquiries: 12,
  },
  {
    id: '3',
    address: '7 Wattle Ct, Canterbury',
    specs: 'HOUSE · 4 BED · 2 BATH · 2 CAR',
    priceLine: 'SOLD $2.65m',
    status: 'sold',
    listedLine: 'LISTED 3 DAYS AGO',
    enquiries: 12,
  },
  {
    id: '4',
    address: '6/40 Park Rd, Camberwell',
    specs: 'APARTMENT · 2 BED · 1 BATH · 1 CAR',
    priceLine: '$850k — $920k',
    status: 'live',
    listedLine: 'LISTED 12 DAYS AGO',
    enquiries: 8,
  },
];

const FILTER_CHIPS: { key: 'all' | ListingStatus; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'live', label: 'LIVE' },
  { key: 'under_offer', label: 'UNDER OFFER' },
  { key: 'sold', label: 'SOLD' },
];

function statusLabel(s: ListingStatus): string {
  switch (s) {
    case 'live':
      return 'LIVE';
    case 'under_offer':
      return 'UNDER OFFER';
    case 'sold':
      return 'SOLD';
  }
}

export default function AgentActiveListingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTER_CHIPS)[number]['key']>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return ALL_LISTINGS;
    return ALL_LISTINGS.filter((L) => L.status === filter);
  }, [filter]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.navSide}>
          <FontAwesome name="chevron-left" size={20} color="#1c1c1e" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Active listings</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.agentCard}>
          <View style={styles.avatarWrap}>
            <Image source={AVATAR} style={styles.agentAvatar} resizeMode="cover" />
            <View style={styles.verifiedBadge}>
              <FontAwesome name="check" size={8} color="#fff" />
            </View>
          </View>
          <View style={styles.agentText}>
            <Text style={styles.agentName}>Anton Zhouk</Text>
            <Text style={styles.agentRole}>Listing Agent · Ray White Hawthorn</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsInner}>
          {FILTER_CHIPS.map((c) => {
            const on = filter === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setFilter(c.key)}
                style={[styles.chip, on && styles.chipOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}>
                <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.listMetaRow}>
          <Text style={styles.listMetaLeft}>
            {filter === 'all' ? '12' : String(filtered.length)} LISTINGS
          </Text>
          <Text style={styles.listMetaRight}>NEWEST ↓</Text>
        </View>

        {filtered.map((L) => (
          <Pressable
            key={L.id}
            onPress={() => router.push('/view-live-listing' as Href)}
            accessibilityRole="button"
            accessibilityLabel={`View listing, ${L.address}`}
            style={({ pressed }) => [pressed && styles.listingCardPressed]}>
            <View style={styles.listingCard}>
              <View style={styles.listingImageBlock}>
                <Image source={AVATAR} style={styles.listingHero} resizeMode="cover" />
                <View
                  style={[
                    styles.statusBadge,
                    L.status === 'under_offer' && styles.statusBadgeWide,
                  ]}>
                  <Text style={styles.statusBadgeText}>{statusLabel(L.status)}</Text>
                </View>
              </View>
              <View style={styles.listingPad}>
                <Text style={styles.listingAddr}>{L.address}</Text>
                <Text style={styles.listingSpecs}>{L.specs}</Text>
                <Text style={styles.listingPrice}>{L.priceLine}</Text>
                <View style={styles.listingDivider} />
                <View style={styles.listingFooter}>
                  <Text style={styles.footerMeta}>{L.listedLine}</Text>
                  <Text style={styles.footerMeta}>{L.enquiries} ENQUIRIES</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  navSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontWeight: '700', color: '#1c1c1e' },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 12 },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: AGENT_CARD_R,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  avatarWrap: { position: 'relative', marginRight: 14 },
  agentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8e4df' },
  verifiedBadge: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  agentText: { flex: 1, minWidth: 0 },
  agentName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  agentRole: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(60,60,67,0.55)',
    marginTop: 4,
  },
  chipsScroll: { marginBottom: 14, marginHorizontal: -H_PAD },
  chipsInner: {
    paddingHorizontal: H_PAD,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f5f1ed',
  },
  chipOn: {
    backgroundColor: '#1c1c1e',
    borderColor: '#1c1c1e',
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#1a1a1a',
    letterSpacing: 0.66,
  },
  chipLabelOn: {
    color: '#fff',
    fontWeight: '400',
  },
  listMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listMetaLeft: {
    fontSize: 11,
    fontWeight: '400',
    color: '#1a1a1a',
    letterSpacing: 0.66,
  },
  listMetaRight: {
    fontSize: 11,
    fontWeight: '400',
    color: '#1a1a1a',
    letterSpacing: 0.66,
  },
  listingCardPressed: { opacity: 0.96 },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_R,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  listingImageBlock: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#e8e4df',
  },
  listingHero: { width: '100%', height: '100%' },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 11,
    minHeight: 22,
    justifyContent: 'center',
  },
  statusBadgeWide: {
    paddingHorizontal: 14,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#fff',
    letterSpacing: 0.66,
  },
  listingPad: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  listingAddr: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  listingSpecs: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(60,60,67,0.55)',
    marginTop: 8,
    letterSpacing: 0.66,
  },
  listingPrice: { fontSize: 18, fontWeight: '400', color: '#1a1a1a', marginTop: 12 },
  listingDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#f5f1ed',
    marginTop: 16,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  footerMeta: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(60,60,67,0.55)',
    letterSpacing: 0.66,
  },
});
