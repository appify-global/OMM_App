import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, borderHairline, ink, inkSubtle, layout, slateNavy } from '@/constants/theme';
/**
 * Payout history — Figma 1053:3498.
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3498&t=2eZigRM0BwNtC5wd-4
 * List/summary are mock data (replace with API). No editable fields on this screen.
 */

const BLOCK_GAP = 24;
const AFTER_SUMMARY = 16;
const AFTER_CHIPS = 20;
const LABEL_GAP = 8;
const ROW_GAP = 10;
const CARD_R = 8;
const STROKE = 'rgba(0, 0, 0, 0.45)';
const STROKE_W = 1.5;
const MUTED = 'rgba(0, 0, 0, 0.55)';

type FilterKey = 'all' | 'month' | 'months3' | 'year';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'month', label: 'THIS MONTH' },
  { key: 'months3', label: '3 MONTHS' },
  { key: 'year', label: 'YEAR' },
];

/** Demo aggregates per filter range (swap for live totals from API). */
const SUMMARY_BY_FILTER: Record<
  FilterKey,
  { total: string; meta: string }
> = {
  all: { total: '$32,450.00', meta: '12 payouts • last 90 days' },
  month: { total: '$6,350.00', meta: '2 payouts • this month' },
  months3: { total: '$24,180.00', meta: '8 payouts • last 3 months' },
  year: { total: '$32,450.00', meta: '12 payouts • this year' },
};

type PayoutRow = {
  dateLine: string;
  amount: string;
  deals: string;
  status: 'SENT';
};

type MonthBlock = {
  heading: string;
  items: PayoutRow[];
};

const MOCK_GROUPS: MonthBlock[] = [
  {
    heading: 'APRIL 2026',
    items: [
      { dateLine: '11 Apr', amount: '$4,230.00', deals: '3 deals', status: 'SENT' },
      { dateLine: '8 Apr', amount: '$2,120.00', deals: '2 deals', status: 'SENT' },
    ],
  },
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
      />
    </Svg>
  );
}

function DashedBox({
  minHeight,
  children,
  innerStyle,
}: {
  minHeight: number;
  children: ReactNode;
  innerStyle?: object;
}) {
  const [size, setSize] = useState({ w: 0, h: minHeight });
  return (
    <View style={[styles.dashShell, { minHeight }]}>
      <DashedFrame width={size.w} height={size.h} borderRadius={CARD_R} />
      <View
        style={[styles.dashInner, { minHeight }, innerStyle]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setSize({ w: Math.ceil(width), h: Math.ceil(height) });
        }}>
        {children}
      </View>
    </View>
  );
}

function PayoutItemCard({ row }: { row: PayoutRow }) {
  return (
    <DashedBox minHeight={88} innerStyle={styles.itemInner}>
      <View style={styles.itemTop}>
        <Text style={styles.itemDate}>{row.dateLine}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{row.status}</Text>
        </View>
      </View>
      <View style={styles.itemBottom}>
        <Text style={styles.itemAmount}>{row.amount}</Text>
        <Text style={styles.itemDeals}>{row.deals}</Text>
      </View>
    </DashedBox>
  );
}

export default function PayoutHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>('all');

  const summary = SUMMARY_BY_FILTER[filter];
  const groups = MOCK_GROUPS;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Payout history</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <DashedBox minHeight={100} innerStyle={styles.summaryInner}>
          <Text style={styles.summaryKicker}>TOTAL PAID OUT</Text>
          <Text style={styles.summaryAmount}>{summary.total}</Text>
          <Text style={styles.summaryMeta}>{summary.meta}</Text>
        </DashedBox>

        <View style={{ height: AFTER_SUMMARY }} />

        <View style={styles.filterBar}>
          <View style={styles.chipStrip}>
            {FILTERS.map((f) => {
              const on = filter === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}>
                  {({ pressed }) => (
                    <Text
                      style={[
                        styles.chipLabel,
                        on ? styles.chipLabelOn : styles.chipLabelOff,
                        pressed && !on && { opacity: 0.7 },
                      ]}
                      numberOfLines={1}>
                      {f.label}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ height: AFTER_CHIPS }} />

        {groups.map((g) => (
          <View key={g.heading} style={styles.monthBlock}>
            <Text style={styles.monthHeading}>{g.heading}</Text>
            <View style={{ height: LABEL_GAP }} />
            <View style={styles.itemList}>
              {g.items.map((row, idx) => (
                <View key={`${row.dateLine}-${row.amount}-${idx}`} style={idx < g.items.length - 1 ? styles.itemGap : undefined}>
                  <PayoutItemCard row={row} />
                </View>
              ))}
            </View>
          </View>
        ))}
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
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 27,
  },
  scroll: { paddingHorizontal: layout.screenGutter, paddingTop: 8 },
  dashShell: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: CARD_R,
    overflow: 'hidden',
  },
  dashInner: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  summaryInner: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  summaryKicker: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
    marginBottom: 10,
  },
  summaryAmount: {
    fontSize: 32,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    letterSpacing: -0.4,
    lineHeight: 38,
    marginBottom: 8,
  },
  summaryMeta: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
  },
  filterBar: {
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderHairline,
  },
  chipStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    minHeight: 31,
  },
  chip: {
    flexShrink: 0,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minHeight: 31,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipOn: {
    backgroundColor: accent,
  },
  chipOff: {
    backgroundColor: 'transparent',
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.2,
  },
  chipLabelOn: {
    color: ink,
  },
  chipLabelOff: {
    color: inkSubtle,
  },
  monthBlock: {
    marginBottom: BLOCK_GAP,
  },
  monthHeading: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  itemList: {},
  itemGap: {
    marginBottom: ROW_GAP,
  },
  itemInner: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemDate: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
  },
  badge: {
    backgroundColor: slateNavy,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 7,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemAmount: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    lineHeight: 24,
  },
  itemDeals: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
  },
});
