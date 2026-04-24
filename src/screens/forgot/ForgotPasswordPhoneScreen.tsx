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

type Props = RootStackScreenProps<'ForgotPasswordPhone'>;

export function ForgotPasswordPhoneScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('+61 436 815 589');

  const valid = useMemo(() => phone.replace(/\D/g, '').length >= 8, [phone]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
          <Text style={styles.title}>Verify with mobile</Text>
          <Text style={styles.body}>
            We will SMS a code to the number on file ending in -78. Carrier rates may apply. Not
            you? Use email instead.
          </Text>

          <LabeledInput
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+61 436 815 589"
          />

          <Pressable
            style={styles.altLink}
            onPress={() => navigation.navigate('ForgotPasswordEmail')}
            hitSlop={8}
          >
            <Text style={styles.altLinkText}>Verify with email</Text>
          </Pressable>

          <View style={styles.spacer} />

          <View style={styles.actions}>
            <OutlineButton label="Back to Login" onPress={() => navigation.navigate('Login')} />
            <PrimaryButton
              label="Continue"
              disabled={!valid}
              style={{ alignSelf: 'stretch' }}
              onPress={() =>
                navigation.navigate('ForgotPasswordSmsOtp', { phone: phone.trim() })
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
