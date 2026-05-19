import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text } from '@/components/OMMText';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, frost, ink, inkMuted, layout, palette, controlRadius } from '@/constants/theme';
import { useTabScreenBottomPad } from '@/lib/useTabScreenBottomPad';

import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

/** [Figma Property Listing](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-4465) */
export const PL_PAD = layout.listingWizardGutter;
export const PL_BORDER = 'rgba(0, 0, 0, 0.55)';
export const PL_FIELD_BORDER = FIELD_OUTLINE_COLOR;
export const PL_LABEL = 'rgba(0, 0, 0, 0.55)';
export const PL_TITLE = 'rgba(0, 0, 0, 0.72)';
export const PL_BODY = '#000000';
export const PL_MUTED = 'rgba(0, 0, 0, 0.55)';
export const PL_CARD = '#000000';
/** Primary filled actions in the listing wizard (Continue, Publish, modal primaries). */
export const PL_CTA = accent;

/** Padding below fixed CTAs so content clears the floating tab pill. */
export function useListingFlowBottomPad() {
  return useTabScreenBottomPad();
}

/** Solid hairline outline for wizard fields/cards — Apple-like, not dashed. */
export const fieldShell = {
  borderWidth: FIELD_OUTLINE_WIDTH,
  borderColor: FIELD_OUTLINE_COLOR,
  borderStyle: 'solid' as const,
  backgroundColor: palette.white,
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

export function PrimaryCta({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.cta, disabled && styles.ctaDisabled]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}>
      <Text style={[styles.ctaLabel, disabled && styles.ctaLabelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    width: '100%',
    backgroundColor: frost,
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
    fontFamily: 'Satoshi-Medium',
    color: '#141414',
    textAlign: 'center',
    width: '100%',
  },
  saveDraft: { fontSize: 11, fontFamily: 'Satoshi-Medium', color: '#000', textAlign: 'right' },
  cta: {
    height: 48,
    borderRadius: controlRadius.listingCta,
    backgroundColor: PL_CTA,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: PL_PAD,
  },
  ctaLabel: { color: ink, fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: -0.35 },
  ctaDisabled: { backgroundColor: 'rgba(56, 189, 248, 0.42)' },
  ctaLabelDisabled: { color: inkMuted },
});
