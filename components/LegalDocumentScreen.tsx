import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/theme';

/**
 * Shared legal document layout — scrollable body (Terms, Privacy, Guidelines).
 */

const BOX_R = 8;
const STROKE = 'rgba(0, 0, 0, 0.45)';
const STROKE_W = 1.5;
const BODY_COLOR = 'rgba(0, 0, 0, 0.72)';

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

export type LegalDocumentScreenProps = {
  title: string;
  body: string;
};

export function LegalDocumentScreen({ title, body }: LegalDocumentScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>{title}</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <DashedShell borderRadius={BOX_R} contentStyle={styles.docInner}>
          <Text style={styles.body}>{body}</Text>
        </DashedShell>
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
  scroll: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 8,
  },
  dashWrap: { position: 'relative', backgroundColor: '#fff' },
  dashInner: { backgroundColor: 'transparent' },
  docInner: {
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: BODY_COLOR,
    lineHeight: 21,
    textAlign: 'left',
  },
});
