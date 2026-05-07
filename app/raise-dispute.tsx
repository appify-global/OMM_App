import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Raise a dispute — Figma 1053:3056. Empty values; placeholders only.
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3056
 */

const H_PAD = 20;
const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
const AFTER_INTRO = 20;
const FIELD_MIN_H = 54;
const DETAILS_MIN_H = 132;
const BOX_R = 8;
const STROKE = 'rgba(142, 142, 147, 0.65)';
const STROKE_W = 1;
const DASH = '5 4';
const MUTED = '#8E8E93';
const TEXT_BLACK = '#000000';

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

/** Dashed shell that tracks inner size (supports multiline details). */
function DashedInputBox({
  minHeight,
  borderRadius = BOX_R,
  children,
  innerStyle,
}: {
  minHeight: number;
  borderRadius?: number;
  children: ReactNode;
  innerStyle?: object;
}) {
  const [size, setSize] = useState({ w: 0, h: minHeight });
  return (
    <View style={[styles.dashShell, { minHeight }]}>
      <DashedFrame width={size.w} height={size.h} borderRadius={borderRadius} />
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

export default function RaiseDisputeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [deal, setDeal] = useState('');
  const [category, setCategory] = useState('');
  const [otherParty, setOtherParty] = useState('');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [resolvedAttempt, setResolvedAttempt] = useState(false);

  const submit = () => {
    if (
      !deal.trim() ||
      !category.trim() ||
      !otherParty.trim() ||
      !summary.trim() ||
      !details.trim()
    ) {
      Alert.alert('Incomplete', 'Fill in all fields before submitting.');
      return;
    }
    if (!resolvedAttempt) {
      Alert.alert('Confirmation required', 'Please confirm you have tried to resolve this with the other agent.');
      return;
    }
    Alert.alert('Submitted', 'Your dispute will be reviewed by support.');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <View style={styles.navBar}>
          <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <FontAwesome name="chevron-left" size={20} color="#1a1a1a" />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>Raise a dispute</Text>
          </View>
          <View style={styles.navSide} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
          <Text style={styles.intro}>
            Please attempt to resolve with the other party first. Frivolous disputes may impact your OMM rating.
          </Text>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>DEAL</Text>
            <DashedInputBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={deal}
                onChangeText={setDeal}
                style={styles.input}
                placeholder="OMM-20418 · 42 High St, Boroondara"
                placeholderTextColor={MUTED}
              />
            </DashedInputBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>CATEGORY</Text>
            <DashedInputBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={category}
                onChangeText={setCategory}
                style={styles.input}
                placeholder="Commission"
                placeholderTextColor={MUTED}
              />
            </DashedInputBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>OTHER PARTY</Text>
            <DashedInputBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={otherParty}
                onChangeText={setOtherParty}
                style={styles.input}
                placeholder="Sarah Chen · Ray White Hawthorn"
                placeholderTextColor={MUTED}
              />
            </DashedInputBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>SUMMARY (ONE LINE)</Text>
            <DashedInputBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={summary}
                onChangeText={setSummary}
                style={styles.input}
                placeholder="20% lower than agreed during countersign"
                placeholderTextColor={MUTED}
              />
            </DashedInputBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>DETAILS</Text>
            <DashedInputBox minHeight={DETAILS_MIN_H} innerStyle={styles.detailsInner}>
              <TextInput
                value={details}
                onChangeText={setDetails}
                style={[styles.input, styles.inputMulti]}
                placeholder="Describe what happened and the resolution you are seeking. Include deal refs and dates."
                placeholderTextColor={MUTED}
                multiline
                textAlignVertical="top"
              />
            </DashedInputBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>ATTACHMENTS (OPTIONAL)</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Attach files"
              onPress={() =>
                Alert.alert('Attachments', 'File picker will be available in a future build. PNG, JPG, PDF • up to 5 files • 25MB max.')
              }>
              <DashedInputBox minHeight={76} innerStyle={styles.attachInner}>
                <View style={styles.attachRow}>
                  <FontAwesome name="paperclip" size={18} color={MUTED} style={styles.attachIcon} />
                  <View style={styles.attachTextCol}>
                    <Text style={styles.attachTitle}>Attach screenshot or file</Text>
                    <Text style={styles.attachSub}>PNG, JPG, PDF • up to 5 files • 25MB max</Text>
                  </View>
                </View>
              </DashedInputBox>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.checkRow, pressed && { opacity: 0.85 }]}
            onPress={() => setResolvedAttempt(!resolvedAttempt)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: resolvedAttempt }}>
            <View style={[styles.checkbox, resolvedAttempt && styles.checkboxChecked]}>
              {resolvedAttempt ? <FontAwesome name="check" size={12} color="#fff" /> : null}
            </View>
            <Text style={styles.checkLabel}>I have attempted to resolve this directly with the other agent.</Text>
          </Pressable>

          <View style={{ height: 28 }} />

          <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]} onPress={submit} accessibilityRole="button">
            <Text style={styles.ctaText}>SUBMIT DISPUTE</Text>
          </Pressable>
        </ScrollView>
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
  navTitle: { fontSize: 18, fontWeight: '500', color: '#1a1a1a', lineHeight: 27 },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 8 },
  intro: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: AFTER_INTRO,
  },
  fieldBlock: { marginBottom: BLOCK_GAP },
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
    paddingVertical: 4,
    width: '100%',
    backgroundColor: 'transparent',
  },
  detailsInner: {
    justifyContent: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  attachInner: {
    justifyContent: 'center',
    paddingVertical: 14,
  },
  input: {
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_BLACK,
    paddingVertical: Platform.select({ ios: 12, default: 10 }),
    margin: 0,
  },
  inputMulti: {
    minHeight: DETAILS_MIN_H - 32,
    paddingTop: 4,
    paddingBottom: 4,
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachIcon: { marginRight: 12 },
  attachTextCol: { flex: 1 },
  attachTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_BLACK,
    lineHeight: 21,
  },
  attachSub: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
    marginTop: 2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    marginRight: 12,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_BLACK,
    lineHeight: 21,
  },
  cta: {
    height: 48,
    borderRadius: BOX_R,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
