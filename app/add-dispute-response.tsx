import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { getDisputeDetail } from '@/lib/disputes-mock';

/**
 * Add response — empty message field only (no pre-fill).
 */

const H_PAD = 20;
const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
const FIELD_MIN_H = 140;
const STROKE = 'rgba(60,60,67,0.55)';
const STROKE_W = 1.5;
const DASH = '5 4';
const MUTED = 'rgba(60,60,67,0.55)';

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
            <FontAwesome name="chevron-left" size={20} color="#1a1a1a" />
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

          <ResponseDashedField minHeight={FIELD_MIN_H} value={message} onChangeText={setMessage} />

          <View style={{ height: BLOCK_GAP }} />

          <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]} onPress={submit} accessibilityRole="button">
            <Text style={styles.ctaText}>SEND RESPONSE</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function ResponseDashedField({
  minHeight,
  value,
  onChangeText,
}: {
  minHeight: number;
  value: string;
  onChangeText: (t: string) => void;
}) {
  const [w, setW] = useState(0);
  const [h, setH] = useState(minHeight);
  return (
    <View
      style={[styles.shell, { minHeight }]}
      onLayout={(e) => {
        setW(Math.ceil(e.nativeEvent.layout.width));
        setH(Math.max(minHeight, Math.ceil(e.nativeEvent.layout.height)));
      }}>
      <Svg pointerEvents="none" width={w} height={h} style={StyleSheet.absoluteFill}>
        <Rect
          x={STROKE_W / 2}
          y={STROKE_W / 2}
          width={Math.max(0, w - STROKE_W)}
          height={Math.max(0, h - STROKE_W)}
          rx={8}
          ry={8}
          fill="none"
          stroke={STROKE}
          strokeWidth={STROKE_W}
          strokeDasharray={DASH}
        />
      </Svg>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, { minHeight }]}
        placeholder="Type your response here."
        placeholderTextColor="rgba(60,60,67,0.45)"
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
  navTitle: { fontSize: 18, fontWeight: '500', color: '#1a1a1a', lineHeight: 27 },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 8 },
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
    backgroundColor: '#fff',
    borderRadius: 8,
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
    height: 48,
    borderRadius: 4,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.35,
    textTransform: 'uppercase',
  },
});
