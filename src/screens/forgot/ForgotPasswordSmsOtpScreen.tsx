import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { OutlineButton } from '../../components/OutlineButton';
import { OtpBoxes } from '../../components/OtpBoxes';
import { colors, spacing } from '../../theme/theme';
import { formatCountdown } from '../../utils/formatCountdown';
import { maskPhoneForDisplay } from './maskPhone';

type Props = RootStackScreenProps<'ForgotPasswordSmsOtp'>;

export function ForgotPasswordSmsOtpScreen({ navigation, route }: Props) {
  const phone = route.params.phone;
  const masked = maskPhoneForDisplay(phone);
  const [code, setCode] = useState('');
  /** Design: 0:42 wait; __DEV__ 8s for faster QA. */
  const [resendSec, setResendSec] = useState(__DEV__ ? 8 : 42);

  useEffect(() => {
    const id = setInterval(() => {
      setResendSec((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const canContinue = code.length === 5;
  const canResend = resendSec === 0;

  const onResend = () => {
    if (!canResend) return;
    setResendSec(__DEV__ ? 8 : 60);
    setCode('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
          <Text style={styles.title}>Enter the SMS code</Text>
          <Text style={styles.body}>
            Sent to {masked}. Didn&apos;t arrive? Wait {formatCountdown(resendSec)} to resend or
            switch to email verification.
          </Text>

          <OtpBoxes value={code} onChange={setCode} />

          <Text style={styles.linkRow}>
            Didn&apos;t get the message?{' '}
            <Text
              style={[styles.linkBold, !canResend && styles.linkDisabled]}
              onPress={canResend ? onResend : undefined}
            >
              Resend OTP
            </Text>
          </Text>
          <Pressable
            onPress={() =>
              navigation.navigate('ForgotPasswordEmailOtp', {
                email: 'john.lim@azrealestate.com.au',
              })
            }
          >
            <Text style={styles.linkRow}>
              or <Text style={styles.linkBold}>Verify with email</Text>
            </Text>
          </Pressable>

          <View style={styles.spacer} />

          <View style={styles.actions}>
            <OutlineButton label="Back to Login" onPress={() => navigation.navigate('Login')} />
            <PrimaryButton
              label="Continue"
              disabled={!canContinue}
              style={{ alignSelf: 'stretch' }}
              onPress={() => navigation.navigate('ForgotPasswordNewPassword')}
            />
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  safe: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, flexGrow: 1 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  linkRow: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  linkBold: {
    color: colors.text,
    fontWeight: '700',
  },
  linkDisabled: {
    color: colors.textMuted,
  },
  spacer: { flexGrow: 1, minHeight: spacing.xl },
  actions: { gap: spacing.md, paddingBottom: spacing.xl, alignSelf: 'stretch' },
});
