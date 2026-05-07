import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
 * Share feedback — topic, feedback text, optional media attach.
 * [Figma 1053:3145](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3145&t=2eZigRM0BwNtC5wd-4)
 * Fields start empty (no design prefill).
 */

const H_PAD = 20;
const FIELD_H = 54;
const FEEDBACK_BOX_H = 150;
const STROKE = 'rgba(60,60,67,0.55)';
const STROKE_W = 1.5;
const DASH = '5 4';
const BLOCK_GAP = 24;

function DashedFrame({
  width,
  height,
  borderRadius,
}: {
  width: number;
  height: number;
  borderRadius: number;
}) {
  if (width <= 0) return null;
  const inset = STROKE_W / 2;
  return (
    <Svg
      pointerEvents="none"
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}>
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

function DashedFieldShell({
  height,
  borderRadius,
  children,
}: {
  height: number;
  borderRadius: number;
  children: ReactNode;
}) {
  const [w, setW] = useState(0);
  return (
    <View
      style={[styles.dashShell, { minHeight: height }]}
      onLayout={(e) => setW(Math.ceil(e.nativeEvent.layout.width))}>
      <DashedFrame width={w} height={height} borderRadius={borderRadius} />
      <View style={[styles.dashInner, { minHeight: height, height }]}>{children}</View>
    </View>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label10}>{label}</Text>
      {children}
    </View>
  );
}

function FeedbackAttachBox() {
  const [w, setW] = useState(0);
  const H = 74;
  return (
    <View style={[styles.dashShell, { minHeight: H }]} onLayout={(e) => setW(Math.ceil(e.nativeEvent.layout.width))}>
      {w > 0 ? <DashedFrame width={w} height={H} borderRadius={8} /> : null}
      <Pressable
        onPress={() => Alert.alert('Attachments', 'Photo / video picker would open here.')}
        style={[styles.attachMainInner, { minHeight: H }]}
        accessibilityRole="button"
        accessibilityLabel="Add photos or videos">
        <MaterialCommunityIcons name="paperclip" size={20} color="rgba(60,60,67,0.65)" />
        <View style={styles.attachCopyCol}>
          <Text style={styles.attachTitle}>Add photos or videos</Text>
          <Text style={styles.attachSub}>Up to 5 • images & video • 50MB max</Text>
        </View>
      </Pressable>
    </View>
  );
}

export default function ShareFeedbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [topic, setTopic] = useState('');
  const [feedback, setFeedback] = useState('');

  const canSubmit = !!topic.trim() && !!feedback.trim();

  const onSubmit = () => {
    if (!canSubmit) return;
    Alert.alert('Thank you', 'Your feedback has been submitted.');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <View style={styles.navBar}>
          <Pressable
            style={styles.navSide}
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back">
            <FontAwesome name="chevron-left" size={20} color="#1a1a1a" />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>Share feedback</Text>
          </View>
          <View style={styles.navSide} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
          <Text style={styles.intro}>
            Feedback is read by Appify product & support. Include a deal ref (e.g. OMM-20418) if relevant.
          </Text>

          <FieldBlock label="Topic">
            <DashedFieldShell height={FIELD_H} borderRadius={4}>
              <TextInput
                value={topic}
                onChangeText={setTopic}
                style={styles.input}
                placeholder="Topic"
                autoCapitalize="sentences"
                autoCorrect
                placeholderTextColor="rgba(60,60,67,0.45)"
              />
            </DashedFieldShell>
          </FieldBlock>

          <FieldBlock label="Your feedback">
            <DashedFieldShell height={FEEDBACK_BOX_H} borderRadius={4}>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                style={[styles.input, styles.inputMultiline]}
                placeholder="Your feedback"
                multiline
                textAlignVertical="top"
                placeholderTextColor="rgba(60,60,67,0.45)"
              />
            </DashedFieldShell>
          </FieldBlock>

          <View style={styles.attachSection}>
            <Text style={styles.label10}>Attachments (optional)</Text>
            <FeedbackAttachBox />
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              !canSubmit && styles.submitBtnDisabled,
              pressed && canSubmit && { opacity: 0.92 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Submit feedback">
            <Text style={styles.submitBtnText}>Submit feedback</Text>
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
  navTitle: { fontSize: 18, fontWeight: '500', color: '#1a1a1a' },
  scroll: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
  },
  intro: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(60,60,67,0.55)',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldBlock: {
    marginBottom: BLOCK_GAP,
  },
  label10: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(60,60,67,0.55)',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  dashShell: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#fff',
  },
  dashInner: {
    justifyContent: 'center',
    paddingHorizontal: 10,
    width: '100%',
  },
  input: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    margin: 0,
  },
  inputMultiline: {
    minHeight: FEEDBACK_BOX_H - 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  attachSection: {
    marginBottom: BLOCK_GAP,
  },
  attachMainInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
    width: '100%',
  },
  attachCopyCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  attachTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  attachSub: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(60,60,67,0.55)',
    lineHeight: 16.5,
  },
  submitBtn: {
    height: 48,
    borderRadius: 4,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
