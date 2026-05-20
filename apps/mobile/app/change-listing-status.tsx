import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, layout } from '@/constants/theme';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

/**
 * Change listing status - option cards + radio.
 * [Figma 1053:9353](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-9353&t=2eZigRM0BwNtC5wd-4)
 */

const FIELD_RADIUS = 7;

const CARD_OUTLINE = {
  borderWidth: FIELD_OUTLINE_WIDTH,
  borderColor: FIELD_OUTLINE_COLOR,
  backgroundColor: '#fff',
};

type StatusId = 'live' | 'pending' | 'sold';

const OPTIONS: { id: StatusId; title: string; description: string }[] = [
  {
    id: 'live',
    title: 'Live',
    description: 'Live on marketplace • visible to buyers',
  },
  {
    id: 'pending',
    title: 'Pending',
    description: 'Under offer or contract in progress',
  },
  {
    id: 'sold',
    title: 'Sold',
    description: 'Remove from active search',
  },
];

function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={styles.radioOuter}>
      {selected ? <View style={styles.radioInner} /> : null}
    </View>
  );
}

export default function ChangeListingStatusScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [status, setStatus] = useState<StatusId>('live');

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.title}>Change status</Text>
        <Text style={styles.subtitle}>Select a new status for this listing.</Text>

        <View style={styles.options}>
          {OPTIONS.map((opt) => {
            const selected = status === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setStatus(opt.id)}
                style={[styles.optionCard, CARD_OUTLINE]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}>
                <Radio selected={selected} />
                <View style={styles.optionTextCol}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  <Text style={styles.optionDesc}>{opt.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={styles.updateBtn}
          onPress={() => router.back()}
          accessibilityRole="button">
          <Text style={styles.updateBtnText}>UPDATE STATUS</Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          style={styles.cancelWrap}
          accessibilityRole="button"
          accessibilityLabel="Cancel">
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: layout.screenGutter, paddingTop: 4 },
  title: {
    fontSize: 28,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 20,
    marginBottom: 24,
  },
  options: { gap: 12, marginBottom: 28 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: FIELD_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: accent,
  },
  optionTextCol: { flex: 1, minWidth: 0 },
  optionTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000', marginBottom: 6 },
  optionDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.55)',
    lineHeight: 19,
  },
  updateBtn: {
    backgroundColor: accent,
    height: 52,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.45,
  },
  cancelWrap: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  cancel: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)' },
});
