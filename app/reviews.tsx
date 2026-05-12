import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/theme';
import { DEMO_AGENT_AGENCY, DEMO_PRIMARY_STREET } from '@/lib/melbourne-demo-locations';

/**
 * My reviews — summary, pending carousel, filters, list, CTA.
 * [Figma 1053:2426](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-2426&t=2eZigRM0BwNtC5wd-4)
 */

/** Vertical gap between major blocks — aligns with design rhythm */
const SECTION_GAP = 24;
/** Review list: gap between dashed cards (Figma gap-[16px]) */
const LIST_CARD_GAP = 16;
const STROKE = 'rgba(0, 0, 0, 0.55)';
const STROKE_W = 1.5;
const STAR_FILLED = '#6b5344';
const STAR_EMPTY = 'rgba(0, 0, 0, 0.22)';
const MUTED = 'rgba(0, 0, 0, 0.55)';
const CARD_R = 8;
const SUMMARY_H = 108;
const PENDING_CARD_W = 180;
const PENDING_CARD_H = 135;
const PENDING_CHIP_R = 4;

type FilterKey = 'all' | 'buyer' | 'seller';

const PENDING = [
  {
    id: '1',
    name: 'Sarah Chen',
    agency: DEMO_AGENT_AGENCY,
    address: DEMO_PRIMARY_STREET,
    badge: 'WRITING' as string | null,
    active: true,
  },
  {
    id: '2',
    name: 'Tom Reid',
    agency: 'Marshall White',
    address: '19 Dickens St, Elwood VIC 3184',
    badge: null,
    active: false,
  },
  {
    id: '3',
    name: 'Priya N.',
    agency: 'Jellis Craig',
    address: '8 Davis St, Malvern',
    badge: null,
    active: false,
  },
] as const;

const REVIEW_ROWS = [
  {
    id: 'r1',
    headline: 'Sarah Chen · Biggin Scott',
    when: '2w ago',
    meta: 'OMM-20418 · 218 Victoria St',
    rating: 5 as const,
    body: 'Smooth SOI handover and commission sign-off in under 2h hours. Would deal with again.',
    filter: 'seller' as FilterKey,
  },
  {
    id: 'r2',
    headline: 'Mike Alvarez · Barry Plant',
    when: '1mo ago',
    meta: 'OMM-20381 · 12 Park Ave',
    rating: 4 as const,
    body: 'Responsive, clear authority dates. A small delay on bank details but resolved.',
    filter: 'buyer' as FilterKey,
  },
  {
    id: 'r3',
    headline: 'Priya N · Buxton',
    when: '2mo ago',
    meta: 'OMM-20350 · 8 Oak Close',
    rating: 5 as const,
    body: 'Great coordination on inspection. Media uploads were on time.',
    filter: 'buyer' as FilterKey,
  },
] as const;

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
      />
    </Svg>
  );
}

function DashedSurface({
  borderRadius,
  children,
  style,
}: {
  borderRadius: number;
  children: ReactNode;
  style?: object;
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View
      style={[{ position: 'relative', backgroundColor: '#fff' }, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ w: Math.ceil(width), h: Math.ceil(height) });
      }}>
      <DashedFrame width={size.w} height={size.h} borderRadius={borderRadius} />
      {children}
    </View>
  );
}

