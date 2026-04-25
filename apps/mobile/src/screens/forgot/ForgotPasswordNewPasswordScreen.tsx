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
import type { RootStackScreenProps } from '../../navigation/types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, radii, spacing } from '../../theme/theme';
import {
  meetsNewPasswordRules,
  passwordStrengthDescription,
} from '../../utils/passwordRules';

type Props = RootStackScreenProps<'ForgotPasswordNewPassword'>;

export function ForgotPasswordNewPasswordScreen({ navigation }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [secure1, setSecure1] = useState(true);
  const [secure2, setSecure2] = useState(true);

  const canContinue = useMemo(() => {
    return (
      meetsNewPasswordRules(password) && password.length > 0 && password === confirm && confirm.length > 0
    );
  }, [password, confirm]);

  const strengthLine = password ? passwordStrengthDescription(password) : '';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
          <Text style={styles.title}>Create a new password</Text>
          <Text style={styles.body}>
            Choose something you have not used on Unlisted before. 12+ characters with upper, lower,
            number & symbol.
          </Text>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              NEW PASSWORD<Text style={styles.star}> *</Text>
            </Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure1}
                placeholder="••••••••••••"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable onPress={() => setSecure1((s) => !s)} hitSlop={10}>
                <Ionicons
                  name={secure1 ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
            {strengthLine ? <Text style={styles.hint}>{strengthLine}</Text> : null}
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              CONFIRM PASSWORD<Text style={styles.star}> *</Text>
            </Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={secure2}
                placeholder="••••••••••••"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable onPress={() => setSecure2((s) => !s)} hitSlop={10}>
                <Ionicons
                  name={secure2 ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.spacer} />

          <PrimaryButton
            label="Continue"
            disabled={!canContinue}
            style={{ alignSelf: 'stretch' }}
            onPress={() => navigation.navigate('Login')}
          />
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
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  fieldBlock: { marginBottom: spacing.lg },
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
  hint: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  spacer: { flexGrow: 1, minHeight: spacing.xxl },
});
