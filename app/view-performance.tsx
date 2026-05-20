import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Text } from '@/components/OMMText';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, ink, layout } from '@/constants/theme';
import {
  computeListingPerformance,
  computeListingPerformanceMetrics,
  formatPerformanceMetric,
} from '@/lib/agent-published-listings';
import { useAgentPublishedListings } from '@/lib/agent-published-listings-context';
import { DEMO_PRIMARY_LISTING_TITLE } from '@/lib/melbourne-demo-locations';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

/**
 * Listing performance — stats + views chart.
 * Live metrics are derived from on-device analytics when opened with `listingId` (buyer views / saves / enquiries).
 * [Figma 1053:9213](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-9213&t=2eZigRM0BwNtC5wd-4)
 */

const CARD_RADIUS = 10;
const TREND = '#C07A50';
const BAR_GREY = 'rgba(0, 0, 0, 0.38)';

const CARD_OUTLINE = {
  borderWidth: FIELD_OUTLINE_WIDTH,
  borderColor: FIELD_OUTLINE_COLOR,
  backgroundColor: '#fff',
};

/** Demo bars when no listing is selected (same shape as 30-day series). */
const DEMO_BAR_FRACS = Array.from({ length: 30 }, (_, i) => 0.2 + (i / 29) * 0.8);

const DEMO_STATS = {
  views: '2,847',
  saves: '186',
  enquiries: '23',
  viewsTrend: '+12%',
  savesTrend: '+8%',
  enquiriesTrend: '+15%',
};

function firstQueryParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function formatYAxisTick(max: number, frac: number): string {
  const v = max * frac;
  if (v >= 1000) return `${Math.round(v / 1000)}k`;
  return String(Math.round(v));
}

function TrendGlyph({ trend }: { trend: string }) {
  if (trend === '—') return null;
  if (trend.startsWith('+'))
    return <MaterialCommunityIcons name="trending-up" size={14} color={TREND} />;
  if (trend.startsWith('-'))
    return <MaterialCommunityIcons name="trending-down" size={14} color={TREND} />;
  return null;
}

function StatCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <View style={[styles.statCard, CARD_OUTLINE]}>
      <View style={styles.statTop}>
        {icon}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statTrendRow}>
        <TrendGlyph trend={trend} />
        <Text style={styles.statTrend}>{trend}</Text>
      </View>
    </View>
  );
}

export default function ViewPerformanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { listingId: listingIdParam } = useLocalSearchParams<{ listingId?: string }>();
  const listingId = firstQueryParam(listingIdParam)?.trim();
  const { getById, ready } = useAgentPublishedListings();
  const chartH = 168;

  const perf = useMemo(() => {
    if (!listingId) return null;
    if (!ready) return undefined;
    const listing = getById(listingId);
    if (listing) return computeListingPerformance(listing);
    return computeListingPerformanceMetrics(undefined, 'Listing unavailable');
  }, [listingId, getById, ready]);

  const demoMode = listingId == null;
  const loadingListing = listingId != null && perf === undefined;

  const subtitle = demoMode
    ? `${DEMO_PRIMARY_LISTING_TITLE} • Last 30 days`
    : loadingListing
      ? 'Loading listing analytics…'
      : perf != null
        ? `${perf.titleLine} • Last 30 days`
        : 'Listing';

  const chartFracs = demoMode ? DEMO_BAR_FRACS : perf?.chartBarFracs ?? DEMO_BAR_FRACS;
  const chartMax = demoMode ? 2000 : perf?.chartMax ?? 1;

  const viewsVal =
    demoMode ? DEMO_STATS.views : loadingListing ? '…' : perf ? formatPerformanceMetric(perf.views30) : '0';
  const savesVal =
    demoMode ? DEMO_STATS.saves : loadingListing ? '…' : perf ? formatPerformanceMetric(perf.saves30) : '0';
  const enquiriesVal =
    demoMode
      ? DEMO_STATS.enquiries
      : loadingListing
        ? '…'
        : perf
          ? formatPerformanceMetric(perf.enquiries30)
          : '0';

  const viewsTrend = demoMode ? DEMO_STATS.viewsTrend : perf?.viewsTrend ?? '—';
  const savesTrend = demoMode ? DEMO_STATS.savesTrend : perf?.savesTrend ?? '—';
  const enquiriesTrend = demoMode ? DEMO_STATS.enquiriesTrend : perf?.enquiriesTrend ?? '—';

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.title}>Performance</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.statsRow}>
          <StatCard
            icon={<MaterialCommunityIcons name="eye-outline" size={16} color="rgba(0, 0, 0, 0.5)" />}
            label="Views"
            value={viewsVal}
            trend={viewsTrend}
          />
          <StatCard
            icon={<MaterialCommunityIcons name="heart-outline" size={16} color="rgba(0, 0, 0, 0.5)" />}
            label="Saves"
            value={savesVal}
            trend={savesTrend}
          />
          <StatCard
            icon={
              <MaterialCommunityIcons name="comment-text-outline" size={16} color="rgba(0, 0, 0, 0.5)" />
            }
            label="Enquiries"
            value={enquiriesVal}
            trend={enquiriesTrend}
          />
        </View>

        <View style={[styles.chartWrap, CARD_OUTLINE]}>
          <Text style={styles.chartKicker}>VIEWS OVER TIME • LAST 30 DAYS</Text>
          <View style={styles.chartBody}>
            <View style={styles.yAxis}>
              <Text style={styles.yTick}>{formatYAxisTick(chartMax, 1)}</Text>
              <Text style={styles.yTick}>{formatYAxisTick(chartMax, 0.5)}</Text>
              <Text style={styles.yTick}>0</Text>
            </View>
            <View style={styles.chartPlot}>
              <View style={[styles.barsRow, { height: chartH }]}>
                {chartFracs.map((frac, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bar,
                      {
                        height: Math.max(6, frac * chartH),
                        backgroundColor: i === chartFracs.length - 1 ? '#000000' : BAR_GREY,
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.xAxis}>
                <Text style={styles.xTick}>1</Text>
                <Text style={styles.xTick}>15</Text>
                <Text style={styles.xTick}>30</Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.exportBtn}
          onPress={() => router.back()}
          accessibilityRole="button">
          <Text style={styles.exportBtnText}>EXPORT REPORT</Text>
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
    marginBottom: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.5)',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  statTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statTrend: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: TREND,
  },
  chartWrap: {
    borderRadius: CARD_RADIUS,
    padding: 16,
    marginBottom: 28,
  },
  chartKicker: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.48)',
    letterSpacing: 0.55,
    marginBottom: 16,
  },
  chartBody: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  yAxis: {
    width: 32,
    justifyContent: 'space-between',
    paddingRight: 6,
    paddingBottom: 22,
  },
  yTick: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    textAlign: 'right',
  },
  chartPlot: {
    flex: 1,
    minWidth: 0,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    flex: 1,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    minWidth: 2,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 0,
  },
  xTick: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
  },
  exportBtn: {
    backgroundColor: accent,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtnText: {
    color: ink,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.45,
  },
  cancelWrap: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  cancel: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)' },
});
