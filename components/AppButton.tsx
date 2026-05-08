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
import { hapticLight } from '@/lib/haptics';

/**
 * Primary CTAs — height 48, **12px corners** everywhere (rectangular, not stadium pill).
 * [Figma flow e.g. 1053:8028](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-8028)
 */
export const APP_BUTTON_HEIGHT = 48;

/** Shared corner radius for filled, outlined, and dashed (Welcome Sign Up only). */
export const APP_BUTTON_RADIUS = 12;

export type AppButtonVariant = 'filled' | 'outlined' | 'dashed';

export type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  variant: AppButtonVariant;
  children: ReactNode;
  /**
   * When true, the button sizes to its label (no full-width). Use beside search fields,
   * toolbars, etc. Default is full width for stacked form CTAs.
   */
  shrink?: boolean;
  /** Applied to the outer wrapper (width, margins, maxWidth). */
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * - **filled**: solid #000000, white label (Login, Continue, CONTACT SELLER, …)
 * - **outlined**: white, solid 1px #000000 border (Back to Login, DOWNLOAD, …)
 * - **dashed**: Welcome **Sign Up** only — white, **dashed** border, soft shadow; same 12px radius as outlined.
 */
export function AppButton({
  variant,
  children,
  disabled,
  shrink,
  style,
  textStyle,
  accessibilityRole = 'button',
  onPressIn,
  ...rest
}: AppButtonProps) {
  const label = (
    <Text
      style={[
        styles.textBase,
        variant === 'filled' && styles.textFilled,
        variant === 'outlined' && styles.textOutlined,
        variant === 'dashed' && styles.textDashed,
        textStyle,
      ]}>
      {children}
    </Text>
  );

  const inner = (
    <Pressable
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled && Platform.OS === 'ios') {
          hapticLight();
        }
        onPressIn?.(e);
      }}
      android_ripple={{
        color:
          variant === 'filled' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.06)',
        borderless: false,
      }}
      style={({ pressed }) => [
        styles.inner,
        variant === 'filled' && styles.filled,
        variant === 'outlined' && styles.outlined,
        variant === 'dashed' && styles.dashedFace,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...rest}>
      {label}
    </Pressable>
  );

  const outerBase = shrink ? styles.outerShrink : styles.outer;
  if (variant === 'dashed') {
    return (
      <View style={[styles.dashedShadowHost, !shrink && styles.dashedShadowHostFullWidth, outerBase, style]}>
        {inner}
      </View>
    );
  }

  return <View style={[outerBase, style]}>{inner}</View>;
}

/** Vertical gap between stacked outlined + filled (Figma: 700 − 637 − 48 = 15). */
export const APP_BUTTON_STACK_GAP = 15;

const styles = StyleSheet.create({
  outer: {
    width: '100%',
  },
  outerShrink: {
    alignSelf: 'flex-start',
  },
  dashedShadowHost: {
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
  dashedShadowHostFullWidth: {
    width: '100%',
  },
  inner: {
    height: APP_BUTTON_HEIGHT,
    borderRadius: APP_BUTTON_RADIUS,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  dashedFace: {
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.45)',
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
  textDashed: {
    color: ink,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.986 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
