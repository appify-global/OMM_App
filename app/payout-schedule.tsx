import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';

/**
 * Payout schedule — Figma 1053:3766.
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3766&t=2eZigRM0BwNtC5wd-4
 */

const H_PAD = 20;
const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
const AFTER_INTRO = 20;
const FIELD_MIN_H = 54;
const CARD_R = 8;
const ROW_GAP = 10;
const STROKE = 'rgba(0, 0, 0, 0.45)';
const STROKE_W = 1.5;
const DASH = '5 4';
const MUTED = 'rgba(0, 0, 0, 0.55)';

type Frequency = 'instant' | 'daily' | 'weekly' | 'monthly';
type Weekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';

const FREQUENCY_OPTIONS: { id: Frequency; title: string; sub: string }[] = [
  { id: 'instant', title: 'Instant', sub: '1% fee • arrives in minutes' },
  { id: 'daily', title: 'Daily', sub: 'Next business day' },
  { id: 'weekly', title: 'Weekly', sub: 'Every Friday' },
  { id: 'monthly', title: 'Monthly', sub: '1st of each month' },
];

const WEEKDAYS: Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

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

function RadioOuter({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radioOuter, selected && styles.radioOuterOn]}>
      {selected ? <View style={styles.radioInner} /> : null}
    </View>
  );
}

export default function PayoutScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hPad = useScreenHorizontalPadding();
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [payoutDay, setPayoutDay] = useState<Weekday | null>(null);
  const [minPayout, setMinPayout] = useState('');

  const onSave = () => {
    Alert.alert('Saved', 'Your payout schedule was updated.');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <View style={[styles.headBlock, hPad]}>
        <ScreenHeader title="Payout schedule" onBack={() => router.back()} />
      </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
          <Text style={styles.intro}>
            Choose how often OMM deposits your commission payouts. Changes apply to the next period.
          </Text>

          <View style={{ height: AFTER_INTRO }} />

          <Text style={styles.sectionLabel}>FREQUENCY</Text>
          <View style={{ height: LABEL_FIELD_GAP }} />
          <View style={styles.freqList}>
            {FREQUENCY_OPTIONS.map((opt) => {
              const selected = frequency === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setFrequency(opt.id);
                    if (opt.id !== 'weekly') setPayoutDay(null);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
                  <DashedBox minHeight={76} innerStyle={styles.freqCardInner}>
                    <View style={styles.freqRow}>
                      <RadioOuter selected={selected} />
                      <View style={styles.freqTextCol}>
                        <Text style={styles.freqTitle}>{opt.title}</Text>
                        <Text style={styles.freqSub}>{opt.sub}</Text>
                      </View>
                    </View>
                  </DashedBox>
                </Pressable>
              );
            })}
          </View>

          {frequency === 'weekly' ? (
            <>
              <View style={{ height: BLOCK_GAP }} />
              <Text style={styles.sectionLabel}>PAYOUT DAY</Text>
              <View style={{ height: LABEL_FIELD_GAP }} />
              <View style={styles.dayRow}>
                {WEEKDAYS.map((d) => {
                  const on = payoutDay === d;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setPayoutDay(d)}
                      style={({ pressed }) => [
                        styles.dayPill,
                        on ? styles.dayPillOn : styles.dayPillOff,
                        pressed && { opacity: 0.9 },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={d}>
                      <Text style={[styles.dayPillText, on ? styles.dayPillTextOn : styles.dayPillTextOff]}>{d}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <View style={{ height: BLOCK_GAP }} />

          <Text style={styles.sectionLabel}>MINIMUM PAYOUT</Text>
          <View style={{ height: LABEL_FIELD_GAP }} />
          <DashedBox minHeight={FIELD_MIN_H} innerStyle={styles.amountInner}>
            <TextInput
              value={minPayout}
              onChangeText={setMinPayout}
              style={styles.amountInput}
              placeholder="$0.00"
              placeholderTextColor="rgba(0, 0, 0, 0.45)"
              keyboardType="decimal-pad"
            />
          </DashedBox>

          <View style={{ height: LABEL_FIELD_GAP }} />

          <DashedBox minHeight={64} innerStyle={styles.infoInner}>
            <Text style={styles.infoText}>Amounts below the threshold roll into the next period.</Text>
          </DashedBox>

          <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]} onPress={onSave} accessibilityRole="button">
            <Text style={styles.ctaText}>SAVE CHANGES</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  headBlock: { paddingTop: 8, paddingBottom: 4 },
  screen: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  navSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 27,
  },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 8 },
  intro: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  freqList: {
    gap: ROW_GAP,
  },
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
  freqCardInner: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  freqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#000000',
    marginRight: 14,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioOuterOn: {
    borderColor: '#000000',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  freqTextCol: {
    flex: 1,
    minWidth: 0,
  },
  freqTitle: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    lineHeight: 22,
    marginBottom: 4,
  },
  freqSub: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillOff: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000000',
  },
  dayPillOn: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#000000',
  },
  dayPillText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.3,
  },
  dayPillTextOff: {
    color: '#000',
  },
  dayPillTextOn: {
    color: '#fff',
  },
  amountInner: {
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  amountInput: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    margin: 0,
  },
  infoInner: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
  },
  cta: {
    height: 48,
    borderRadius: CARD_R,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: BLOCK_GAP,
  },
  ctaText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
});
