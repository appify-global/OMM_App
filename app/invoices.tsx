import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Text } from '@/components/OMMText';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, borderHairline, ink, inkSubtle, layout, slateNavy } from '@/constants/theme';
import {
  type InvoiceFilterKey,
  type InvoiceRow,
  INVOICES,
  filterInvoices,
  invoicesThisMonth,
  thisMonthSummary,
} from '@/lib/invoices-mock';

/**
 * Invoices — Figma 1053:3419.
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3419
 * List and summary read from `INVOICES` in `lib/invoices-mock` (swap for API). No TextInput fields.
 */

const AFTER_SUMMARY = 16;
const AFTER_CHIPS = 20;
const ROW_GAP = 12;
const CARD_R = 8;
const SUMMARY_MIN_H = 152;
const ROW_CARD_MIN_H = 168;
const STROKE = 'rgba(0, 0, 0, 0.55)';
const STROKE_W = 1.5;
const MUTED = 'rgba(0, 0, 0, 0.55)';
const EXPORT_BG = slateNavy;

const FILTERS: { key: InvoiceFilterKey; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'paid', label: 'PAID' },
  { key: 'outstanding', label: 'OUTSTANDING' },
  { key: 'refunded', label: 'REFUNDED' },
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
  elevated,
}: {
  minHeight: number;
  children: ReactNode;
  innerStyle?: object;
  elevated?: boolean;
}) {
  const [size, setSize] = useState({ w: 0, h: minHeight });
  return (
    <View
      style={[
        styles.dashShell,
        { minHeight, overflow: elevated ? 'visible' : 'hidden' },
        elevated && styles.dashShellElevated,
      ]}>
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

function StatusBadge({ status }: { status: InvoiceRow['status'] }) {
  if (status === 'outstanding') {
    return (
      <View style={styles.badgeOutstanding}>
        <Text style={styles.badgeOutstandingText}>OUTSTANDING</Text>
      </View>
    );
  }
  if (status === 'refunded') {
    return (
      <View style={styles.badgeOutstanding}>
        <Text style={styles.badgeOutstandingText}>REFUNDED</Text>
      </View>
    );
  }
  return (
    <View style={styles.badgeSent}>
      <Text style={styles.badgeSentText}>SENT</Text>
    </View>
  );
}

function InvoiceCard({ row, index }: { row: InvoiceRow; index: number }) {
  const router = useRouter();
  const detailLeft = `${row.dealRef} • ${row.addressLine}`;
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/invoice-detail',
          params: { i: String(index) },
        } as Href)
      }
      accessibilityRole="button"
      accessibilityLabel={`Invoice ${row.id}`}
      style={({ pressed }) => [pressed && { opacity: 0.94 }]}>
      <DashedBox minHeight={ROW_CARD_MIN_H} innerStyle={styles.invoiceInner}>
        <View style={styles.invoiceTop}>
          <Text style={styles.invoiceId}>{row.id}</Text>
          <StatusBadge status={row.status} />
        </View>
        <Text style={styles.invoiceAmount}>{row.amountFormatted}</Text>
        <View style={styles.invoiceBottom}>
          <Text style={styles.invoiceMeta} numberOfLines={1}>
            {detailLeft}
          </Text>
          <Text style={styles.invoiceDate}>{row.dateLine}</Text>
        </View>
      </DashedBox>
    </Pressable>
  );
}

export default function InvoicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<InvoiceFilterKey>('paid');

  const monthSlice = useMemo(() => invoicesThisMonth(INVOICES), []);
  const summary = useMemo(() => thisMonthSummary(monthSlice), [monthSlice]);
  const filtered = useMemo(() => filterInvoices(INVOICES, filter), [filter]);

  const onExport = () => {
    if (INVOICES.length === 0) {
      Alert.alert('Export', 'No invoice data to export yet.');
      return;
    }
    Alert.alert('Export', 'CSV export will be available when billing is connected.');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Invoices</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <DashedBox minHeight={SUMMARY_MIN_H} elevated innerStyle={styles.summaryInner}>
          <View style={styles.summaryHeaderRow}>
            <Text style={styles.summaryKicker}>THIS MONTH</Text>
            <Pressable
              onPress={onExport}
              style={({ pressed }) => [styles.exportBtn, pressed && { opacity: 0.9 }]}
              accessibilityRole="button"
              accessibilityLabel="Export CSV">
              <Text style={styles.exportBtnText}>EXPORT CSV</Text>
            </Pressable>
          </View>
          <Text style={styles.summaryAmount}>{summary.totalFormatted}</Text>
          <Text style={styles.summaryMeta}>{summary.countLabel}</Text>
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

        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No invoices for this filter.</Text>
          </View>
        ) : (
          <View style={styles.listCol}>
            {filtered.map((row, idx) => (
              <View key={`${row.id}-${row.status}-${idx}`} style={idx < filtered.length - 1 ? styles.rowGap : undefined}>
                <InvoiceCard row={row} index={INVOICES.indexOf(row)} />
              </View>
            ))}
          </View>
        )}
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
  },
  dashShellElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  dashInner: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  summaryInner: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryKicker: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  exportBtn: {
    backgroundColor: EXPORT_BG,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 32,
  },
  exportBtnText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.24,
  },
  summaryAmount: {
    fontSize: 32,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
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
  /** Idle: gray labels; selected: accent pill (same pattern as Payout history). */
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
  invoiceInner: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    justifyContent: 'flex-start',
  },
  invoiceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    minHeight: 28,
  },
  invoiceId: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(26,26,26,0.75)',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  badgeSent: {
    backgroundColor: slateNavy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 11,
  },
  badgeSentText: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },
  badgeOutstanding: {
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
  },
  badgeOutstandingText: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(26,26,26,0.75)',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },
  invoiceAmount: {
    fontSize: 32,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: -0.4,
    lineHeight: 38,
    marginBottom: 10,
  },
  invoiceBottom: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  invoiceMeta: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(26,26,26,0.75)',
    lineHeight: 21,
  },
  invoiceDate: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(26,26,26,0.75)',
    lineHeight: 21,
    textAlign: 'right',
  },
  listCol: {},
  rowGap: { marginBottom: ROW_GAP },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
    textAlign: 'center',
  },
});
