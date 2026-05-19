import { useSignIn } from '@clerk/expo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, APP_BUTTON_STACK_GAP } from '@/components/AppButton';
import { layout } from '@/constants/theme';
import { clerkFieldError, clerkFinalizeNavigate } from '@/lib/clerk-auth';
import { FIELD_OUTLINE_COLOR } from '@/lib/field-outline';
import { isPermittedWorkEmail, workEmailValidationMessage } from '@/lib/work-email';

type Step = 1 | 2 | 3 | 4 | 5;
type Channel = 'email' | 'phone';

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
  const { signIn, errors, fetchStatus } = useSignIn();

  const [step, setStep] = useState<Step>(1);
  const [channel, setChannel] = useState<Channel>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [smsOtp, setSmsOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const busy = fetchStatus === 'fetching';

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

  const switchChannel = async (next: Channel) => {
    setSubmitError(null);
    try {
      await signIn.reset();
    } catch {
      /* no active attempt */
    }
    setChannel(next);
    setEmailOtp('');
    setSmsOtp('');
    setStep(next === 'email' ? 1 : 2);
  };

  const sendEmailCode = async () => {
    setSubmitError(null);
    const workErr = workEmailValidationMessage(email);
    if (workErr) {
      setSubmitError(workErr);
      return;
    }

    const { error: createError } = await signIn.create({
      identifier: email.trim(),
    });
    if (createError) {
      setSubmitError(
        createError.message ??
          'We could not find an account with that email. Sign up first or check the address.',
      );
      return;
    }

    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      setSubmitError(sendError.message ?? 'Could not send the reset code. Try again in a moment.');
      return;
    }

    setChannel('email');
    setStep(3);
  };

  const sendPhoneCode = async () => {
    setSubmitError(null);
    const identifier = phone.trim();
    if (!identifier) {
      setSubmitError('Enter the phone number on your OMM account.');
      return;
    }

    const { error: createError } = await signIn.create({ identifier });
    if (createError) {
      setSubmitError(
        createError.message ??
          'We could not find an account with that phone number. Try email instead.',
      );
      return;
    }

    const { error: sendError } = await signIn.resetPasswordPhoneCode.sendCode();
    if (sendError) {
      setSubmitError(
        sendError.message ??
          'Could not send the SMS code. Your account may not have a phone number on file — use email instead.',
      );
      return;
    }

    setChannel('phone');
    setStep(4);
  };

  const verifyEmailCode = async () => {
    setSubmitError(null);
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code: emailOtp });
    if (error) {
      setSubmitError(error.message ?? 'That code is invalid or expired.');
      return;
    }
    if (signIn.status === 'needs_new_password') {
      setStep(5);
    } else {
      setSubmitError('Verification incomplete. Request a new code and try again.');
    }
  };

  const verifyPhoneCode = async () => {
    setSubmitError(null);
    const { error } = await signIn.resetPasswordPhoneCode.verifyCode({ code: smsOtp });
    if (error) {
      setSubmitError(error.message ?? 'That code is invalid or expired.');
      return;
    }
    if (signIn.status === 'needs_new_password') {
      setStep(5);
    } else {
      setSubmitError('Verification incomplete. Request a new code and try again.');
    }
  };

  const submitNewPassword = async () => {
    setSubmitError(null);
    const submit =
      channel === 'email'
        ? signIn.resetPasswordEmailCode.submitPassword.bind(signIn.resetPasswordEmailCode)
        : signIn.resetPasswordPhoneCode.submitPassword.bind(signIn.resetPasswordPhoneCode);

    const { error } = await submit({
      password,
      signOutOfOtherSessions: true,
    });
    if (error) {
      setSubmitError(error.message ?? 'Could not save your new password.');
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: (args) => clerkFinalizeNavigate(router, args, '/(tabs)'),
      });
      return;
    }

    setSubmitError('Password reset could not be completed. Try again.');
  };

  const resendEmailCode = async () => {
    setSubmitError(null);
    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (error) {
      setSubmitError(error.message ?? 'Could not resend the code.');
    }
  };

  const resendPhoneCode = async () => {
    setSubmitError(null);
    const { error } = await signIn.resetPasswordPhoneCode.sendCode();
    if (error) {
      setSubmitError(error.message ?? 'Could not resend the SMS code.');
    }
  };

  const canContinue =
    step === 1
      ? !!email.trim() && isPermittedWorkEmail(email) && !busy
      : step === 2
        ? !!phone.trim() && !busy
        : step === 3
          ? emailOtp.length === 6 && !busy
          : step === 4
            ? smsOtp.length === 6 && !busy
            : passwordOk && !busy;

  const onContinue = async () => {
    if (!canContinue) return;
    if (step === 1) await sendEmailCode();
    else if (step === 2) await sendPhoneCode();
    else if (step === 3) await verifyEmailCode();
    else if (step === 4) await verifyPhoneCode();
    else if (step === 5) await submitNewPassword();
  };

  const titleBody = (() => {
    switch (step) {
      case 1:
        return {
          title: 'Reset your password',
          body: 'Enter the work email on your OMM account. We will send a 6-digit code to verify it is you.',
        };
      case 2:
        return {
          title: 'Verify with mobile',
          body: '',
        };
      case 3:
        return {
          title: 'Enter the email code',
          body: `Sent to ${email.trim() || 'your email'}. Check spam/junk if you do not see it within a minute.`,
        };
      case 4:
        return {
          title: 'Enter the SMS code',
          body: `Sent to ${phone.trim() || 'your phone'}.`,
        };
      default:
        return {
          title: 'Create a new password',
          body: 'Choose something you have not used on OMM before. 12+ characters with upper, lower, number & symbol.',
        };
    }
  })();

  const clerkIdentifierError = clerkFieldError(errors, 'identifier');
  const clerkCodeError = clerkFieldError(errors, 'code');
  const clerkPasswordError = clerkFieldError(errors, 'password');

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: layout.authGutter,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>{titleBody.title}</Text>
          {step === 2 ? (
            <Text style={styles.screenBody}>
              We will SMS a code to the number you enter. Carrier rates may apply. Not you?{' '}
              <Text style={styles.inlineLink} onPress={() => void switchChannel('email')}>
                Use email instead
              </Text>
              .
            </Text>
          ) : (
            <Text style={styles.screenBody}>{titleBody.body}</Text>
          )}
        </View>

        {busy ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#000000" />
          </View>
        ) : null}

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
              placeholder="you@agency.com"
              placeholderTextColor="rgba(0, 0, 0, 0.45)"
              editable={!busy}
            />
            <Pressable style={styles.altLinkWrap} onPress={() => void switchChannel('phone')} hitSlop={8}>
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
              editable={!busy}
            />
            <Pressable style={styles.altLinkWrap} onPress={() => void switchChannel('email')} hitSlop={8}>
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
                <Text style={styles.otpLinkBold} onPress={() => void resendEmailCode()}>
                  Resend OTP
                </Text>
              </View>
              <Pressable onPress={() => void switchChannel('phone')}>
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
                <Text style={styles.otpLinkBold} onPress={() => void resendPhoneCode()}>
                  Resend OTP
                </Text>
              </View>
              <Pressable onPress={() => void switchChannel('email')}>
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
                editable={!busy}
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
                editable={!busy}
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

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
        {clerkIdentifierError ? <Text style={styles.submitError}>{clerkIdentifierError}</Text> : null}
        {clerkCodeError ? <Text style={styles.submitError}>{clerkCodeError}</Text> : null}
        {clerkPasswordError ? <Text style={styles.submitError}>{clerkPasswordError}</Text> : null}

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
  loadingRow: { alignItems: 'center', marginBottom: 12 },
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
    borderWidth: 1,
    borderColor: FIELD_OUTLINE_COLOR,
    borderRadius: 12,
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
  submitError: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#C62828',
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
    borderWidth: 1,
    borderColor: FIELD_OUTLINE_COLOR,
    borderRadius: 10,
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
