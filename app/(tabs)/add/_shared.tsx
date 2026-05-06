import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabScreenBottomPad } from '../_tabScreenPad';

/** [Figma Property Listing](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-4465) */
export const PL_PAD = 32;
export const PL_BORDER = 'rgba(60,60,67,0.55)';
export const PL_LABEL = 'rgba(60,60,67,0.55)';
export const PL_TITLE = '#444444';
export const PL_BODY = '#1a1a1a';
export const PL_MUTED = '#606060';
export const PL_CARD = '#1a1a1a';
export const PL_CTA = '#1c1c1e';

/** Padding below fixed CTAs so content clears the floating tab pill. */
export function useListingFlowBottomPad() {
  return useTabScreenBottomPad();
}

export const dashedShell = {
  borderWidth: 1.5,
  borderColor: PL_BORDER,
  borderStyle: 'dashed' as const,
  backgroundColor: '#fff',
};

const HEADER_SIDE = 82;

export function PublishStepHeader({
  step,
  onBack,
  onSaveDraft,
}: {
  step: 1 | 2 | 3 | 4 | 5;
  onBack: () => void;
  onSaveDraft: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerSlotStart}>
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.headerBack}>
            <FontAwesome name="chevron-left" size={18} color="#141414" />
          </Pressable>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStep} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
            STEP {step} OF 5
          </Text>
        </View>
        <View style={styles.headerSlotEnd}>
          <Pressable onPress={onSaveDraft} hitSlop={8} accessibilityRole="button" accessibilityLabel="Save draft">
            <Text style={styles.saveDraft} numberOfLines={1}>
              SAVE DRAFT
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function PrimaryCta({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.cta} accessibilityRole="button">
      <Text style={styles.ctaLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    width: '100%',
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PL_PAD,
    minHeight: 48,
    maxWidth: '100%',
  },
  headerSlotStart: {
    width: HEADER_SIDE,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 6,
  },
  headerSlotEnd: {
    width: HEADER_SIDE,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerBack: { width: 32, height: 32, justifyContent: 'center' },
  headerStep: {
    fontSize: 18,
    fontWeight: '600',
    color: '#141414',
    textAlign: 'center',
    width: '100%',
  },
  saveDraft: { fontSize: 11, fontWeight: '500', color: '#000', textAlign: 'right' },
  cta: {
    height: 48,
    borderRadius: 14,
    backgroundColor: PL_CTA,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: PL_PAD,
    borderWidth: 1.5,
    borderColor: PL_BORDER,
    borderStyle: 'dashed',
  },
  ctaLabel: { color: '#fff', fontSize: 14, fontWeight: '500', letterSpacing: -0.35 },
});
