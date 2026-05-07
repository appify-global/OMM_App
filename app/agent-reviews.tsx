import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
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
 * Agent reviews — full list & distribution.
 * [Figma 1053:6675](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-6675&t=2eZigRM0BwNtC5wd-4)
 */

const AVATAR = require('@/assets/images/welcome-bg.jpg');
const H_PAD = 20;
const CARD_R = 14;
const GOLD = '#c9a227';

const DISTRIBUTION = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 15 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 1 },
] as const;

const CHIPS: { key: 'all' | '5' | '4' | '3' | 'photos'; label: string; showChevron?: boolean }[] = [
  { key: 'all', label: 'ALL' },
  { key: '5', label: '5★' },
  { key: '4', label: '4★' },
  { key: '3', label: '3★', showChevron: true },
  { key: 'photos', label: 'WITH PHOTOS' },
];

const ALL_REVIEWS = [
  {
    name: 'Sarah Chen',
    role: 'Buyers Agent • BR Realty',
    rating: '5.0',
    quote: 'Quick replies, SOI was always on hand. Settlement ran smooth.',
    date: '14 APR 2026',
  },
  {
    name: 'Tom Reid',
    role: 'Listing Agent • Marshall White',
    rating: '4.8',
    quote: 'Clear authority docs, fair commission split. Would work with again.',
    date: '02 APR 2026',
  },
  {
    name: 'Anita Wong',
    role: 'Buyers Agent · Eastside',
    rating: '5.0',
    quote:
      "Great comms around the vendor's expectations. Helped my client land the place $40k under asking.",
    date: '28 MAR 2026',
  },
  {
    name: 'Marcus Lee',
    role: 'Vendor · Auction',
    rating: '4.6',
    quote:
      'On-time SOI, responsive on weekends. Minor delay on the contract draft but otherwise solid.',
    date: '19 MAR 2026',
  },
] as const;

type ChipKey = (typeof CHIPS)[number]['key'];

