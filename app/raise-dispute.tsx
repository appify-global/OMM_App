import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, accent, ink } from '@/constants/theme';
import { useAgentDisputes } from '@/lib/agent-disputes-context';
/**
 * Raise a dispute — solid-bordered fields, PROPERTY ADDRESS label.
 */

const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
const AFTER_INTRO = 20;
const FIELD_MIN_H = 54;
const DETAILS_MIN_H = 132;
const BOX_R = 10;
const MUTED = '#8E8E93';
const TEXT_BLACK = '#000000';
const OUTLINE = 'rgba(0, 0, 0, 0.08)';

function FieldBox({
  minHeight,
  children,
  innerStyle,
}: {
  minHeight: number;
  children: ReactNode;
  innerStyle?: object;
}) {
  return (
    <View style={[styles.fieldShell, { minHeight }]}>
      <View style={[styles.fieldInner, { minHeight }, innerStyle]}>{children}</View>
    </View>
  );
}

export default function RaiseDisputeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { raiseDispute } = useAgentDisputes();
  const [propertyAddress, setPropertyAddress] = useState('');
  const [category, setCategory] = useState('');
  const [otherParty, setOtherParty] = useState('');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [resolvedAttempt, setResolvedAttempt] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    if (
      !propertyAddress.trim() ||
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
    void (async () => {
      setSubmitting(true);
      try {
        const newId = await raiseDispute({
          propertyAddress: propertyAddress.trim(),
          category: category.trim(),
          otherParty: otherParty.trim(),
          summary: summary.trim(),
          details: details.trim(),
        });
        router.replace({
          pathname: '/dispute-detail',
          params: { id: newId },
        } as Href);
      } catch {
        Alert.alert(
          'Could not save dispute',
          'Something went wrong saving on this device. Check storage permissions and try again.',
        );
      } finally {
        setSubmitting(false);
      }
    })();
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
            <Text style={styles.label}>PROPERTY ADDRESS</Text>
            <FieldBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={propertyAddress}
                onChangeText={setPropertyAddress}
                style={styles.input}
                placeholder="218 Victoria St, West Melbourne VIC 3003"
                placeholderTextColor={MUTED}
              />
            </FieldBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>CATEGORY</Text>
            <FieldBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={category}
                onChangeText={setCategory}
                style={styles.input}
                placeholder="Commission"
                placeholderTextColor={MUTED}
              />
            </FieldBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>OTHER PARTY</Text>
            <FieldBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={otherParty}
                onChangeText={setOtherParty}
                style={styles.input}
                placeholder="Sarah Chen · Biggin Scott West Melbourne"
                placeholderTextColor={MUTED}
              />
            </FieldBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>SUMMARY (ONE LINE)</Text>
            <FieldBox minHeight={FIELD_MIN_H}>
              <TextInput
                value={summary}
                onChangeText={setSummary}
                style={styles.input}
                placeholder="20% lower than agreed during countersign"
                placeholderTextColor={MUTED}
              />
            </FieldBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>DETAILS</Text>
            <FieldBox minHeight={DETAILS_MIN_H} innerStyle={styles.detailsInner}>
              <TextInput
                value={details}
                onChangeText={setDetails}
                style={[styles.input, styles.inputMulti]}
                placeholder="Describe what happened and the resolution you are seeking. Include listing references and dates."
                placeholderTextColor={MUTED}
                multiline
                textAlignVertical="top"
              />
            </FieldBox>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>ATTACHMENTS (OPTIONAL)</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Attach files"
              onPress={() =>
                Alert.alert('Attachments', 'File picker will be available in a future build. PNG, JPG, PDF • up to 5 files • 25MB max.')
              }>
              <FieldBox minHeight={76} innerStyle={styles.attachInner}>
                <View style={styles.attachRow}>
                  <FontAwesome name="paperclip" size={18} color={MUTED} style={styles.attachIcon} />
                  <View style={styles.attachTextCol}>
                    <Text style={styles.attachTitle}>Attach screenshot or file</Text>
                    <Text style={styles.attachSub}>PNG, JPG, PDF • up to 5 files • 25MB max</Text>
                  </View>
                </View>
              </FieldBox>
            </Pressable>
          </View>

          <Pressable
            style={styles.checkRow}
            onPress={() => setResolvedAttempt(!resolvedAttempt)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: resolvedAttempt }}>
            {({ pressed }) => (
              <>
                <View style={[styles.checkbox, resolvedAttempt && styles.checkboxChecked, pressed && { opacity: 0.7 }]}>
                  {resolvedAttempt ? <FontAwesome name="check" size={12} color={ink} /> : null}
                </View>
                <Text style={[styles.checkLabel, pressed && { opacity: 0.7 }]}>I have attempted to resolve this directly with the other agent.</Text>
              </>
            )}
          </Pressable>

          <View style={{ height: 28 }} />

          <Pressable
            style={[styles.cta, submitting && { opacity: 0.55 }]}
            onPress={submit}
            accessibilityRole="button"
            disabled={submitting}>
            {({ pressed }) => (
              <>
                {submitting ? (
                  <ActivityIndicator color={ink} />
                ) : (
                  <Text style={styles.ctaText}>SUBMIT DISPUTE</Text>
                )}
                {!submitting && pressed ? (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }]} />
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
  navTitle: { fontSize: 18, fontFamily: 'Satoshi-Medium', color: '#000000', lineHeight: 27 },
  scroll: { paddingHorizontal: layout.screenGutter, paddingTop: 8 },
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
  fieldShell: {
    width: '100%',
    borderRadius: BOX_R,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  fieldInner: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    width: '100%',
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
    borderColor: '#000000',
    marginRight: 12,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: accent,
    borderColor: '#000000',
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: TEXT_BLACK,
    lineHeight: 21,
  },
  cta: {
    height: 52,
    borderRadius: 12,
    backgroundColor: accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ctaText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: ink,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
