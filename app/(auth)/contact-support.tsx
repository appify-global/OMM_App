import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { useAuth } from '@clerk/expo';
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

import { accent, ink, layout, slateNavy } from '@/constants/theme';

/**
 * Contact support — ticket form + attachments. Solid fields (iOS-style).
 */

const FIELD_H = 54;
const MESSAGE_BOX_H = 150;
const BLOCK_GAP = 24;
const LABEL_FIELD_GAP = 8;
const ATTACH_MAIN_TO_THUMBS = 12;
const FIELD_FILL = '#F2F2F7';
const OUTLINE = 'rgba(60, 60, 67, 0.18)';
const BOX_R = 10;

function FieldShell({
  minHeight,
  multilineInner,
  children,
}: {
  minHeight: number;
  multilineInner?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={[styles.fieldShell, { minHeight }]}>
      <View style={[styles.fieldInner, multilineInner && styles.fieldInnerMultiline, { minHeight }]}>{children}</View>
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
  const { getToken } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const canSend = !!fullName.trim() && !!email.trim() && !!message.trim();

  const onSend = async () => {
    if (!canSend || sending) return;
    setSending(true);
    try {
      const result = await postJsonApi(
        '/api/support/contact',
        getToken,
        {
          source: 'mobile',
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim(),
        },
      );
      if (!result.ok) {
        const hint =
          result.error === 'server_misconfigured'
            ? 'Support email is not configured on the server yet.'
            : result.status === 503
              ? 'Support is temporarily unavailable. Try again later.'
              : 'Could not send your message. Please try again.';
        Alert.alert('Could not send', hint);
        return;
      }
      Alert.alert('Message sent', 'We will reply within one business day.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Could not send', 'Check your connection and try again.');
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
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.intro}>
            Include your agency and an OMM listing reference if the issue relates to a transaction (e.g. OMM-20418). We reply within one business day.
          </Text>

          <FieldBlock label="FULL NAME">
            <FieldShell minHeight={FIELD_H}>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                placeholder="Full name"
                autoCapitalize="words"
                autoCorrect={false}
                placeholderTextColor="rgba(60, 60, 67, 0.45)"
              />
            </FieldShell>
          </FieldBlock>

          <FieldBlock label="EMAIL">
            <FieldShell minHeight={FIELD_H}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="rgba(60, 60, 67, 0.45)"
              />
            </FieldShell>
          </FieldBlock>

          <FieldBlock label="PHONE">
            <FieldShell minHeight={FIELD_H}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                placeholder="Phone (optional)"
                keyboardType="phone-pad"
                placeholderTextColor="rgba(60, 60, 67, 0.45)"
              />
            </FieldShell>
          </FieldBlock>

          <FieldBlock label="YOUR MESSAGE">
            <FieldShell minHeight={MESSAGE_BOX_H} multilineInner>
              <TextInput
                value={message}
                onChangeText={setMessage}
                style={[styles.input, styles.inputMultiline]}
                placeholder="Your message"
                multiline
                textAlignVertical="top"
                placeholderTextColor="rgba(60, 60, 67, 0.45)"
              />
            </FieldShell>
          </FieldBlock>

          <View style={styles.attachSection}>
            <Text style={styles.label10}>ATTACHMENTS</Text>
            <AttachMainBox />
            <View style={{ height: ATTACH_MAIN_TO_THUMBS }} />
            <View style={styles.attachThumbsRow}>
              <Pressable
                onPress={() => Alert.alert('Attachments', 'Photo library would open here.')}
                style={styles.thumbSquare}
                accessibilityRole="button"
                accessibilityLabel="Add image">
                <View style={styles.thumbInner}>
                  <FontAwesome name="image" size={22} color="#000000" />
                </View>
              </Pressable>
              <Pressable
                onPress={() => Alert.alert('Attachments', 'Document picker would open here.')}
                style={styles.thumbSquare}
                accessibilityRole="button"
                accessibilityLabel="Add document">
                <View style={styles.thumbInner}>
                  <View style={styles.docIconPlate}>
                    <FontAwesome name="file-text-o" size={18} color="#fff" />
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => Alert.alert('Attachments', 'Add another file.')}
                style={styles.thumbSquare}
                accessibilityRole="button"
                accessibilityLabel="Add file">
                <View style={styles.thumbInner}>
                  <FontAwesome name="plus" size={20} color="#000000" />
                </View>
              </Pressable>
            </View>
          </View>

          <View style={{ height: 8 }} />

          <Pressable
            style={[styles.sendBtn, (!canSend || sending) && styles.sendBtnDisabled]}
            onPress={() => void onSend()}
            disabled={!canSend || sending}
            accessibilityRole="button"
            accessibilityLabel="Send message">
            {({ pressed }) => (
              <>
                {sending ? (
                  <ActivityIndicator color={ink} />
                ) : (
                  <Text style={styles.sendBtnText}>Send message</Text>
                )}
                {pressed && canSend && !sending ? (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12 }]} />
                ) : null}
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function AttachMainBox() {
  const H = 74;
  return (
    <View style={[styles.attachShell, { minHeight: H }]}>
      <Pressable
        onPress={() => Alert.alert('Attachments', 'File picker would open here.')}
        style={[styles.attachMainInner, { minHeight: H }]}
        accessibilityRole="button"
        accessibilityLabel="Attach screenshot or file">
        <MaterialCommunityIcons name="paperclip" size={20} color="rgba(0, 0, 0, 0.55)" />
        <View style={styles.attachCopyCol}>
          <Text style={styles.attachTitle}>Attach screenshot or file</Text>
          <Text style={styles.attachSub}>PNG, JPG, PDF • up to 5 files • 25MB max</Text>
        </View>
      </Pressable>
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
    color: 'rgba(60, 60, 67, 0.65)',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
  },
  fieldBlock: {
    marginBottom: BLOCK_GAP,
  },
  label10: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(60, 60, 67, 0.65)',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    marginBottom: LABEL_FIELD_GAP,
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
  fieldInnerMultiline: {
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
  inputMultiline: {
    minHeight: MESSAGE_BOX_H - 28,
    paddingTop: 4,
    paddingBottom: 4,
  },
  attachSection: {
    marginBottom: BLOCK_GAP,
  },
  attachShell: {
    width: '100%',
    borderRadius: BOX_R,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE,
    backgroundColor: FIELD_FILL,
    overflow: 'hidden',
  },
  attachMainInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },
  attachCopyCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  attachTitle: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  attachSub: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(60, 60, 67, 0.55)',
    lineHeight: 17,
  },
  attachThumbsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbSquare: { width: 74, height: 74 },
  thumbInner: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: FIELD_FILL,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconPlate: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: slateNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: ink,
    letterSpacing: -0.2,
  },
});
