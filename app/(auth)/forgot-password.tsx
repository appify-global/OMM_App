import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppButton,
  APP_BUTTON_STACK_GAP,
} from '@/components/AppButton';

const PAD_H = 32;

type Step = 1 | 2 | 3 | 4 | 5;

function OtpRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<RNTextInput>(null);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  return (
    <Pressable onPress={() => ref.current?.focus()} style={styles.otpWrap} accessibilityRole="none">
      <View style={styles.otpBoxes} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.otpCell}>
            <Text style={styles.otpDigit}>{digits[i]?.trim() ? digits[i] : ''}</Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.otpInputOverlay}
        caretHidden
        importantForAutofill="no"
      />
    </Pressable>
  );
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [smsOtp, setSmsOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strengthHint = useMemo(() => {
    const p = password;
    if (!p) return '12 characters · upper, lower, number & symbol';
    const len = p.length >= 12;
    const upper = /[A-Z]/.test(p);
    const lower = /[a-z]/.test(p);
    const num = /\d/.test(p);
    const sym = /[^A-Za-z0-9]/.test(p);
    const score = [len, upper, lower, num, sym].filter(Boolean).length;
    const label = score >= 5 ? 'strong' : score >= 3 ? 'medium' : 'weak';
    return `${p.length} characters · upper, lower, number & symbol · strength: ${label}`;
  }, [password]);

  const passwordOk =
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password) &&
    password === confirmPassword;

  const goLogin = () => router.replace('/sign-in');

  const canContinue =
    step === 1
      ? !!email.trim()
      : step === 2
        ? !!phone.trim()
        : step === 3
          ? emailOtp.length === 6
          : step === 4
            ? smsOtp.length === 6
            : passwordOk;

  const onContinue = () => {
    if (!canContinue) return;
    if (step === 1) setStep(3);
    else if (step === 2) setStep(4);
    else if (step === 3 || step === 4) setStep(5);
    else if (step === 5) goLogin();
  };

  const titleBody = (() => {
    switch (step) {
      case 1:
        return {
          title: 'Reset your password',
          body: 'Enter the email of your OMM account. We will send a 6-digit code, valid 10 minutes, to verify it is you.',
        };
      case 2:
        return {
          title: 'Verify with mobile',
          body: '',
        };
      case 3:
        return {
          title: 'Enter the email code',
          body: `Sent to ${email.trim() || 'your email'}. Check spam/junk. Code expires in 09:12. Still nothing? Resend after the timer.`,
        };
      case 4:
        return {
          title: 'Enter the SMS code',
          body: `Sent to +61 *** *** 15 589. Didn't arrive? Wait 0:42 to resend or switch to email verification.`,
        };
      default:
        return {
          title: 'Create a new password',
          body: 'Choose something you have not used on OMM before. 12+ characters with upper, lower, number & symbol.',
        };
    }
  })();

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: PAD_H,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>{titleBody.title}</Text>
          {step === 2 ? (
            <Text style={styles.screenBody}>
              We will SMS a code to the number on file ending in -78. Carrier rates may apply. Not you?{' '}
              <Text style={styles.inlineLink} onPress={() => setStep(1)}>
                Use email instead
              </Text>
              .
            </Text>
          ) : (
            <Text style={styles.screenBody}>{titleBody.body}</Text>
          )}
        </View>

        {step === 1 ? (
          <>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="you@example.com"
              placeholderTextColor="rgba(0, 0, 0, 0.45)"
            />
            <Pressable style={styles.altLinkWrap} onPress={() => setStep(2)} hitSlop={8}>
              <Text style={styles.altLink}>Verify with phone</Text>
            </Pressable>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="+61 4xx xxx xxx"
              placeholderTextColor="rgba(0, 0, 0, 0.45)"
            />
            <Pressable style={styles.altLinkWrap} onPress={() => setStep(1)} hitSlop={8}>
              <Text style={styles.altLink}>Verify with email</Text>
            </Pressable>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <OtpRow value={emailOtp} onChange={setEmailOtp} />
            <View style={styles.otpLinks}>
              <View style={styles.otpLinkRow}>
                <Text style={styles.otpLinkMuted}>Didn&apos;t get the email? </Text>
                <Text style={styles.otpLinkBold} onPress={() => {}}>
                  Resend OTP
                </Text>
              </View>
              <Pressable onPress={() => setStep(2)}>
                <Text style={styles.otpLinkCenter}>or Verify with phone</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <OtpRow value={smsOtp} onChange={setSmsOtp} />
            <View style={styles.otpLinks}>
              <View style={styles.otpLinkRow}>
                <Text style={styles.otpLinkMuted}>Didn&apos;t get the message? </Text>
                <Text style={styles.otpLinkBold} onPress={() => {}}>
                  Resend OTP
                </Text>
              </View>
              <Pressable onPress={() => setStep(1)}>
                <Text style={styles.otpLinkCenter}>or Verify with email</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <Text style={styles.fieldLabel}>NEW PASSWORD</Text>
            <View style={styles.inputShell}>
              <TextInput
                style={[styles.input, styles.inputWithRight]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                placeholder="Password"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowPassword((s) => !s)}
                hitSlop={8}>
                <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={16} color="#000000" />
              </Pressable>
            </View>
            <Text style={styles.strengthLine}>{strengthHint}</Text>

            <Text style={[styles.fieldLabel, styles.confirmLabel]}>CONFIRM PASSWORD</Text>
            <View style={styles.inputShell}>
              <TextInput
                style={[styles.input, styles.inputWithRight]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoComplete="password-new"
                placeholder="Password"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowConfirm((s) => !s)}
                hitSlop={8}>
                <FontAwesome name={showConfirm ? 'eye' : 'eye-slash'} size={16} color="#000000" />
              </Pressable>
            </View>
          </>
        ) : null}

        <View style={styles.buttonStack}>
          {step < 5 ? (
            <AppButton variant="outlined" onPress={goLogin}>
              Back to Login
            </AppButton>
          ) : null}
          <AppButton
            variant="filled"
            style={step < 5 ? { marginTop: APP_BUTTON_STACK_GAP } : undefined}
            disabled={!canContinue}
            onPress={onContinue}>
            Continue
          </AppButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const OTP_CELL = 51;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingTop: 20 },
  headerBlock: { marginBottom: 24 },
  screenTitle: {
    fontSize: 22,
    fontFamily: 'Satoshi-Medium',
    color: '#0a0a0a',
    marginBottom: 12,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  screenBody: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(26,26,26,0.72)',
    lineHeight: 20,
  },
  inlineLink: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    textDecorationLine: 'underline',
  },
  fieldLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.72)',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  confirmLabel: { marginTop: 20 },
  inputShell: { position: 'relative', marginBottom: 0 },
  input: {
    height: 54,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(26,26,26,0.96)',
    backgroundColor: 'rgba(255,255,255,0.96)',
    marginBottom: 12,
  },
  inputWithRight: { paddingRight: 44, marginBottom: 8 },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  strengthLine: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.75)',
    marginBottom: 8,
    marginTop: 4,
    lineHeight: 17,
  },
  altLinkWrap: { alignItems: 'center', marginTop: 8, marginBottom: 28 },
  altLink: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    textDecorationLine: 'underline',
  },
  otpWrap: { marginBottom: 20, alignItems: 'center', minHeight: 52, position: 'relative' },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 318,
    gap: 10,
  },
  otpCell: {
    flex: 1,
    maxWidth: OTP_CELL,
    height: 52,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 8,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  otpDigit: {
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  otpInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02,
    color: 'transparent',
  },
  otpLinks: { gap: 8, marginBottom: 28, alignItems: 'center' },
  otpLinkRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  otpLinkMuted: { fontSize: 14, color: 'rgba(0, 0, 0, 0.85)' },
  otpLinkBold: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#000000', textDecorationLine: 'underline' },
  otpLinkCenter: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    textDecorationLine: 'underline',
  },
  buttonStack: {
    marginTop: 24,
  },
});
