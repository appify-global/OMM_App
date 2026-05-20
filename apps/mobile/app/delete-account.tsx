import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type Href, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, ink, layout } from '@/constants/theme';
import { clearAuthenticated } from '@/lib/auth-session';

/**
 * Delete account - confirmation UI.
 * [Figma 1053:3364](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3364&t=2eZigRM0BwNtC5wd-4)
 */

const AFTER_INTRO = 20;
const BOX_R = 8;
const BTN_H = 48;
const STROKE = 'rgba(0, 0, 0, 0.45)';
const STROKE_W = 1.5;
const INTRO_GRAY = 'rgba(0, 0, 0, 0.72)';

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
      />
    </Svg>
  );
}

function DashedShell({ borderRadius, children, contentStyle }: { borderRadius: number; children: ReactNode; contentStyle?: object }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View
      style={styles.dashWrap}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ w: Math.ceil(width), h: Math.ceil(height) });
      }}>
      <DashedFrame width={size.w} height={size.h} borderRadius={borderRadius} />
      <View style={[styles.dashInner, contentStyle]}>{children}</View>
    </View>
  );
}

export default function DeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const performDelete = async () => {
    await clearAuthenticated();
    router.replace('/welcome' as Href);
  };

  const onDeletePress = () => {
    Alert.alert(
      'Delete account permanently?',
      'Your profile, drafts, and message history will be removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void performDelete() },
      ],
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        <Text style={styles.warning}>
          Deleting your account permanently removes your profile, drafts, and message history. This cannot be undone.
        </Text>

        <View style={{ height: AFTER_INTRO }} />

        <DashedShell borderRadius={BOX_R} contentStyle={styles.noteInner}>
          <Text style={styles.noteText}>Active listings must be closed or transferred before deletion.</Text>
        </DashedShell>

        <View style={{ flexGrow: 1, minHeight: 32 }} />

        <Pressable
          style={styles.deleteBtn}
          onPress={onDeletePress}
          accessibilityRole="button"
          accessibilityLabel="Delete account">
          {({ pressed }) => (
            <Text style={[styles.deleteBtnText, pressed && { opacity: 0.72 }]}>DELETE ACCOUNT</Text>
          )}
        </Pressable>

        <View style={{ height: 12 }} />

        <Pressable
          style={({ pressed }) => [pressed && { opacity: 0.88 }]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Cancel">
          <DashedShell borderRadius={BOX_R} contentStyle={styles.cancelInner}>
            <View style={[styles.cancelBtnInner, { minHeight: BTN_H }]}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </View>
          </DashedShell>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  navSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 27,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
  },
  warning: {
    fontSize: 14,
    fontWeight: '400',
    color: INTRO_GRAY,
    lineHeight: 21,
  },
  dashWrap: { position: 'relative', backgroundColor: '#fff' },
  dashInner: { backgroundColor: 'transparent' },
  noteInner: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  noteText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 21,
  },
  deleteBtn: {
    height: BTN_H,
    borderRadius: BOX_R,
    backgroundColor: accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: ink,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  cancelInner: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  cancelBtnInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
});
