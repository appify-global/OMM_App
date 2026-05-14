import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { AppButton } from '@/components/AppButton';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/theme';
/**
 * Account details (bank payouts) — Figma 1053:3682.
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3682&t=2eZigRM0BwNtC5wd-4
 */

const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
const AFTER_INTRO = 20;
const FIELD_MIN_H = 54;
const BOX_R = 8;
const STROKE = 'rgba(0, 0, 0, 0.45)';
const STROKE_W = 1.5;
const MUTED = 'rgba(0, 0, 0, 0.55)';
const SEP = 'rgba(0, 0, 0, 0.12)';
const SELECT_ROW_GAP = 8;
const SELECT_CHEVRON_SIZE = 12;
type GstChoice = '' | 'Yes' | 'No';
const GST_OPTIONS: readonly ('Yes' | 'No')[] = ['Yes', 'No'];

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

function GstRegisteredField({
  value,
  onChange,
}: {
  value: GstChoice;
  onChange: (next: GstChoice) => void;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  return (
    <>
      <DashedInputBox minHeight={FIELD_MIN_H} innerStyle={styles.selectInner}>
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="GST registered"
          accessibilityHint="Opens menu to choose Yes or No"
          style={({ pressed }) => [styles.selectPressable, pressed && styles.selectPressed]}>
          <View style={styles.selectRow}>
            <Text
              style={[styles.selectValue, !value && styles.selectPlaceholder]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {value || 'Yes or No'}
            </Text>
            <FontAwesome name="chevron-down" size={SELECT_CHEVRON_SIZE} color="rgba(0, 0, 0, 0.55)" />
          </View>
        </Pressable>
      </DashedInputBox>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.selectModalRoot}>
          <Pressable style={styles.selectModalBackdrop} onPress={() => setOpen(false)} accessibilityRole="button" />
          <View style={[styles.selectSheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>GST registered</Text>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Done">
                <Text style={styles.sheetDone}>Done</Text>
              </Pressable>
            </View>
            {GST_OPTIONS.map((option, index) => {
              const selected = value === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.selectOption, index === GST_OPTIONS.length - 1 && styles.selectOptionLast]}
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected }}>
                  <Text style={[styles.selectOptionText, selected && styles.selectOptionTextSelected]}>{option}</Text>
                  {selected ? (
                    <FontAwesome name="check" size={16} color="#000000" />
                  ) : (
                    <View style={styles.selectCheckSpacer} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function AccountDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [accountHolder, setAccountHolder] = useState('');
  const [bsb, setBsb] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [abn, setAbn] = useState('');
  const [gstRegistered, setGstRegistered] = useState<GstChoice>('');

  const onSave = () => {
    Alert.alert('Saved', 'Bank and tax details were updated.');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <View style={styles.navBar}>
          <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <FontAwesome name="chevron-left" size={20} color="#000000" />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>Account details</Text>
          </View>
          <View style={styles.navSide} />
        </View>

        <ScrollView
          style={styles.scrollFlex}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
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
            <GstRegisteredField value={gstRegistered} onChange={setGstRegistered} />
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <AppButton variant="filled" onPress={onSave} textStyle={styles.saveBtnLabel}>
            Save changes
          </AppButton>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
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
  scrollFlex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
    paddingBottom: 24,
  },
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
  footer: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SEP,
    backgroundColor: '#fff',
  },
  saveBtnLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  selectInner: {
    paddingVertical: 0,
    minHeight: FIELD_MIN_H,
  },
  selectPressable: {
    alignSelf: 'stretch',
    width: '100%',
    minHeight: FIELD_MIN_H,
    justifyContent: 'center',
  },
  selectPressed: {
    opacity: 0.85,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SELECT_ROW_GAP,
    minHeight: FIELD_MIN_H,
  },
  selectValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
    lineHeight: 22,
  },
  selectPlaceholder: {
    color: 'rgba(0, 0, 0, 0.45)',
  },
  selectModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  selectModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  selectSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 10,
    paddingHorizontal: layout.screenGutter,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SEP,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  sheetDone: {
    fontSize: 17,
    fontFamily: 'Satoshi-Medium',
    color: '#007AFF',
  },
  selectCheckSpacer: {
    width: 22,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SEP,
  },
  selectOptionLast: {
    borderBottomWidth: 0,
  },
  selectOptionText: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    paddingRight: 12,
  },
  selectOptionTextSelected: {
    color: '#000000',
  },
});