function StarRow({
  rating,
  size = 12,
  gap = 4,
  filledColor = STAR_FILLED,
}: {
  rating: number;
  size?: number;
  gap?: number;
  filledColor?: string;
}) {
  return (
    <View style={[styles.starRow, { gap }]}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesome
          key={i}
          name={i <= rating ? 'star' : 'star-o'}
          size={size}
          color={i <= rating ? filledColor : STAR_EMPTY}
        />
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = REVIEW_ROWS.filter((r) => filter === 'all' || r.filter === filter);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable
          style={styles.navSide}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Reviews</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <DashedSurface borderRadius={CARD_R} style={styles.summaryShell}>
          <View style={styles.summaryInner}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryScore}>4.8</Text>
              <StarRow rating={5} size={14} gap={4} />
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.summaryMetaFirst}>Based on 24 reviews</Text>
              <Text style={styles.summaryMetaSmall}>Last 12 months</Text>
              <Text style={styles.summaryMetaSmall}>Verified by closed deals</Text>
            </View>
          </View>
        </DashedSurface>

        <View style={{ height: SECTION_GAP }} />

        <View style={styles.pendingBlock}>
          <View style={styles.pendingHeader}>
            <Text style={styles.pendingKickerLeft}>Pending Reviews</Text>
            <Text style={styles.pendingCount}>3 pending</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pendingCarousel}
            decelerationRate="fast"
            snapToInterval={PENDING_CARD_W + 12}
            snapToAlignment="start">
            {PENDING.map((p, index) => (
              <PendingCard key={p.id} item={p} isLast={index === PENDING.length - 1} />
            ))}
          </ScrollView>
        </View>

        <View style={{ height: SECTION_GAP }} />

        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setFilter('all')}
            style={({ pressed }) => [
              styles.filterSeg,
              filter === 'all' ? styles.filterSegActive : styles.filterSegIdle,
              pressed && { opacity: 0.88 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === 'all' }}>
            <Text style={[styles.filterAllLabel, filter === 'all' && styles.filterAllLabelOn]}>All</Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter('buyer')}
            style={({ pressed }) => [
              styles.filterSegWide,
              filter === 'buyer' ? styles.filterSegActiveWide : styles.filterSegIdle,
              pressed && { opacity: 0.88 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === 'buyer' }}>
            <Text style={[styles.filterCapsLabel, filter === 'buyer' && styles.filterCapsLabelOn]} numberOfLines={1}>
              AS BUYER AGENT
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter('seller')}
            style={({ pressed }) => [
              styles.filterSegWide,
              filter === 'seller' ? styles.filterSegActiveWide : styles.filterSegIdle,
              pressed && { opacity: 0.88 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === 'seller' }}>
            <Text style={[styles.filterCapsLabel, filter === 'seller' && styles.filterCapsLabelOn]} numberOfLines={1}>
              AS SELLER AGENT
            </Text>
          </Pressable>
        </View>

        <View style={{ height: SECTION_GAP }} />

        <View style={styles.reviewList}>
          {filtered.map((r) => (
            <DashedSurface key={r.id} borderRadius={CARD_R}>
              <View style={styles.reviewCardInner}>
                <View style={styles.reviewHeaderRow}>
                  <View style={styles.reviewHeaderLeft}>
                    <Text style={styles.reviewHeadline} numberOfLines={1}>
                      {r.headline}
                    </Text>
                    <Text style={styles.reviewMetaFigma}>{r.meta}</Text>
                  </View>
                  <Text style={styles.reviewWhen}>{r.when}</Text>
                </View>
                <StarRow rating={r.rating} size={12} gap={4} />
                <Text style={styles.reviewBody}>{r.body}</Text>
              </View>
            </DashedSurface>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}
          onPress={() => router.push('/write-review')}
          accessibilityRole="button"
          accessibilityLabel="Write a review">
          <Text style={styles.ctaText}>WRITE A REVIEW</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function PendingCard({
  item,
  isLast,
}: {
  item: (typeof PENDING)[number];
  isLast: boolean;
}) {
  const content = (
    <>
      <View style={styles.pendingTop}>
        <Text style={[styles.pendingName, item.active && styles.pendingNameActive]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.badge ? (
          <View style={[styles.writingChip, item.active && styles.writingChipOnDark]}>
            <Text style={styles.writingChipText}>{item.badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.pendingAgency, item.active && styles.pendingLineLight]} numberOfLines={1}>
        {item.agency}
      </Text>
      <Text style={[styles.pendingAddr, item.active && styles.pendingLineLight]} numberOfLines={2}>
        {item.address}
      </Text>
      <View style={{ flex: 1, minHeight: 4 }} />
      {item.active ? (
        <View style={styles.pendingStatusDark}>
          <Text style={styles.pendingStatusDarkText}>PENDING</Text>
        </View>
      ) : (
        <View style={styles.pendingStatusLight}>
          <Text style={styles.pendingStatusLightText}>PENDING</Text>
        </View>
      )}
    </>
  );

  const tail = !isLast ? styles.pendingGutter : null;

  if (item.active) {
    return (
      <View style={[styles.pendingCardActive, { width: PENDING_CARD_W, minHeight: PENDING_CARD_H }, tail]}>
        {content}
      </View>
    );
  }

  return (
    <DashedSurface
      borderRadius={CARD_R}
      style={[{ width: PENDING_CARD_W, minHeight: PENDING_CARD_H }, tail]}>
      <View style={styles.pendingCardInner}>{content}</View>
    </DashedSurface>
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
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 27,
  },
  scroll: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
  },
  summaryShell: {
    alignSelf: 'stretch',
    minHeight: SUMMARY_H,
  },
  summaryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: SUMMARY_H,
    paddingLeft: 18,
    paddingRight: 18,
    paddingVertical: 14,
    gap: 16,
  },
  summaryLeft: {
    alignItems: 'flex-start',
    gap: 8,
  },
  summaryScore: {
    fontSize: 48,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 48,
    marginTop: 2,
  },
  starRow: { flexDirection: 'row', alignItems: 'center' },
  summaryRight: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    paddingTop: 2,
  },
  summaryMetaFirst: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
  },
  summaryMetaSmall: {
    fontSize: 11,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16.5,
  },
  pendingBlock: {
    gap: 12,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingKickerLeft: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  pendingCount: {
    fontSize: 11,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16.5,
  },
  pendingCarousel: {
    flexDirection: 'row',
    paddingBottom: 4,
    paddingRight: layout.screenGutter,
  },
  pendingGutter: {
    marginRight: 12,
  },
  pendingCardInner: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 14,
    flex: 1,
    minHeight: PENDING_CARD_H,
  },
  pendingCardActive: {
    borderRadius: CARD_R,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  pendingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  pendingName: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 19.5,
    minWidth: 0,
  },
  pendingNameActive: {
    color: '#fff',
  },
  writingChip: {
    flexShrink: 0,
    backgroundColor: '#f2f2f2',
    borderRadius: PENDING_CHIP_R,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 22,
    justifyContent: 'center',
  },
  writingChipOnDark: {
    backgroundColor: '#fff',
  },
  writingChipText: {
    fontSize: 9,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: 0.225,
    textTransform: 'uppercase',
    lineHeight: 13.5,
  },
  pendingAgency: {
    fontSize: 11,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16.5,
    marginBottom: 4,
  },
  pendingAddr: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 15,
  },
  pendingLineLight: {
    color: '#fff',
  },
  pendingStatusDark: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: PENDING_CHIP_R,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 22,
    justifyContent: 'center',
  },
  pendingStatusDarkText: {
    fontSize: 9,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.225,
    textTransform: 'uppercase',
    lineHeight: 13.5,
  },
  pendingStatusLight: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: PENDING_CHIP_R,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 22,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  pendingStatusLightText: {
    fontSize: 9,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: 0.225,
    textTransform: 'uppercase',
    lineHeight: 13.5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  filterSeg: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minHeight: 31,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSegWide: {
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 7,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
  },
  filterSegActive: {
    backgroundColor: '#000000',
  },
  filterSegActiveWide: {
    backgroundColor: '#000000',
  },
  filterSegIdle: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.14)',
  },
  filterAllLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#2e2e2e',
  },
  filterAllLabelOn: {
    color: '#fff',
  },
  filterCapsLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#2e2e2e',
    letterSpacing: 0.2,
  },
  filterCapsLabelOn: {
    color: '#fff',
    fontSize: 11,
  },
  reviewList: {
    gap: LIST_CARD_GAP,
  },
  reviewCardInner: {
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 16,
    gap: 8,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewHeaderLeft: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  reviewHeadline: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 19.5,
  },
  reviewMetaFigma: {
    fontSize: 11,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16.5,
  },
  reviewWhen: {
    fontSize: 11,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 16.5,
    flexShrink: 0,
    marginTop: 2,
  },
  reviewBody: {
    fontSize: 13,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 19.5,
  },
  cta: {
    height: 48,
    borderRadius: 4,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SECTION_GAP,
  },
  ctaText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: -0.35,
    textTransform: 'uppercase',
  },
});
