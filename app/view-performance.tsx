import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Text } from '@/components/OMMText';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, ink, layout } from '@/constants/theme';
import { DEMO_PRIMARY_LISTING_TITLE } from '@/lib/melbourne-demo-locations';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

/**
 * Listing performance — stats + views chart.
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

/** Normalized bar heights, left → right (last bar = current period). */
const BAR_FRACS = [
  0.22, 0.26, 0.3, 0.34, 0.38, 0.42, 0.48, 0.52, 0.56, 0.62, 0.68, 0.74, 0.8, 0.85, 0.9, 0.94, 1,
];

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
        <MaterialCommunityIcons name="trending-up" size={14} color={TREND} />
        <Text style={styles.statTrend}>{trend}</Text>
      </View>
    </View>
  );
}

export default function ViewPerformanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const chartH = 168;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.title}>Performance</Text>
        <Text style={styles.subtitle}>{DEMO_PRIMARY_LISTING_TITLE} • Last 30 days</Text>

        <View style={styles.statsRow}>
          <StatCard
            icon={<MaterialCommunityIcons name="eye-outline" size={16} color="rgba(0, 0, 0, 0.5)" />}
            label="Views"
            value="2,847"
            trend="+12%"
          />
          <StatCard
            icon={<MaterialCommunityIcons name="heart-outline" size={16} color="rgba(0, 0, 0, 0.5)" />}
            label="Saves"
            value="186"
            trend="+8%"
          />
          <StatCard
            icon={
              <MaterialCommunityIcons name="comment-text-outline" size={16} color="rgba(0, 0, 0, 0.5)" />
            }
            label="Enquiries"
            value="23"
            trend="+15%"
          />
        </View>

        <View style={[styles.chartWrap, CARD_OUTLINE]}>
          <Text style={styles.chartKicker}>VIEWS OVER TIME • LAST 30 DAYS</Text>
          <View style={styles.chartBody}>
            <View style={styles.yAxis}>
              <Text style={styles.yTick}>2k</Text>
              <Text style={styles.yTick}>1k</Text>
              <Text style={styles.yTick}>0</Text>
            </View>
            <View style={styles.chartPlot}>
              <View style={[styles.barsRow, { height: chartH }]}>
                {BAR_FRACS.map((frac, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bar,
                      {
                        height: Math.max(6, frac * chartH),
                        backgroundColor: i === BAR_FRACS.length - 1 ? '#000000' : BAR_GREY,
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.xAxis}>
                <Text style={styles.xTick}>1</Text>
                <Text style={styles.xTick}>9</Text>
                <Text style={styles.xTick}>17</Text>
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
    gap: 3,
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
