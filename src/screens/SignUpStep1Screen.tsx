import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { useSignUp } from '../context/SignUpContext';
import { LabeledInput } from '../components/LabeledInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { LegalModal } from '../components/LegalModal';
import { PRIVACY_BODY, REFERRAL_BODY, TERMS_BODY } from '../copy/legal';
import { colors, radii, spacing } from '../theme/theme';

type Props = RootStackScreenProps<'SignUp1'>;

type LegalKind = 'terms' | 'privacy' | 'referral' | null;

export function SignUpStep1Screen({ navigation }: Props) {
  const { data, setField } = useSignUp();
  const [secure, setSecure] = useState(true);
  const [legal, setLegal] = useState<LegalKind>(null);

  const MIN_PASSWORD_LEN = 8;

  const canSubmit = useMemo(() => {
    return (
      data.firstName.trim().length > 0 &&
      data.lastName.trim().length > 0 &&
      data.email.includes('@') &&
      data.phone.trim().length > 0 &&
      data.password.length >= MIN_PASSWORD_LEN &&
      data.agreedTerms &&
      data.agreedReferral
    );
  }, [data]);

  const passwordTooShort =
    data.password.length > 0 && data.password.length < MIN_PASSWORD_LEN;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={['top']} style={styles.safeTop}>
          <Text style={styles.step}>STEP 01</Text>
          <Text style={styles.title}>Create your account</Text>

          <LabeledInput
            label="First name"
            required
            value={data.firstName}
            onChangeText={(t) => setField('firstName', t)}
            autoCapitalize="words"
            placeholder="John"
          />
          <LabeledInput
            label="Last name"
            required
            value={data.lastName}
            onChangeText={(t) => setField('lastName', t)}
            autoCapitalize="words"
            placeholder="Lim"
          />
          <LabeledInput
            label="Email address"
            required
            value={data.email}
            onChangeText={(t) => setField('email', t)}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="john.lim@azrealestate.com.au"
          />
          <LabeledInput
            label="Phone number"
            required
            value={data.phone}
            onChangeText={(t) => setField('phone', t)}
            keyboardType="phone-pad"
            placeholder="+61 436 815 589"
          />

          <View style={styles.passwordWrap}>
            <Text style={styles.label}>
              PASSWORD<Text style={styles.star}> *</Text>
            </Text>
            <View
              style={[
                styles.passwordField,
                passwordTooShort && styles.passwordFieldError,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                value={data.password}
                onChangeText={(t) => setField('password', t)}
                secureTextEntry={secure}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={secure ? 'Show password' : 'Hide password'}
                onPress={() => setSecure((s) => !s)}
                hitSlop={10}
              >
                <Ionicons
                  name={secure ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
            <Text
              style={[styles.passwordHint, passwordTooShort && styles.passwordHintError]}
            >
              {passwordTooShort
                ? `Add ${MIN_PASSWORD_LEN - data.password.length} more character${MIN_PASSWORD_LEN - data.password.length === 1 ? '' : 's'} (minimum ${MIN_PASSWORD_LEN}).`
                : `At least ${MIN_PASSWORD_LEN} characters.`}
            </Text>
          </View>

          <CheckboxRow
            checked={data.agreedTerms}
            onToggle={() => setField('agreedTerms', !data.agreedTerms)}
            onPressTerms={() => setLegal('terms')}
            onPressPrivacy={() => setLegal('privacy')}
          />

          <CheckboxRowReferral
            checked={data.agreedReferral}
            onToggle={() => setField('agreedReferral', !data.agreedReferral)}
            onPressAgreement={() => setLegal('referral')}
          />

          <PrimaryButton
            label="Sign Up"
            disabled={!canSubmit}
            accessibilityHint={
              canSubmit ? undefined : 'Complete all fields, 8 character password, and both agreements.'
            }
            onPress={() => navigation.navigate('SignUp2')}
          />

          <Pressable onPress={() => navigation.navigate('Login')} style={styles.center}>
            <Text style={styles.footerMuted}>
              Already have an account? <Text style={styles.footerStrong}>Sign in</Text>
            </Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('ContactSupport')} style={styles.center}>
            <Text style={styles.help}>
              Need help? <Text style={styles.helpLink}>Contact support</Text>
            </Text>
          </Pressable>
        </SafeAreaView>
      </ScrollView>

      <LegalModal
        visible={legal === 'terms'}
        title="Terms of Service"
        body={TERMS_BODY}
        onClose={() => setLegal(null)}
      />
      <LegalModal
        visible={legal === 'privacy'}
        title="Privacy Policy"
        body={PRIVACY_BODY}
        onClose={() => setLegal(null)}
      />
      <LegalModal
        visible={legal === 'referral'}
        title="Agency Referral Agreement"
        body={REFERRAL_BODY}
        onClose={() => setLegal(null)}
      />
    </KeyboardAvoidingView>
  );
}

function CheckboxRow({
  checked,
  onToggle,
  onPressTerms,
  onPressPrivacy,
}: {
  checked: boolean;
  onToggle: () => void;
  onPressTerms: () => void;
  onPressPrivacy: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onToggle}
        style={styles.checkboxHit}
      >
        <View style={[styles.box, checked && styles.boxOn]}>
          {checked ? (
            <Ionicons name="checkmark" size={14} color="#fff" style={styles.checkIcon} />
          ) : null}
        </View>
      </Pressable>
      <Text style={styles.rowText}>
        I agree to the{' '}
        <Text style={styles.link} onPress={onPressTerms}>
          Terms of Service
        </Text>{' '}
        and{' '}
        <Text style={styles.link} onPress={onPressPrivacy}>
          Privacy Policy
        </Text>
      </Text>
    </View>
  );
}

function CheckboxRowReferral({
  checked,
  onToggle,
  onPressAgreement,
}: {
  checked: boolean;
  onToggle: () => void;
  onPressAgreement: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onToggle}
        style={styles.checkboxHit}
      >
        <View style={[styles.box, checked && styles.boxOn]}>
          {checked ? (
            <Ionicons name="checkmark" size={14} color="#fff" style={styles.checkIcon} />
          ) : null}
        </View>
      </Pressable>
      <Text style={styles.rowText}>
        I have read and accepted the{' '}
        <Text style={styles.link} onPress={onPressAgreement}>
          Agency Referral Agreement
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xxl },
  safeTop: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  step: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  passwordWrap: { marginBottom: spacing.lg },
  label: {
    fontSize: 11,
    letterSpacing: 0.6,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  star: { color: colors.destructive },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputSurface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  passwordFieldError: {
    borderColor: colors.destructive,
  },
  passwordHint: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textSecondary,
  },
  passwordHintError: {
    color: colors.destructive,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingRight: spacing.sm,
  },
  checkboxHit: { paddingVertical: 2, paddingRight: 4 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkIcon: { marginTop: -1 },
  rowText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  link: {
    color: colors.text,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  center: { alignItems: 'center', marginTop: spacing.sm },
  footerMuted: { fontSize: 14, color: colors.textSecondary },
  footerStrong: { color: colors.text, fontWeight: '700' },
  help: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.md },
  helpLink: { color: colors.primary, fontWeight: '600' },
});
