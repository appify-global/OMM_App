import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { DisputeStatus } from '@/lib/disputes-mock';
import { DISPUTES_LIST } from '@/lib/disputes-mock';

/**
 * Disputes hub — filters + dashed cards + raise CTA.
 * [Figma 1053:2793](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-2793&t=2eZigRM0BwNtC5wd-4)
 */

const H_PAD = 20;
const BLOCK_GAP = 24;
const LIST_GAP = 14;
const AFTER_INTRO = 16;
const AFTER_FILTERS = 16;
const STROKE = 'rgba(60,60,67,0.55)';
const STROKE_W = 1.5;
const DASH = '5 4';
const MUTED = 'rgba(60,60,67,0.55)';
const CARD_R = 8;

type FilterKey = 'all' | DisputeStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'OPEN' },
  { key: 'under_review', label: 'UNDER REVIEW' },
  { key: 'resolved', label: 'RESOLVED' },
];

function DashedFrame({
  width,
  height,
  borderRadius,
}: {
  width: number;
  height: number;
  borderRadius: number;
}) {
  if (width <= 0 || height <= 0) return null;
  const inset = STROKE_W / 2;
  return (
    <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
      <Rect
        x={inset}
        y={inset}
        width={Math.max(0, width - STROKE_W)}
        height={Math.max(0, height - STROKE_W)}
        rx={borderRadius}
        ry={borderRadius}
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeDasharray={DASH}
      />
    </Svg>
  );
}

function DashedCard({ children }: { children: ReactNode }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View
      style={styles.dashedCard}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ w: Math.ceil(width), h: Math.ceil(height) });
      }}>
      <DashedFrame width={size.w} height={size.h} borderRadius={CARD_R} />
      <View style={styles.dashedCardInner}>{children}</View>
    </View>
  );
}

function StatusBadge({ status }: { status: DisputeStatus }) {
  if (status === 'under_review') {
    return (
      <View style={badge.underReview}>
        <Text style={badge.textLight}>UNDER REVIEW</Text>
      </View>
    );
  }
  if (status === 'open') {
    return (
      <View style={badge.open}>
        <Text style={badge.textLight}>OPEN</Text>
      </View>
    );
  }
  return (
    <View style={badge.resolved}>
      <Text style={badge.textResolved}>RESOLVED</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  underReview: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(60,60,67,0.55)',
  },
  open: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#1a1a1a',
  },
  resolved: {
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8e4df',
  },
  textLight: {
    fontSize: 9,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: 0.225,
    textTransform: 'uppercase',
    lineHeight: 13.5,
  },
  textResolved: {
    fontSize: 9,
    fontWeight: '500',
    color: MUTED,
    letterSpacing: 0.225,
    textTransform: 'uppercase',
    lineHeight: 13.5,
  },
});

export default function DisputesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>('open');

  const rows = useMemo(() => {
    if (filter === 'all') return DISPUTES_LIST;
    return DISPUTES_LIST.filter((d) => d.status === filter);
  }, [filter]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <FontAwesome name="chevron-left" size={20} color="#1a1a1a" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Disputes</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.intro}>
          Raise an issue about a deal, commission, or conduct. OMM support reviews within 2 business days. Try to resolve directly first.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterScrollHost}>
          {FILTERS.map((f, i) => {
            const on = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  i < FILTERS.length - 1 ? styles.filterChipSpacing : null,
                  on ? styles.filterChipOn : styles.filterChipOff,
                  pressed && { opacity: 0.88 },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}>
                <Text
                  style={[styles.filterChipText, on && styles.filterChipTextOn, f.key !== 'all' && styles.filterUpper]}
                  numberOfLines={1}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.list}>
          {rows.map((d) => (
            <Pressable
              key={d.id}
              onPress={() =>
                router.push({
                  pathname: '/dispute-detail',
                  params: { id: d.id },
                } as Href)
              }
              accessibilityRole="button"
              accessibilityLabel={`Dispute ${d.id}`}>
              {({ pressed }) => (
                <DashedCard>
                  <View style={[styles.cardPress, pressed && { opacity: 0.92 }]}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardId}>{d.id}</Text>
                      <StatusBadge status={d.status} />
                    </View>
                    <Text style={styles.cardTitle}>{d.title}</Text>
                    <Text style={styles.cardMeta}>{d.timeLabel}</Text>
                  </View>
                </DashedCard>
              )}
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
          onPress={() => router.push('/raise-dispute' as Href)}
          accessibilityRole="button"
          accessibilityLabel="Raise a dispute">
          <Text style={styles.ctaText}>RAISE A DISPUTE</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  navSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 27,
  },
  scroll: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
  },
  intro: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
    marginBottom: AFTER_INTRO,
  },
  filterScrollHost: {
    marginBottom: AFTER_FILTERS,
    marginHorizontal: -4,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  filterChip: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minHeight: 31,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipSpacing: {
    marginRight: 8,
  },
  filterChipOn: {
    backgroundColor: '#1c1c1e',
  },
  filterChipOff: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.14)',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#2e2e2e',
  },
  filterChipTextOn: {
    color: '#fff',
    textTransform: 'uppercase',
  },
  filterUpper: {
    textTransform: 'uppercase',
  },
  list: {
    gap: LIST_GAP,
    marginBottom: BLOCK_GAP,
  },
  dashedCard: {
    position: 'relative',
    backgroundColor: '#fff',
  },
  dashedCardInner: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 0,
  },
  cardPress: {
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 16,
    gap: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  cardId: {
    fontSize: 10,
    fontWeight: '500',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1a1a1a',
    lineHeight: 21,
  },
  cardMeta: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 15,
  },
  cta: {
    height: 48,
    borderRadius: 4,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.35,
    textTransform: 'uppercase',
  },
});
