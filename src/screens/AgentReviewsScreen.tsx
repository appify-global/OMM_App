import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { brand } from '../theme/brand';
import { images } from '../constants/images';

type Props = RootStackScreenProps<'AgentReviews'>;

type StarFilter = 'all' | '5' | '4' | '3' | 'photos';

const DIST = [
  { star: 5, pct: 78 },
  { star: 4, pct: 15 },
  { star: 3, pct: 4 },
  { star: 2, pct: 2 },
  { star: 1, pct: 1 },
] as const;

const ALL_REVIEWS = [
  {
    name: 'Sarah Chen',
    role: 'Buyers Agent - BR Realty',
    stars: 5.0,
    text: "Quick replies, SOI was always on hand. Settlement ran smooth. Would recommend Anton to any buyer I work with.",
    date: '14 APR 2026',
    photo: images.reviewer1,
    hasPhoto: true,
  },
  {
    name: 'Tom Reid',
    role: 'Listing Agent - Marshall White',
    stars: 4.8,
    text: 'Clear authority docs, fair commission split, no surprises at settlement. Would work with again.',
    date: '02 APR 2026',
    photo: images.reviewer2,
    hasPhoto: false,
  },
  {
    name: 'Anita Wong',
    role: 'Buyers Agent - Jellis Craig',
    stars: 5.0,
    text: "Great comms around the vendor's expectations. Helped my client land the place $40k under asking.",
    date: '28 MAR 2026',
    photo: images.reviewer3,
    hasPhoto: true,
  },
  {
    name: 'Marcus Lee',
    role: 'Listing Agent - Belle Property',
    stars: 4.6,
    text: 'On-time SOI, responsive on weekends. Minor delay on the contract draft but otherwise solid.',
    date: '19 MAR 2026',
    photo: images.reviewer4,
    hasPhoto: false,
  },
] as const;

