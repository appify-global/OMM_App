import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Contact support — ticket form + attachments.
 * [Figma 1053:2327](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-2327&t=2eZigRM0BwNtC5wd-4)
 * Fields start empty (no design prefill).
 */

const H_PAD = 20;
const FIELD_H = 54;
const MESSAGE_BOX_H = 150;
const STROKE = 'rgba(0, 0, 0, 0.55)';
const STROKE_W = 1.5;
const DASH = '5 4';
const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
/** Space between main attach row and thumbnail row */
const ATTACH_MAIN_TO_THUMBS = 12;

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

export default function ContactSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const canSend = !!fullName.trim() && !!email.trim() && !!message.trim();

  const onSend = () => {
    if (!canSend) return;
    Alert.alert('Message sent', 'We will reply within one business day.');
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
            <FontAwesome name="chevron-left" size={20} color="#000000" />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>Contact support</Text>
          </View>
          <View style={styles.navSide} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
          <Text style={styles.intro}>
            Include your agency and an OMM deal ID if the issue relates to a transaction (e.g. OMM-20418). We reply
            within one business day.
          </Text>

          <FieldBlock label="Full name">
            <DashedFieldShell height={FIELD_H} borderRadius={4}>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                placeholder="Full name"
                autoCapitalize="words"
                autoCorrect={false}
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
              />
            </DashedFieldShell>
          </FieldBlock>

          <FieldBlock label="Email">
            <DashedFieldShell height={FIELD_H} borderRadius={4}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
              />
            </DashedFieldShell>
          </FieldBlock>

          <FieldBlock label="Phone">
            <DashedFieldShell height={FIELD_H} borderRadius={4}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                placeholder="Phone"
                keyboardType="phone-pad"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
              />
            </DashedFieldShell>
          </FieldBlock>

          <FieldBlock label="Your message">
            <DashedFieldShell height={MESSAGE_BOX_H} borderRadius={4}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                style={[styles.input, styles.inputMultiline]}
                placeholder="Your message"
                multiline
                textAlignVertical="top"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
              />
            </DashedFieldShell>
          </FieldBlock>

          <View style={styles.attachSection}>
            <Text style={styles.label10}>Attachments</Text>
            <AttachMainBox />
            <View style={{ height: ATTACH_MAIN_TO_THUMBS }} />
            <View style={styles.attachThumbsRow}>
              <Pressable
                onPress={() => Alert.alert('Attachments', 'Photo library would open here.')}
                style={({ pressed }) => [styles.thumbBox68, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="Add image">
                <DashedThumbWrap width={68} height={74} borderRadius={4}>
                  <FontAwesome name="image" size={22} color="#000000" />
                </DashedThumbWrap>
              </Pressable>
              <Pressable
                onPress={() => Alert.alert('Attachments', 'Document picker would open here.')}
                style={({ pressed }) => [styles.thumbBox74, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="Add document">
                <DashedThumbWrap width={74} height={74} borderRadius={4}>
                  <View style={styles.docIconPlate}>
                    <FontAwesome name="file-text-o" size={18} color="#fff" />
                  </View>
                </DashedThumbWrap>
              </Pressable>
              <Pressable
                onPress={() => Alert.alert('Attachments', 'Add another file.')}
                style={({ pressed }) => [styles.thumbBox72, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="Add file">
                <DashedThumbWrap width={72} height={72} borderRadius={14}>
                  <FontAwesome name="plus" size={20} color="#000000" />
                </DashedThumbWrap>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={onSend}
            disabled={!canSend}
            style={({ pressed }) => [
              styles.sendBtn,
              !canSend && styles.sendBtnDisabled,
              pressed && canSend && { opacity: 0.92 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message">
            <Text style={styles.sendBtnText}>Send message</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function AttachMainBox() {
  const [w, setW] = useState(0);
  const H = 74;
  return (
    <View style={[styles.dashShell, { minHeight: H }]} onLayout={(e) => setW(Math.ceil(e.nativeEvent.layout.width))}>
      {w > 0 ? <DashedFrame width={w} height={H} borderRadius={8} /> : null}
      <Pressable
        onPress={() => Alert.alert('Attachments', 'File picker would open here.')}
        style={[styles.attachMainInner, { minHeight: H }]}
        accessibilityRole="button"
        accessibilityLabel="Attach screenshot or file">
        <MaterialCommunityIcons name="paperclip" size={20} color="rgba(0, 0, 0, 0.65)" />
        <View style={styles.attachCopyCol}>
          <Text style={styles.attachTitle}>Attach screenshot or file</Text>
          <Text style={styles.attachSub}>PNG, JPG, PDF • up to 5 files • 25MB max</Text>
        </View>
      </Pressable>
    </View>
  );
}

function DashedThumbWrap({
  width,
  height,
  borderRadius,
  children,
}: {
  width: number;
  height: number;
  borderRadius: number;
  children: ReactNode;
}) {
  const [w, setW] = useState(0);
  return (
    <View
      style={{ width, height, position: 'relative', alignItems: 'center', justifyContent: 'center' }}
      onLayout={(e) => setW(Math.ceil(e.nativeEvent.layout.width))}>
      {w > 0 ? <DashedFrame width={w} height={height} borderRadius={borderRadius} /> : null}
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>{children}</View>
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
    paddingHorizontal: H_PAD,
    paddingTop: 8,
  },
  intro: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
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
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    marginBottom: LABEL_FIELD_GAP,
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
    minHeight: MESSAGE_BOX_H - 20,
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
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  attachSub: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 16.5,
  },
  attachThumbsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbBox68: { width: 68, height: 74 },
  thumbBox74: { width: 74, height: 74 },
  thumbBox72: { width: 72, height: 72 },
  docIconPlate: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    height: 48,
    borderRadius: 4,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: -0.35,
  },
});
