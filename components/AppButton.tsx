import type { ReactNode } from 'react';
import { Text } from '@/components/OMMText';
import {
  Platform,
  Pressable,
  type PressableProps,
  StyleSheet,
  type TextStyle,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Fonts, ink, palette } from '@/constants/theme';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

/**
 * Primary CTAs — default **48** height; **charcoal** variants use **14px** corners per Figma onboarding.
 * [Figma 1053:323 Sign Up](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-323)
 */
export const APP_BUTTON_HEIGHT = 48;

/** Shared corner radius for filled, outlined, and welcome secondary CTA variant. */
export const APP_BUTTON_RADIUS = 12;

/** Figma primary dark CTA (Sign Up / Continue) — not the same as pure `ink`. */
export const APP_BUTTON_CHARCOAL_RADIUS = 14;

export type AppButtonVariant = 'filled' | 'outlined' | 'hairline' | 'charcoal' | 'charcoalSoft';

export type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  variant: AppButtonVariant;
  children: ReactNode;
  /**
   * When true, the button sizes to its label (no full-width). Use beside search fields,
   * toolbars, etc. Default is full width for stacked form CTAs.
   */
  shrink?: boolean;
  /** Applied to the pressable / shadow host (width, margins, maxWidth). */
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * - **filled**: solid #000000, white label
 * - **outlined**: white, solid 1px #000000 border
 * - **hairline** (welcome secondary): white face, subtle hairline border + soft elevation — same tokens as form outlines.
 * - **charcoal**: Figma Sign Up / Continue — `#1C1C1E`, hairline border `rgba(60,60,67,0.14)`, 14px radius
 * - **charcoalSoft**: Figma modal CLOSE — `#2E2E2E`, 14px radius
 *
 * **iOS rendering note:** `Pressable` with a function-style prop can fail to paint backgrounds on
 * initial render (layout/hit-area is correct but the visual layer is blank). Fix: all static
 * background/border/radius styles live on a plain array; only the pressed overlay uses
 * children-as-function so it never affects the initial background paint.
 */
export function AppButton({
  variant,
  children,
  disabled,
  shrink,
  style,
  textStyle,
  accessibilityRole = 'button',
  ...rest
}: AppButtonProps) {
  const isCharcoalFamily = variant === 'charcoal' || variant === 'charcoalSoft';

  const label = (
    <Text
      style={[
        styles.textBase,
        variant === 'filled' && styles.textFilled,
        variant === 'outlined' && styles.textOutlined,
        variant === 'hairline' && styles.textHairline,
        variant === 'charcoal' && styles.textCharcoal,
        variant === 'charcoalSoft' && styles.textCharcoalSoft,
        textStyle,
      ]}>
      {children}
    </Text>
  );

  /** Static style — never a function. Fixes iOS Pressable invisible-background bug. */
  const staticStyle: StyleProp<ViewStyle> = [
    shrink ? styles.wrapShrink : styles.rowStretch,
    styles.inner,
    variant === 'filled' ? styles.filled : null,
    variant === 'outlined' ? styles.outlined : null,
    variant === 'hairline' ? styles.hairlineFace : null,
    isCharcoalFamily ? styles.innerCharcoal : null,
    variant === 'charcoal' ? (disabled ? styles.charcoalDisabled : styles.charcoal) : null,
    variant === 'charcoalSoft' ? (disabled ? styles.charcoalSoftDisabled : styles.charcoalSoft) : null,
    !isCharcoalFamily && disabled ? styles.disabled : null,
    style ?? null,
  ];

  if (variant === 'hairline') {
    return (
      <View
        style={[
          styles.hairlineShadowHost,
          shrink ? styles.wrapShrink : styles.rowStretch,
          shrink ? null : styles.hairlineShadowHostFullWidth,
          style,
        ]}>
        <Pressable
          accessibilityRole={accessibilityRole}
          disabled={disabled}
          style={styles.hairlinePressableFill}
          {...rest}>
          {({ pressed }) => (
            <>
              <View
                style={[
                  styles.hairlineFace,
                  styles.hairlinePressableFill,
                  pressed && !disabled && styles.pressedOverlay,
                ]}
                pointerEvents="none"
              />
              {label}
            </>
          )}
        </Pressable>
      </View>
    );
  }

  const overlayRadius =
    isCharcoalFamily ? APP_BUTTON_CHARCOAL_RADIUS : APP_BUTTON_RADIUS;

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      style={staticStyle}
      {...rest}>
      {({ pressed }) =>
        pressed && !disabled ? (
          <>
            {label}
            <View
              style={[
                styles.pressedOverlay,
                { borderRadius: overlayRadius },
              ]}
              pointerEvents="none"
            />
          </>
        ) : (
          label
        )
      }
    </Pressable>
  );
}

/** Vertical gap between stacked outlined + filled (Figma: 700 − 637 − 48 = 15). */
export const APP_BUTTON_STACK_GAP = 15;

const styles = StyleSheet.create({
  /**
   * Full-width in a vertical ScrollView: use as static style (never inside a function-style).
   */
  rowStretch: {
    alignSelf: 'stretch',
    width: '100%',
  },
  wrapShrink: {
    alignSelf: 'flex-start',
  },
  hairlineShadowHost: {
    borderRadius: APP_BUTTON_RADIUS,
    backgroundColor: palette.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  hairlineShadowHostFullWidth: {
    width: '100%',
  },
  hairlinePressableFill: {
    alignSelf: 'stretch',
    width: '100%',
  },
  inner: {
    minHeight: APP_BUTTON_HEIGHT,
    height: APP_BUTTON_HEIGHT,
    borderRadius: APP_BUTTON_RADIUS,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerCharcoal: {
    borderRadius: APP_BUTTON_CHARCOAL_RADIUS,
  },
  filled: {
    backgroundColor: ink,
  },
  outlined: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: ink,
  },
  hairlineFace: {
    backgroundColor: palette.white,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
    borderStyle: 'solid',
  },
  charcoal: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.14)',
  },
  charcoalSoft: {
    backgroundColor: '#2E2E2E',
  },
  /** Disabled charcoal CTAs stay clearly visible (no whole-control fade). */
  charcoalDisabled: {
    backgroundColor: '#4A4A4C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  charcoalSoftDisabled: {
    backgroundColor: '#5C5C5C',
  },
  /** Absolutely-positioned overlay that flashes on press — never affects initial background. */
  pressedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  disabled: {
    opacity: 0.55,
  },
  textBase: {
    fontSize: 14,
    letterSpacing: -0.14,
    fontFamily: Fonts.medium,
  },
  textFilled: {
    color: palette.white,
  },
  textOutlined: {
    color: ink,
  },
  textHairline: {
    color: ink,
  },
  textCharcoal: {
    color: palette.white,
  },
  textCharcoalSoft: {
    color: palette.white,
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
