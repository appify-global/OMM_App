import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Text } from '@/components/OMMText';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/theme';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

/**
 * Shared legal document layout - scrollable body (Terms, Privacy, Guidelines).
 */

const BOX_R = 8;
const BODY_COLOR = 'rgba(0, 0, 0, 0.72)';

function DocShell({ borderRadius, children, contentStyle }: { borderRadius: number; children: ReactNode; contentStyle?: object }) {
  return (
    <View
      style={[
        styles.docShell,
        {
          borderRadius,
          borderWidth: FIELD_OUTLINE_WIDTH,
          borderColor: FIELD_OUTLINE_COLOR,
          borderStyle: 'solid',
        },
      ]}>
      <View style={[styles.docInner, contentStyle]}>{children}</View>
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
        <DocShell borderRadius={BOX_R} contentStyle={styles.docInnerPadding}>
          <Text style={styles.body}>{body}</Text>
        </DocShell>
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
  docShell: {
    width: '100%',
    backgroundColor: '#fff',
  },
  docInner: {
    backgroundColor: 'transparent',
  },
  docInnerPadding: {
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
