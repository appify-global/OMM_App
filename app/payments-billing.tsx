import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/theme';
import { INVOICES, invoicesThisMonth } from '@/lib/invoices-mock';

/**
 * Payments & Billing hub — Figma 1053:3574.
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3574&t=2eZigRM0BwNtC5wd-4
 * Demo values match product design; replace with API data when wired.
 */

const BLOCK_GAP = 24;
const ROW_GAP = 10;
const CARD_R = 14;
const ROW_BOX_R = 8;
const BALANCE_CARD = '#000000';
const MUTED = '#999999';
const MUTED_ROW = 'rgba(0, 0, 0, 0.55)';
const STROKE = 'rgba(0, 0, 0, 0.45)';
const STROKE_W = 1.5;
const DEMO = {
  balance: '$4,230.00',
  nextPayout: 'Fri 24 Apr',
  bankMask: '•••• 4729',
  payoutSchedule: 'Weekly • Fri',
  cardMask: 'Visa •••• 1234',
  gstStatus: 'Configured',
} as const;

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

function DashedListRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
      <View
        style={styles.dashWrap}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setSize({ w: Math.ceil(width), h: Math.ceil(height) });
        }}>
        <DashedFrame width={size.w} height={size.h} borderRadius={ROW_BOX_R} />
        <View style={styles.dashInner}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <View style={styles.rowRight}>
              {value != null && value !== '' ? <Text style={styles.rowValue}>{value}</Text> : null}
              <FontAwesome name="chevron-right" size={14} color="rgba(0, 0, 0, 0.35)" />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionKicker}>{title}</Text>
      <View style={styles.sectionRows}>{children}</View>
    </View>
  );
}

export default function PaymentsBillingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const invoicesThisMonthCount = invoicesThisMonth(INVOICES).length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Payments & Billing</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceKicker}>CURRENT BALANCE</Text>
          <Text style={styles.balanceAmount}>{DEMO.balance}</Text>
          <Text style={styles.balanceMeta}>
            Next payout <Text style={styles.balanceMetaDim}>• {DEMO.nextPayout}</Text>
          </Text>
        </View>

        <View style={{ height: BLOCK_GAP }} />

        <SectionBlock title="PAYOUTS">
          <DashedListRow label="Bank account" value={DEMO.bankMask} onPress={() => router.push('/account-details' as Href)} />
          <DashedListRow label="Payout schedule" value={DEMO.payoutSchedule} onPress={() => router.push('/payout-schedule' as Href)} />
          <DashedListRow label="Payout history" onPress={() => router.push('/payout-history' as Href)} />
        </SectionBlock>

        <SectionBlock title="BILLING">
          <DashedListRow
            label="Invoices"
            value={invoicesThisMonthCount > 0 ? `${invoicesThisMonthCount} this month` : ''}
            onPress={() => router.push('/invoices' as Href)}
          />
          <DashedListRow label="Payment method" value={DEMO.cardMask} onPress={() => router.push('/payment-method' as Href)} />
          <DashedListRow label="GST / ABN" value={DEMO.gstStatus} onPress={() => router.push('/gst-abn' as Href)} />
        </SectionBlock>
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
    color: '#000',
    lineHeight: 27,
    textAlign: 'center',
  },
  scroll: { paddingHorizontal: layout.screenGutter, paddingTop: 8 },
  balanceCard: {
    backgroundColor: BALANCE_CARD,
    borderRadius: CARD_R,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
  },
  balanceKicker: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 34,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: -0.5,
    lineHeight: 40,
    marginBottom: 14,
  },
  balanceMeta: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 21,
  },
  balanceMetaDim: {
    color: 'rgba(255,255,255,0.72)',
  },
  section: {
    marginBottom: BLOCK_GAP,
  },
  sectionKicker: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
    marginBottom: 10,
  },
  sectionRows: {
    gap: ROW_GAP,
  },
  dashWrap: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: ROW_BOX_R,
    overflow: 'hidden',
  },
  dashInner: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 54,
    paddingVertical: 14,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
    lineHeight: 22,
    paddingRight: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED_ROW,
    lineHeight: 21,
  },
});
