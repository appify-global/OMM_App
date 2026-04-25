import React, { useMemo, useState } from 'react';
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
import { LabeledInput } from '../../components/LabeledInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { OutlineButton } from '../../components/OutlineButton';
import { colors, spacing } from '../../theme/theme';

type Props = RootStackScreenProps<'ForgotPasswordEmail'>;

export function ForgotPasswordEmailScreen({ navigation }: Props) {
  const [email, setEmail] = useState('john.lim@azrealestate.com.au');

  const valid = useMemo(() => email.trim().includes('@') && email.includes('.'), [email]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.body}>
            Enter the email of your Unlisted account. We will send a 5-digit code, valid 10 minutes, to
            verify it is you.
          </Text>

          <LabeledInput
            label="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="john.lim@azrealestate.com.au"
          />

          <Pressable
            style={styles.altLink}
            onPress={() => navigation.navigate('ForgotPasswordPhone')}
            hitSlop={8}
          >
            <Text style={styles.altLinkText}>Verify with phone</Text>
          </Pressable>

          <View style={styles.spacer} />

          <View style={styles.actions}>
            <OutlineButton label="Back to Login" onPress={() => navigation.navigate('Login')} />
            <PrimaryButton
              label="Continue"
              disabled={!valid}
              style={{ alignSelf: 'stretch' }}
              onPress={() =>
                navigation.navigate('ForgotPasswordEmailOtp', { email: email.trim() })
              }
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
  safe: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
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
  altLink: { marginBottom: spacing.xl },
  altLinkText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
  },
  spacer: { flexGrow: 1, minHeight: 48 },
  actions: { gap: spacing.md, paddingBottom: spacing.xl, alignSelf: 'stretch' },
});