export function AgentReviewsScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<StarFilter>('all');

  const list = useMemo(() => {
    if (filter === 'all') return ALL_REVIEWS;
    if (filter === 'photos') return ALL_REVIEWS.filter((r) => r.hasPhoto);
    if (filter === '3') {
      return ALL_REVIEWS.filter((r) => r.stars <= 3.4);
    }
    return ALL_REVIEWS.filter((r) => {
      if (filter === '5') return Math.floor(r.stars) >= 5;
      if (filter === '4') return Math.floor(r.stars) === 4;
      return false;
    });
  }, [filter]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.topIcon}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={26} color={brand.charcoal} />
          </Pressable>
          <Text style={styles.topTitle}>Reviews</Text>
          <Pressable style={styles.topIcon}>
            <Ionicons name="ellipsis-vertical" size={22} color={brand.charcoal} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Text style={styles.agentName}>Anton Zhouk</Text>
              <Text style={styles.agentMeta}>Listing Agent - Ray White Hawthorn</Text>
            </View>
          </View>
          <View style={styles.ratingBlock}>
            <View style={styles.ratingLeft}>
              <Text style={styles.bigNum}>4.9</Text>
              <View style={styles.five}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons key={`s-${i}`} name="star" size={16} color={brand.charcoal} />
                ))}
              </View>
              <Text style={styles.basedText}>Based on 42 reviews</Text>
            </View>
            <View style={styles.barsCol}>
              {DIST.map((row) => (
                <View key={row.star} style={styles.barRow}>
                  <Text style={styles.barLabel}>
                    {row.star} {row.star === 1 ? 'star' : 'stars'}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${row.pct}%` }]} />
                  </View>
                  <Text style={styles.barPct}>{row.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {(
            [
              ['all', 'ALL'] as [StarFilter, string],
              ['5', '5★'] as [StarFilter, string],
              ['4', '4★'] as [StarFilter, string],
              ['3', '3★ ↓'] as [StarFilter, string],
              ['photos', 'WITH PHOTOS'] as [StarFilter, string],
            ] as const
          ).map(([id, label]) => {
            const active = filter === id;
            return (
              <Pressable
                key={id}
                onPress={() => setFilter(id)}
                style={[styles.chip, active && styles.chipOn]}
              >
                <Text style={[styles.chipT, active && styles.chipTOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.subHeadRow}>
          <Text style={styles.subHeadL}>42 REVIEWS</Text>
          <Text style={styles.subHeadR}>NEWEST ↓</Text>
        </View>

        {list.map((r) => (
          <View key={r.name} style={styles.reviewItem}>
            <View style={styles.reviewItemTop}>
              <Image source={r.photo} style={styles.revPhoto} />
              <View style={styles.revInfo}>
                <Text style={styles.revName}>{r.name}</Text>
                <Text style={styles.revRole}>{r.role}</Text>
              </View>
              <Text style={styles.revStarR}>★ {r.stars.toFixed(1)}</Text>
            </View>
            <Text style={styles.revQuote}>&ldquo;{r.text}&rdquo;</Text>
            <Text style={styles.revDate}>{r.date}</Text>
          </View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0eeeb' },
  safe: { backgroundColor: '#f0eeeb' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: brand.space.xs },
  topIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: brand.type.subtitle,
    fontWeight: brand.type.weightMedium,
    color: brand.charcoal,
  },
  scroll: { padding: brand.space.sm, paddingTop: 0 },
  summaryCard: {
    backgroundColor: brand.white,
    borderRadius: brand.radius.lg,
    padding: brand.space.md,
    marginBottom: brand.space.sm,
  },
  summaryRow: { marginBottom: brand.space.md },
  summaryLeft: {},
  agentName: { fontSize: 18, fontWeight: '600', color: brand.charcoal },
  agentMeta: { color: brand.sage, fontSize: brand.type.caption, marginTop: 4 },
  ratingBlock: { flexDirection: 'row', alignItems: 'flex-start' },
  ratingLeft: { marginRight: 16, width: 100 },
  bigNum: { fontSize: 40, fontWeight: '600', color: brand.charcoal },
  five: { flexDirection: 'row', marginTop: 4, marginBottom: 4 },
  basedText: { fontSize: 11, color: brand.sage, marginTop: 2 },
  barsCol: { flex: 1 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  barLabel: { width: 50, fontSize: 10, color: brand.sage },
  barTrack: { flex: 1, height: 6, backgroundColor: brand.cream, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: brand.charcoal, borderRadius: 3 },
  barPct: { width: 32, fontSize: 10, color: brand.sage, textAlign: 'right' },
  chips: { gap: 8, marginBottom: 12, flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  chipOn: { backgroundColor: brand.terracotta, borderColor: brand.terracotta },
  chipT: { fontSize: 12, color: brand.charcoal, fontWeight: '600' },
  chipTOn: { color: brand.warmWhite },
  subHeadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  subHeadL: { fontSize: 10, color: brand.sage, letterSpacing: 0.5 },
  subHeadR: { fontSize: 10, color: brand.sage, letterSpacing: 0.5 },
  reviewItem: {
    backgroundColor: brand.white,
    borderRadius: brand.radius.md,
    padding: brand.space.sm,
    marginBottom: brand.space.sm,
  },
  reviewItemTop: { flexDirection: 'row', alignItems: 'center' },
  revPhoto: { width: 40, height: 40, borderRadius: 20 },
  revInfo: { flex: 1, marginLeft: 10 },
  revName: { fontWeight: '600', color: brand.charcoal },
  revRole: { fontSize: 12, color: brand.sage, marginTop: 2 },
  revStarR: { fontWeight: '600', color: brand.charcoal, fontSize: 13 },
  revQuote: { color: brand.charcoal, lineHeight: 22, fontSize: 14, marginTop: 8 },
  revDate: { fontSize: 11, color: brand.sage, marginTop: 8 },
});
