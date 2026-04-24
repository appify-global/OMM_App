import React, { useState } from 'react';
import {
  Image,
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
import { LabeledInput } from '../components/LabeledInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radii, spacing } from '../theme/theme';

type Props = RootStackScreenProps<'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [remember, setRemember] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.sub}>Sign in with your OMM agent account.</Text>

          <LabeledInput
            label="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@agency.com.au"
          />

          <View style={styles.passwordWrap}>
            <Text style={styles.label}>
              PASSWORD<Text style={styles.star}> *</Text>
            </Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable onPress={() => setSecure((s) => !s)} hitSlop={10}>
                <Ionicons
                  name={secure ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.row}>
            <Pressable
              style={styles.remember}
              onPress={() => setRemember((r) => !r)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: remember }}
            >
              <View style={[styles.checkbox, remember && styles.checkboxOn]}>
                {remember ? (
                  <Ionicons name="checkmark" size={12} color="#fff" style={styles.checkIcon} />
                ) : null}
              </View>
              <Text style={styles.rememberLabel}>Remember me</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('ForgotPasswordEmail')}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>
          </View>

          <PrimaryButton label="Login" onPress={() => navigation.navigate('Home', {})} />

          <Pressable onPress={() => navigation.navigate('SignUp1')} style={styles.footer}>
            <Text style={styles.footerText}>
              {"Don't have an account? "}
              <Text style={styles.footerLink}>Sign up</Text>
            </Text>
          </Pressable>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  safe: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  logoWrap: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  logo: { width: 48, height: 48 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  sub: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  remember: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkIcon: { marginTop: -1 },
  rememberLabel: { fontSize: 14, color: colors.text },
  forgot: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: spacing.xl, paddingBottom: spacing.xl },
  footerText: { fontSize: 14, color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '700' },
});