export default function AgentReviewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [chip, setChip] = useState<ChipKey>('all');

  const filteredReviews = useMemo(() => {
    if (chip === 'all' || chip === 'photos') return [...ALL_REVIEWS];
    return ALL_REVIEWS.filter((r) => {
      const v = parseFloat(r.rating);
      if (chip === '5') return v >= 4.95;
      if (chip === '4') return v >= 4.0 && v < 5;
      if (chip === '3') return v >= 3.0 && v < 4;
      return true;
    });
  }, [chip]);

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
          <Text style={styles.navTitle}>Reviews</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryName}>Anton Zhouk</Text>
          <Text style={styles.summaryRole}>Listing Agent · Ray White Hawthorn</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Text style={styles.bigScore}>4.9</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <FontAwesome key={i} name="star" size={12} color={GOLD} />
                ))}
              </View>
              <Text style={styles.basedOn}>Based on 42 reviews</Text>
            </View>
            <View style={styles.summaryRight}>
              {DISTRIBUTION.map((row) => (
                <View key={row.stars} style={styles.distRow}>
                  <Text style={styles.distLabel}>{row.stars}★</Text>
                  <View style={styles.distTrack}>
                    <View style={[styles.distFill, { width: `${row.pct}%` }]} />
                  </View>
                  <Text style={styles.distPct}>{row.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsInner}>
          {CHIPS.map((c) => {
            const on = chip === c.key;
            const photosMuted = c.key === 'photos' && !on;
            return (
              <Pressable
                key={c.key}
                onPress={() => setChip(c.key)}
                style={[styles.chip, on && styles.chipOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}>
                <Text
                  style={[
                    styles.chipLabel,
                    on && styles.chipLabelOn,
                    photosMuted && styles.chipLabelPhotosMuted,
                  ]}>
                  {c.label}
                </Text>
                {c.showChevron ? (
                  <FontAwesome
                    name="chevron-down"
                    size={10}
                    color={on ? '#fff' : '#1c1c1e'}
                    style={styles.chipChevron}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.listMetaRow}>
          <Text style={styles.listMetaLeft}>{chip === 'all' ? '42 REVIEWS' : `${filteredReviews.length} REVIEWS`}</Text>
          <Text style={styles.listMetaRight}>NEWEST ↓</Text>
        </View>

        {filteredReviews.map((r) => (
          <View key={`${r.name}-${r.date}`} style={styles.reviewCard}>
            <View style={styles.reviewTop}>
              <Image source={AVATAR} style={styles.reviewAvatar} resizeMode="cover" />
              <View style={styles.reviewMeta}>
                <Text style={styles.reviewName}>{r.name}</Text>
                <Text style={styles.reviewRole}>{r.role}</Text>
              </View>
              <Text style={styles.reviewStars}>★ {r.rating}</Text>
            </View>
            <View style={styles.reviewBodyDivider} />
            <Text style={styles.reviewQuote}>{r.quote}</Text>
            <Text style={styles.reviewDate}>{r.date}</Text>
          </View>
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
  navCenter: { flex: 1, alignItems: 'center' },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#1c1c1e' },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 16 },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_R,
    padding: 18,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  summaryName: { fontSize: 18, fontWeight: '600', color: '#1c1c1e' },
  summaryRole: { fontSize: 13, fontWeight: '400', color: 'rgba(60,60,67,0.5)', marginTop: 4, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 16 },
  summaryLeft: { width: 118 },
  summaryRight: { flex: 1, minWidth: 0, justifyContent: 'center', gap: 8 },
  bigScore: { fontSize: 36, fontWeight: '600', color: '#1c1c1e', letterSpacing: -1 },
  starsRow: { flexDirection: 'row', gap: 3, marginTop: 6 },
  basedOn: { fontSize: 11, fontWeight: '500', color: 'rgba(60,60,67,0.45)', marginTop: 8 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  distLabel: { width: 22, fontSize: 10, fontWeight: '600', color: 'rgba(60,60,67,0.45)' },
  distTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(60,60,67,0.1)',
    overflow: 'hidden',
  },
  distFill: { height: '100%', borderRadius: 3, backgroundColor: '#1c1c1e' },
  distPct: { width: 32, fontSize: 10, fontWeight: '600', color: 'rgba(60,60,67,0.45)', textAlign: 'right' },
  chipsScroll: { marginBottom: 14, marginHorizontal: -H_PAD },
  chipsInner: { paddingHorizontal: H_PAD, gap: 8, flexDirection: 'row', alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60,60,67,0.22)',
    backgroundColor: '#fff',
  },
  chipOn: {
    backgroundColor: '#1c1c1e',
    borderColor: '#1c1c1e',
    borderWidth: 1,
  },
  chipLabel: { fontSize: 11, fontWeight: '600', color: '#1c1c1e', letterSpacing: 0.35 },
  chipLabelOn: { color: '#fff' },
  chipLabelPhotosMuted: { color: 'rgba(60,60,67,0.42)' },
  chipChevron: { marginLeft: 4 },
  listMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listMetaLeft: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(60,60,67,0.5)',
    letterSpacing: 0.6,
  },
  listMetaRight: { fontSize: 11, fontWeight: '600', color: '#1c1c1e', letterSpacing: 0.35 },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_R,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center' },
  reviewBodyDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.1)',
    marginTop: 12,
    marginBottom: 12,
  },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8e4df' },
  reviewMeta: { flex: 1, marginLeft: 12, minWidth: 0 },
  reviewName: { fontSize: 15, fontWeight: '600', color: '#1c1c1e' },
  reviewRole: { fontSize: 12, fontWeight: '400', color: 'rgba(60,60,67,0.5)', marginTop: 2 },
  reviewStars: { fontSize: 13, fontWeight: '600', color: '#1c1c1e' },
  reviewQuote: { fontSize: 14, fontWeight: '400', color: '#1c1c1e', lineHeight: 21 },
  reviewDate: { marginTop: 12, fontSize: 12, fontWeight: '500', color: 'rgba(60,60,67,0.45)' },
});
