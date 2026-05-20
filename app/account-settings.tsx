import { useUser } from '@clerk/expo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
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
  Switch,
  View,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';
import { accent, ink, layout } from '@/constants/theme';
import { usePushPrefs } from '@/lib/push-preferences-context';

/**
 * Account settings — profile fields + notifications + save.
 * [Figma 1053:2256](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-2256&t=2eZigRM0BwNtC5wd-4)
 */

const FIELD_H = 54;
const STROKE = FIELD_OUTLINE_COLOR;
const STROKE_W = FIELD_OUTLINE_WIDTH;

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

/** Display name for the form: full name, or first + last, or derived from email. */
function displayNameFromSessionUser(user: NonNullable<ReturnType<typeof useUser>['user']>): string {
  const full = user.fullName?.trim();
  if (full) return full;
  const pair = `${user.firstName?.trim() ?? ''} ${user.lastName?.trim() ?? ''}`.trim();
  if (pair) return pair;
  const email = user.primaryEmailAddress?.emailAddress;
  if (email) {
    const local = email.split('@')[0]?.replace(/[._]/g, ' ').trim();
    if (local) return local.replace(/\b\w/g, (c) => c.toUpperCase());
    return email;
  }
  return '';
}

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { pushMessages, pushPrefsHydrated, setPushMessagesEnabled } = usePushPrefs();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setHydrated(true);
      return;
    }
    setDisplayName(displayNameFromSessionUser(user));
    setEmail(user.primaryEmailAddress?.emailAddress ?? '');
    setPhone(user.primaryPhoneNumber?.phoneNumber ?? '');
    setHydrated(true);
  }, [isLoaded, user]);

  const onSave = async () => {
    if (!user) {
      Alert.alert('Not signed in', 'Sign in again to update your account.');
      return;
    }
    setSaving(true);
    try {
      const trimmed = displayName.trim();
      const parts = trimmed.split(/\s+/).filter(Boolean);
      const firstName = parts[0] ?? '';
      const lastName = parts.slice(1).join(' ');
      await user.update({ firstName, lastName });
      Alert.alert('Saved', 'Your display name was updated.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not save changes.';
      Alert.alert('Could not save', message);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !hydrated || !pushPrefsHydrated) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color="#000000" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.muted}>Sign in to view account settings.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <View style={styles.navBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.navSide}>
            <FontAwesome name="chevron-left" size={20} color="#000000" />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>Account settings</Text>
          </View>
          <View style={styles.navSide} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 32 },
          ]}>
          <View style={styles.blockGap}>
            <Text style={styles.label10}>Display Name</Text>
            <DashedFieldShell height={FIELD_H} borderRadius={4}>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                style={styles.input}
                placeholder="Display name"
                autoCapitalize="words"
                autoCorrect={false}
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                editable={!saving}
              />
            </DashedFieldShell>
          </View>

          <View style={styles.blockGap}>
            <Text style={styles.label10}>Email</Text>
            <Text style={styles.helperMuted}>
              We show the email on your account. To change it, contact support or your agency admin — updates require a
              verification step.
            </Text>
            <DashedFieldShell height={FIELD_H} borderRadius={4}>
              <TextInput
                value={email}
                style={[styles.input, styles.inputReadOnly]}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                editable={false}
                selectTextOnFocus={false}
              />
            </DashedFieldShell>
          </View>

          <View style={styles.blockGap}>
            <Text style={styles.label10}>Phone</Text>
            <Text style={styles.helperMuted}>
              We show the mobile number on your account if one is on file. Contact support to add or update it.
            </Text>
            <DashedFieldShell height={FIELD_H} borderRadius={4}>
              <TextInput
                value={phone}
                style={[styles.input, styles.inputReadOnly]}
                placeholder="No phone on file"
                keyboardType="phone-pad"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                editable={false}
                selectTextOnFocus={false}
              />
            </DashedFieldShell>
          </View>

          <View style={styles.notifBlock}>
            <Text style={styles.label11}>Notifications</Text>
            <DashedFieldShell height={56} borderRadius={8}>
              <View style={styles.notifRow}>
                <Text style={styles.notifCopy} numberOfLines={1} ellipsizeMode="tail">
                  Push notifications for messages
                </Text>
                <View style={styles.switchWrap}>
                  <Switch
                    value={pushMessages}
                    onValueChange={(v) => void setPushMessagesEnabled(v)}
                    trackColor={{ false: '#e8e8e8', true: '#000000' }}
                    thumbColor="#fff"
                    ios_backgroundColor="#e8e8e8"
                    accessibilityLabel="Push notifications for messages"
                  />
                </View>
              </View>
            </DashedFieldShell>
          </View>

          <Pressable
            onPress={() => void onSave()}
            disabled={saving}
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Save changes">
            {({ pressed }) => (
              <Text style={[styles.saveBtnText, (pressed || saving) && { opacity: 0.72 }]}>
                {saving ? 'SAVING…' : 'SAVE CHANGES'}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  muted: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0,0,0,0.55)',
    paddingHorizontal: layout.screenGutter,
    textAlign: 'center',
  },
  flex: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  navSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  scroll: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
  },
  blockGap: {
    marginBottom: 24,
  },
  helperMuted: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    lineHeight: 17,
    marginBottom: 8,
  },
  label10: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  label11: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
    letterSpacing: 0.275,
    textTransform: 'uppercase',
    marginBottom: 12,
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
  inputReadOnly: {
    color: 'rgba(0, 0, 0, 0.72)',
  },
  notifBlock: {
    marginBottom: 24,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    width: '100%',
  },
  notifCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
    fontSize: 13,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 19.5,
  },
  switchWrap: {
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.65,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: ink,
    letterSpacing: -0.35,
    textTransform: 'uppercase',
  },
});
