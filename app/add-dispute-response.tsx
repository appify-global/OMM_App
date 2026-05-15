import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, ink, layout, slateNavy } from '@/constants/theme';
import { getDisputeDetail } from '@/lib/disputes-mock';

/**
 * Add response — empty message field only (no pre-fill).
 */

const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
const FIELD_MIN_H = 140;
const MUTED = 'rgba(0, 0, 0, 0.55)';
const OUTLINE = 'rgba(0, 0, 0, 0.08)';
const BOX_R = 10;

export default function AddDisputeResponseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const disputeId = typeof id === 'string' ? id : id?.[0];
  const d = disputeId ? getDisputeDetail(disputeId) : null;
  const [message, setMessage] = useState('');

  const submit = () => {
    if (!message.trim()) {
      Alert.alert('Incomplete', 'Enter your response before submitting.');
      return;
    }
    Alert.alert('Sent', 'Your response has been added to the dispute.');
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
            <Text style={styles.navTitle}>Add response</Text>
          </View>
          <View style={styles.navSide} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
          {d ? (
            <Text style={styles.sub}>Dispute {d.id}. Your response is visible to support and involved parties.</Text>
          ) : (
            <Text style={styles.sub}>Add a response to this dispute.</Text>
          )}

          <Text style={styles.label}>YOUR RESPONSE</Text>
          <View style={{ height: LABEL_FIELD_GAP }} />

          <ResponseField minHeight={FIELD_MIN_H} value={message} onChangeText={setMessage} />

          <View style={{ height: BLOCK_GAP }} />

          <Pressable style={styles.cta} onPress={submit} accessibilityRole="button">
            {({ pressed }) => (
              <>
                <Text style={styles.ctaText}>SEND RESPONSE</Text>
                {pressed && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }]} />}
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function ResponseField({
  minHeight,
  value,
  onChangeText,
}: {
  minHeight: number;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View style={[styles.shell, { minHeight }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, { minHeight }]}
        placeholder="Type your response here."
        placeholderTextColor="rgba(0, 0, 0, 0.45)"
        multiline
        textAlignVertical="top"
      />
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
  sub: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  shell: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#fafafa',
    borderRadius: BOX_R,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE,
    overflow: 'hidden',
  },
  input: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    margin: 0,
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
    letterSpacing: -0.35,
    textTransform: 'uppercase',
  },
});
