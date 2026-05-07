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
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Account settings — profile fields + notifications + save.
 * [Figma 1053:2256](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-2256&t=2eZigRM0BwNtC5wd-4)
 */

const H_PAD = 20;
const FIELD_H = 54;
const STROKE = 'rgba(60,60,67,0.55)';
const STROKE_W = 1.5;
const DASH = '5 4';

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

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pushMessages, setPushMessages] = useState(true);

  const onSave = () => {
    Alert.alert('Saved', 'Your account settings were updated.');
  };

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
            <FontAwesome name="chevron-left" size={20} color="#1a1a1a" />
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
                autoCapitalize="characters"
                autoCorrect={false}
                placeholderTextColor="rgba(60,60,67,0.45)"
              />
            </DashedFieldShell>
          </View>

          <View style={styles.blockGap}>
            <Text style={styles.label10}>Email</Text>
            <DashedFieldShell height={FIELD_H} borderRadius={4}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                placeholderTextColor="rgba(60,60,67,0.45)"
              />
            </DashedFieldShell>
          </View>

          <View style={styles.blockGap}>
            <Text style={styles.label10}>Phone</Text>
            <DashedFieldShell height={FIELD_H} borderRadius={4}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                placeholder="Phone"
                keyboardType="phone-pad"
                placeholderTextColor="rgba(60,60,67,0.45)"
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
                    onValueChange={setPushMessages}
                    trackColor={{ false: '#e8e8e8', true: '#1a1a1a' }}
                    thumbColor="#fff"
                    ios_backgroundColor="#e8e8e8"
                    accessibilityLabel="Push notifications for messages"
                  />
                </View>
              </View>
            </DashedFieldShell>
          </View>

          <Pressable
            onPress={onSave}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.92 }]}
            accessibilityRole="button"
            accessibilityLabel="Save changes">
            <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
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
    backgroundColor: 'transparent',
  },
  navSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  scroll: {
    paddingHorizontal: H_PAD,
    paddingTop: 8,
  },
  blockGap: {
    marginBottom: 24,
  },
  label10: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(60,60,67,0.55)',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  label11: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(60,60,67,0.55)',
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
    color: '#1a1a1a',
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
    backgroundColor: '#1c1c1e',
    borderWidth: STROKE_W,
    borderColor: STROKE,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.35,
    textTransform: 'uppercase',
  },
});
