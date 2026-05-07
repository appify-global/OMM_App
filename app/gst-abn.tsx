import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * GST / ABN — Figma 1053:4377.
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-4377
 */

const H_PAD = 20;
const STROKE = 'rgba(60,60,67,0.55)';
const STROKE_W = 1.5;
const DASH = '7 5';
const MUTED = 'rgba(60,60,67,0.55)';
const SECTION_GAP = 16;
/** Extra space before tax invoice preferences (checkbox block sits lower). */
const TAX_PREFS_TOP_SPACER = 28;
const GST_ROW_R = 8;
const FIELD_R = 4;
const GST_TOGGLE_H = 74;
const FIELD_H = 58;
const CHECKBOX = 20;
const TAX_PREFS_MIN_H = 158;

function DashedFrame({ width, height, borderRadius }: { width: number; height: number; borderRadius: number }) {
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

function DashedShell({
  borderRadius,
  children,
  height,
  minHeight,
  style,
}: {
  borderRadius: number;
  children: ReactNode;
  height?: number;
  minHeight?: number;
  style?: object;
}) {
  const initialH = height ?? Math.max(minHeight ?? 0, 1);
  const [size, setSize] = useState({ w: 0, h: initialH });
  return (
    <View
      style={[
        styles.dashOuter,
        {
          borderRadius,
          minHeight: height ?? minHeight ?? undefined,
          height: height ?? undefined,
          overflow: 'hidden',
        },
        style,
      ]}
      collapsable={false}
      onLayout={(e) => {
        const { width, height: lh } = e.nativeEvent.layout;
        setSize({ w: Math.ceil(width), h: Math.ceil(lh) });
      }}>
      <DashedFrame width={size.w} height={size.h} borderRadius={borderRadius} />
      {children}
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function LabeledTextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  endSlot,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  endSlot?: ReactNode;
}) {
  const innerH = FIELD_H - STROKE_W * 2;
  return (
    <View style={styles.labeledBlock}>
      <FieldLabel>{label}</FieldLabel>
      <DashedShell borderRadius={FIELD_R} height={FIELD_H} style={styles.fieldShell}>
        <View style={[styles.fieldRowInner, { minHeight: innerH }]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={MUTED}
            keyboardType={keyboardType === 'numeric' ? 'number-pad' : 'default'}
            style={[styles.fieldInput, endSlot ? styles.fieldInputWithChip : undefined]}
            underlineColorAndroid="transparent"
          />
          {endSlot}
        </View>
      </DashedShell>
    </View>
  );
}

function PrefRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.88 }]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}>
      <View style={styles.checkboxBox}>
        {checked ? <FontAwesome name="check" size={12} color="#1a1a1a" /> : null}
      </View>
      <Text style={styles.prefText}>{label}</Text>
    </Pressable>
  );
}

export default function GstAbnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [registeredGst, setRegisteredGst] = useState(true);
  const [abn, setAbn] = useState('12 345 678 901');
  const [businessName, setBusinessName] = useState('AZ Real Estate Pty Ltd');
  const [businessAddress, setBusinessAddress] = useState('12/400 Bourke St, Melbourne VIC 3000');
  const [prefAutoIssue, setPrefAutoIssue] = useState(true);
  const [prefEmailCopy, setPrefEmailCopy] = useState(true);
  const [prefAbnReceipts, setPrefAbnReceipts] = useState(true);

  const save = useCallback(() => {
    Alert.alert('GST / ABN', 'Your changes have been saved.');
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <FontAwesome name="chevron-left" size={20} color="#1a1a1a" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>GST / ABN</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.intro}>
          Used on your tax invoices and payout statements. Required for Australian-registered agents.
        </Text>

        <View style={{ height: SECTION_GAP }} />

        <DashedShell borderRadius={GST_ROW_R} height={GST_TOGGLE_H} style={styles.wideShell}>
          <View style={styles.gstRow}>
            <View style={styles.gstTextCol}>
              <Text style={styles.gstTitle}>Registered for GST</Text>
              <Text style={styles.gstSub}>Invoices will include 10% GST</Text>
            </View>
            <Switch
              value={registeredGst}
              onValueChange={setRegisteredGst}
              trackColor={{ false: '#e9e9ea', true: '#1c1c1e' }}
              thumbColor="#fff"
              ios_backgroundColor="#e9e9ea"
            />
          </View>
        </DashedShell>

        <View style={{ height: SECTION_GAP }} />

        <LabeledTextField
          label="ABN"
          value={abn}
          onChangeText={setAbn}
          placeholder="00 000 000 000"
          keyboardType="numeric"
          endSlot={
            <View style={styles.verifiedChip}>
              <Text style={styles.verifiedChipText}>VERIFIED</Text>
            </View>
          }
        />

        <View style={{ height: SECTION_GAP }} />

        <LabeledTextField label="BUSINESS NAME" value={businessName} onChangeText={setBusinessName} />

        <View style={{ height: SECTION_GAP }} />

        <LabeledTextField label="BUSINESS ADDRESS" value={businessAddress} onChangeText={setBusinessAddress} />

        <View style={{ height: TAX_PREFS_TOP_SPACER }} />

        <Text style={styles.sectionKicker}>TAX INVOICE PREFERENCES</Text>
        <View style={styles.kickerToBox} />
        <DashedShell borderRadius={GST_ROW_R} minHeight={TAX_PREFS_MIN_H} style={styles.wideShell}>
          <View style={styles.prefBoxInner}>
            <PrefRow label="Auto-issue tax invoices to contacts" checked={prefAutoIssue} onToggle={() => setPrefAutoIssue((v) => !v)} />
            <PrefRow label="Email a copy to me" checked={prefEmailCopy} onToggle={() => setPrefEmailCopy((v) => !v)} />
            <PrefRow label="Include ABN on receipts" checked={prefAbnReceipts} onToggle={() => setPrefAbnReceipts((v) => !v)} />
          </View>
        </DashedShell>

        <View style={{ height: 24 }} />

        <Pressable
          onPress={save}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.92 }]}
          accessibilityRole="button"
          accessibilityLabel="Save changes">
          <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
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
    fontSize: 19,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 28,
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
  },
  intro: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
  },
  dashOuter: {
    position: 'relative',
    backgroundColor: 'transparent',
    width: '100%',
  },
  wideShell: {
    width: '100%',
  },
  gstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    margin: STROKE_W,
    minHeight: GST_TOGGLE_H - STROKE_W * 2,
  },
  gstTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  gstTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 5,
    lineHeight: 21,
  },
  gstSub: {
    fontSize: 13,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.11,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 16,
    marginLeft: 6,
    marginBottom: 8,
  },
  labeledBlock: {
    width: '100%',
  },
  fieldShell: {
    width: '100%',
  },
  fieldRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: STROKE_W,
    paddingLeft: 10,
    paddingRight: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    lineHeight: 24,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    margin: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' as const } : {}),
  },
  fieldInputWithChip: {
    paddingRight: 8,
  },
  verifiedChip: {
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 13,
    paddingVertical: 4,
    borderRadius: 14,
    flexShrink: 0,
  },
  verifiedChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.22,
  },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '500',
    color: MUTED,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    lineHeight: 16,
    marginLeft: 1,
  },
  kickerToBox: { height: 10 },
  prefBoxInner: {
    margin: STROKE_W,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 24,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkboxBox: {
    width: CHECKBOX,
    height: CHECKBOX,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(26,26,26,0.35)',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 22,
  },
  saveBtn: {
    backgroundColor: '#1c1c1e',
    borderWidth: STROKE_W,
    borderColor: STROKE,
    borderStyle: 'dashed',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.14,
  },
});
