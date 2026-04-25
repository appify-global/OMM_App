import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { colors, radii } from '../theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  /** Match Figma primary CTAs (e.g. Sign Up on step 2). */
  uppercase?: boolean;
  /** Softer terracotta + full-width feel for verification “Contact support”. */
  tone?: 'default' | 'verification';
  accessibilityHint?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  uppercase,
  tone = 'default',
  accessibilityHint,
  style,
  textStyle,
}: Props) {
  const isPrimary = variant === 'primary';
  const verification = isPrimary && tone === 'verification';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!(disabled || loading) }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        verification && styles.primaryVerification,
        verification && pressed && !disabled && !loading && styles.primaryVerificationPressed,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && !verification && styles.pressed,
        verification && styles.verificationWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : colors.text} />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary ? styles.labelPrimary : styles.labelSecondary,
            verification && styles.labelVerification,
            uppercase && styles.labelUppercase,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryVerification: {
    backgroundColor: colors.verificationCta,
    borderRadius: radii.lg,
    paddingVertical: 17,
  },
  primaryVerificationPressed: {
    backgroundColor: colors.verificationCtaPressed,
  },
  verificationWidth: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.black,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.92,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  labelPrimary: {
    color: '#FFFFFF',
  },
  labelVerification: {
    fontWeight: '500',
    fontSize: 16,
  },
  labelSecondary: {
    color: '#FFFFFF',
    letterSpacing: 1,
    fontSize: 14,
  },
  labelUppercase: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 15,
  },
});
