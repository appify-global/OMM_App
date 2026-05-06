import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';

/** Figma: Log in — node 1053:760, horizontal inset 32px */
const PAD_H = 32;

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = () => {
    // TODO: wire Clerk / API auth
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
          { paddingHorizontal: PAD_H, paddingBottom: Math.max(insets.bottom, 16) + 24 },
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

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={[styles.inputShell, styles.inputShellEmail]}>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="you@example.com"
              placeholderTextColor="rgba(60,60,67,0.45)"
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
              placeholder="Password"
              placeholderTextColor="rgba(60,60,67,0.45)"
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              style={styles.eyeBtn}
              onPress={() => setShowPassword((s) => !s)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
              <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={16} color="#3c3c43" />
            </Pressable>
          </View>

          <View style={styles.rowBetween}>
            <Pressable
              style={styles.rememberRow}
              onPress={() => setRememberMe((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxOn]}>
                {rememberMe ? <FontAwesome name="check" size={11} color="#1c1c1e" /> : null}
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
    fontWeight: '600',
    color: '#0a0a0a',
    textAlign: 'center',
    width: '100%',
    letterSpacing: -0.6,
    lineHeight: 28.8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(26,26,26,0.72)',
    textAlign: 'center',
    width: '100%',
    letterSpacing: -0.35,
    lineHeight: 17,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(60,60,67,0.72)',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 9,
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  inputShell: { position: 'relative', marginBottom: 0 },
  /** Figma: ~20px below email field before PASSWORD label */
  inputShellEmail: { marginBottom: 20 },
  input: {
    height: 54,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(60,60,67,0.55)',
    borderRadius: 14,
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
    borderColor: 'rgba(60,60,67,0.55)',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxOn: { backgroundColor: '#f2f2f7' },
  rememberLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(60,60,67,0.65)',
    lineHeight: 20,
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1c1c1e',
    lineHeight: 20,
  },
  bottomBlock: {
    width: '100%',
    paddingTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
    flexWrap: 'wrap',
    gap: 6,
  },
  footerMuted: { fontSize: 14, fontWeight: '500', color: 'rgba(26,26,26,0.96)', lineHeight: 23 },
  footerBold: { fontSize: 14, fontWeight: '500', color: '#1c1c1e', lineHeight: 23 },
});
