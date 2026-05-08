import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { useScreenHorizontalPadding } from '@/lib/useScreenHorizontalPadding';

/**
 * Account details (bank payouts) — Figma 1053:3682.
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3682&t=2eZigRM0BwNtC5wd-4
 */

const H_PAD = 20;
const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
const AFTER_INTRO = 20;
const FIELD_MIN_H = 54;
const BOX_R = 8;
const STROKE = 'rgba(0, 0, 0, 0.45)';
const STROKE_W = 1.5;
const DASH = '5 4';
const MUTED = 'rgba(0, 0, 0, 0.55)';
const SEP = 'rgba(0, 0, 0, 0.12)';
type GstChoice = '' | 'Yes' | 'No';

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

function DashedInputBox({
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
      <DashedFrame width={size.w} height={size.h} borderRadius={BOX_R} />
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

export default function AccountDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hPad = useScreenHorizontalPadding();
  const [accountHolder, setAccountHolder] = useState('');
  const [bsb, setBsb] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [abn, setAbn] = useState('');
  const [gstRegistered, setGstRegistered] = useState<GstChoice>('');
  const [gstPickerOpen, setGstPickerOpen] = useState(false);

  const onSave = () => {
    Alert.alert('Saved', 'Bank and tax details were updated.');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <View style={[styles.headBlock, hPad]}>
        <ScreenHeader title="Account details" onBack={() => router.back()} />
      </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
          <Text style={styles.intro}>
            Where OMM deposits your commission payouts. Verified via microdeposit (1—2 business days).
          </Text>

          <View style={{ height: AFTER_INTRO }} />

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>ACCOUNT HOLDER</Text>
            <DashedInputBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={accountHolder}
                onChangeText={setAccountHolder}
                style={styles.input}
                placeholder="Full legal name"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </DashedInputBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>BSB</Text>
            <DashedInputBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={bsb}
                onChangeText={setBsb}
                style={styles.input}
                placeholder="000-000"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                keyboardType="number-pad"
                maxLength={10}
              />
            </DashedInputBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>ACCOUNT NUMBER</Text>
            <DashedInputBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={accountNumber}
                onChangeText={setAccountNumber}
                style={styles.input}
                placeholder="Account number"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                keyboardType="number-pad"
                secureTextEntry
              />
            </DashedInputBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>STATUS</Text>
            <DashedInputBox minHeight={FIELD_MIN_H} innerStyle={styles.statusInner}>
              <Text style={styles.statusMuted}>Verification pending</Text>
            </DashedInputBox>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>ABN</Text>
            <DashedInputBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={abn}
                onChangeText={setAbn}
                style={styles.input}
                placeholder="XX XXX XXX XXX"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                keyboardType="numbers-and-punctuation"
              />
            </DashedInputBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>GST REGISTERED</Text>
            <DashedInputBox minHeight={FIELD_MIN_H} innerStyle={styles.selectShell}>
              <Pressable
                onPress={() => setGstPickerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="GST registered"
                accessibilityHint="Opens menu to choose Yes or No"
                style={({ pressed }) => [styles.selectRow, pressed && { opacity: 0.85 }]}>
                <Text style={[styles.selectValue, !gstRegistered && styles.selectPlaceholder]}>
                  {gstRegistered || 'Yes or No'}
                </Text>
                <FontAwesome name="chevron-down" size={14} color="rgba(0, 0, 0, 0.45)" />
              </Pressable>
            </DashedInputBox>
          </View>

          <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]} onPress={onSave} accessibilityRole="button">
            <Text style={styles.ctaText}>SAVE CHANGES</Text>
          </Pressable>
        </ScrollView>

        <Modal
          visible={gstPickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setGstPickerOpen(false)}>
          <View style={styles.modalRoot}>
            <Pressable style={styles.modalBackdrop} onPress={() => setGstPickerOpen(false)} accessibilityRole="button" />
            <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
              <Text style={styles.modalSheetTitle}>GST registered</Text>
              <Pressable
                style={({ pressed }) => [styles.modalOption, pressed && { opacity: 0.85 }]}
                onPress={() => {
                  setGstRegistered('Yes');
                  setGstPickerOpen(false);
                }}
                accessibilityRole="menuitem">
                <Text style={styles.modalOptionText}>Yes</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalOption, pressed && { opacity: 0.85 }]}
                onPress={() => {
                  setGstRegistered('No');
                  setGstPickerOpen(false);
                }}
                accessibilityRole="menuitem">
                <Text style={styles.modalOptionText}>No</Text>
              </Pressable>
              <View style={styles.modalDivider} />
              <Pressable
                style={({ pressed }) => [styles.modalCancel, pressed && { opacity: 0.85 }]}
                onPress={() => setGstPickerOpen(false)}
                accessibilityRole="button">
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
  fieldBlock: {
    marginBottom: BLOCK_GAP,
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
    marginBottom: LABEL_FIELD_GAP,
  },
  dashShell: { position: 'relative', width: '100%', backgroundColor: '#fff', borderRadius: BOX_R, overflow: 'hidden' },
  dashInner: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    width: '100%',
    backgroundColor: 'transparent',
  },
  statusInner: {
    justifyContent: 'center',
    paddingVertical: 4,
  },
  input: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    margin: 0,
  },
  statusMuted: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SEP,
    marginBottom: BLOCK_GAP,
    marginTop: 4,
  },
  cta: {
    height: 48,
    borderRadius: BOX_R,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  selectShell: {
    paddingVertical: 0,
    justifyContent: 'center',
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: FIELD_MIN_H - 2,
    paddingVertical: Platform.select({ ios: 2, default: 0 }),
  },
  selectValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
    lineHeight: 22,
    paddingVertical: Platform.select({ ios: 12, default: 10 }),
  },
  selectPlaceholder: {
    color: 'rgba(0, 0, 0, 0.45)',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingTop: 12,
    paddingHorizontal: H_PAD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  modalSheetTitle: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.25,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000',
  },
  modalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SEP,
    marginVertical: 4,
  },
  modalCancel: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: MUTED,
  },
});
