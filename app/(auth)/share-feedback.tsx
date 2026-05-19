import { useAuth } from '@clerk/expo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { postJsonApi } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, ink, layout } from '@/constants/theme';

const FIELD_H = 54;
const FEEDBACK_BOX_H = 150;
const BLOCK_GAP = 24;
const FIELD_FILL = '#F2F2F7';
const OUTLINE = 'rgba(60, 60, 67, 0.18)';
const BOX_R = 10;
const MUTED = 'rgba(60, 60, 67, 0.65)';

function FieldShell({
  minHeight,
  multiline,
  children,
}: {
  minHeight: number;
  multiline?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={[styles.fieldShell, { minHeight }]}>
      <View style={[styles.fieldInner, multiline && styles.fieldInnerMulti, { minHeight }]}>
        {children}
      </View>
    </View>
  );
}

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label10}>{label}</Text>
      {children}
    </View>
  );
}

function AttachBox() {
  const H = 74;
  return (
    <Pressable
      style={[styles.attachShell, { minHeight: H }]}
      onPress={() => Alert.alert('Attachments', 'Photo / video picker would open here.')}
      accessibilityRole="button"
      accessibilityLabel="Add photos or videos">
      <View style={[styles.attachInner, { minHeight: H }]}>
        <MaterialCommunityIcons name="paperclip" size={20} color={MUTED} />
        <View style={styles.attachCopy}>
          <Text style={styles.attachTitle}>Add photos or videos</Text>
          <Text style={styles.attachSub}>Up to 5 • images & video • 50MB max</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ShareFeedbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();

  const [topic, setTopic] = useState('');
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);

  const canSubmit = !!topic.trim() && !!feedback.trim();

  const onSubmit = async () => {
    if (!canSubmit || sending) return;
    setSending(true);
    try {
      const result = await postJsonApi(
        '/api/support/feedback',
        getToken,
        {
          source: 'mobile',
          topic: topic.trim(),
          feedback: feedback.trim(),
        },
      );
      if (!result.ok) {
        const hint =
          result.error === 'server_misconfigured'
            ? 'Feedback email is not configured on the server yet.'
            : result.status === 503
              ? 'This action is temporarily unavailable. Try again later.'
              : 'Could not submit feedback. Please try again.';
        Alert.alert('Could not submit', hint);
        return;
      }
      Alert.alert('Thank you', 'Your feedback has been submitted.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Could not submit', 'Check your connection and try again.');
    } finally {
      setSending(false);
    }
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
            <Text style={styles.navTitle}>Share feedback</Text>
          </View>
          <View style={styles.navSide} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
          <Text style={styles.intro}>
            Feedback is read by OMM product & support. Include a listing reference (e.g. OMM-20418) if relevant.
          </Text>

          <FieldBlock label="TOPIC">
            <FieldShell minHeight={FIELD_H}>
              <TextInput
                value={topic}
                onChangeText={setTopic}
                style={styles.input}
                placeholder="Topic"
                autoCapitalize="sentences"
                autoCorrect
                placeholderTextColor={MUTED}
              />
            </FieldShell>
          </FieldBlock>

          <FieldBlock label="YOUR FEEDBACK">
            <FieldShell minHeight={FEEDBACK_BOX_H} multiline>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                style={[styles.input, styles.inputMulti]}
                placeholder="Your feedback"
                multiline
                textAlignVertical="top"
                placeholderTextColor={MUTED}
              />
            </FieldShell>
          </FieldBlock>

          <View style={styles.attachSection}>
            <Text style={styles.label10}>ATTACHMENTS (OPTIONAL)</Text>
            <AttachBox />
          </View>

          <Pressable
            style={[styles.submitBtn, (!canSubmit || sending) && styles.submitBtnDisabled]}
            onPress={() => void onSubmit()}
            disabled={!canSubmit || sending}
            accessibilityRole="button"
            accessibilityLabel="Submit feedback">
            {({ pressed }) => (
              <>
                {sending ? (
                  <ActivityIndicator color={ink} />
                ) : (
                  <Text style={styles.submitBtnText}>Submit feedback</Text>
                )}
                {pressed && canSubmit && !sending ? (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 }]} />
                ) : null}
              </>
            )}
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
  navTitle: { fontSize: 18, fontFamily: 'Satoshi-Medium', color: '#000000' },
  scroll: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
  },
  intro: {
    fontSize: 13,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
  },
  fieldBlock: { marginBottom: BLOCK_GAP },
  label10: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  fieldShell: {
    width: '100%',
    borderRadius: BOX_R,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE,
    backgroundColor: FIELD_FILL,
    overflow: 'hidden',
  },
  fieldInner: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    width: '100%',
  },
  fieldInnerMulti: {
    justifyContent: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  input: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000',
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    margin: 0,
  },
  inputMulti: {
    minHeight: FEEDBACK_BOX_H - 28,
    paddingTop: 4,
    paddingBottom: 4,
  },
  attachSection: { marginBottom: BLOCK_GAP },
  attachShell: {
    width: '100%',
    borderRadius: BOX_R,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE,
    backgroundColor: FIELD_FILL,
    overflow: 'hidden',
  },
  attachInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },
  attachCopy: { flex: 1, minWidth: 0, gap: 2 },
  attachTitle: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  attachSub: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 17,
  },
  submitBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: ink,
    letterSpacing: -0.2,
  },
});
