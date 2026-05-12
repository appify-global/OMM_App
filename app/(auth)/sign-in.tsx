import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { OAuthProviderCircles } from '@/components/oauth/OAuthProviderCircles';
import { setAuthenticated } from '@/lib/auth-session';
import { layout } from '@/constants/theme';
import { FIELD_OUTLINE_COLOR } from '@/lib/field-outline';

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = async () => {
    // TODO: wire Clerk / API auth — session flag gates (tabs) until then
    await setAuthenticated();
    router.replace('/(tabs)');
  };

  const onOAuthContinue = async () => {
    // TODO: wire Google / Microsoft OAuth
    await setAuthenticated();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: layout.authGutter, paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View>
          <Image
            source={require('@/assets/images/match-logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="MATCH"
          />

          <View style={styles.headlineBlock}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in with your OMM agent account.</Text>
          </View>

          <Text style={styles.label}>WORK EMAIL</Text>
          <View style={[styles.inputShell, styles.inputShellEmail]}>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="you@company.com"
              placeholderTextColor="rgba(0, 0, 0, 0.45)"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputShell}>
            <TextInput
              style={[styles.input, styles.inputWithRight]}
              secureTextEntry={!showPassword}
              autoComplete="password"
              placeholder="StrongPass123"
              placeholderTextColor="rgba(0, 0, 0, 0.45)"
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              style={styles.eyeBtn}
              onPress={() => setShowPassword((s) => !s)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
              <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={16} color="#000000" />
            </Pressable>
          </View>

          <View style={styles.rowBetween}>
            <Pressable
              style={styles.rememberRow}
              onPress={() => setRememberMe((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxOn]}>
                {rememberMe ? <FontAwesome name="check" size={11} color="#000000" /> : null}
              </View>
              <Text style={styles.rememberLabel}>Remember me</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8} accessibilityRole="link">
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomBlock}>
          <AppButton variant="filled" disabled={!email || !password} onPress={onSubmit}>
            Login
          </AppButton>

          <View style={styles.oauthWrap}>
            <OAuthProviderCircles
              onGooglePress={onOAuthContinue}
              onMicrosoftPress={onOAuthContinue}
              googleAccessibilityLabel="Sign in with Google"
              microsoftAccessibilityLabel="Sign in with Microsoft"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerMuted}>{"Don't have an account?"}</Text>
            <Link href="/sign-up" asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.footerBold}>Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  logo: {
    width: 220,
    height: 50,
    alignSelf: 'center',
    marginBottom: 34,
  },
  headlineBlock: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 349,
    gap: 10,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Satoshi-Medium',
    color: '#0a0a0a',
    textAlign: 'center',
    width: '100%',
    letterSpacing: -0.6,
    lineHeight: 28.8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(26,26,26,0.72)',
    textAlign: 'center',
    width: '100%',
    letterSpacing: -0.35,
    lineHeight: 17,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.72)',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 9,
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  inputShell: { position: 'relative', marginBottom: 0 },
  /** Figma: ~20px below work email field before PASSWORD label */
  inputShellEmail: { marginBottom: 20 },
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
    letterSpacing: 0.14,
  },
  inputWithRight: { paddingRight: 44 },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 13,
    height: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxOn: { backgroundColor: '#ffffff' },
  rememberLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 20,
  },
  forgotLink: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 20,
  },
  bottomBlock: {
    width: '100%',
    paddingTop: 8,
  },
  oauthWrap: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
    flexWrap: 'wrap',
    gap: 6,
  },
  footerMuted: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: 'rgba(26,26,26,0.96)', lineHeight: 23 },
  footerBold: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#000000', lineHeight: 23 },
});
