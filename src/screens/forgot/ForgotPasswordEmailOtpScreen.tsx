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

type Props = RootStackScreenProps<'ForgotPasswordEmailOtp'>;

/** Design: 9:12 (~552s). In __DEV__, 15s so you can test Resend without waiting. */
const INITIAL_EXPIRY_SEC = __DEV__ ? 15 : 9 * 60 + 12;

export function ForgotPasswordEmailOtpScreen({ navigation, route }: Props) {
  const email = route.params.email;
  const [code, setCode] = useState('');
  const [remainingSec, setRemainingSec] = useState(INITIAL_EXPIRY_SEC);

  useEffect(() => {
    const id = setInterval(() => {
      setRemainingSec((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const canContinue = code.length === 5;
  const canResend = remainingSec === 0;

  const onResend = () => {
    if (!canResend) return;
    setRemainingSec(INITIAL_EXPIRY_SEC);
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
          <Text style={styles.title}>Enter the email code</Text>
          <Text style={styles.body}>
            Sent to {email}. Check spam/junk. Code expires in {formatCountdown(remainingSec)}.
            Still nothing? Resend after the timer.
          </Text>

          <OtpBoxes value={code} onChange={setCode} />

          <Text style={styles.linkRow}>
            Didn&apos;t get the email?{' '}
            <Text
              style={[styles.linkBold, !canResend && styles.linkDisabled]}
              onPress={canResend ? onResend : undefined}
            >
              Resend OTP
            </Text>
          </Text>
          <Pressable onPress={() => navigation.navigate('ForgotPasswordSmsOtp', { phone: '+61 436 815 589' })}>
            <Text style={styles.linkRow}>
              or <Text style={styles.linkBold}>Verify with phone</Text>
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
