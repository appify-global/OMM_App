import React from 'react';
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
import type { RootStackScreenProps } from '../navigation/types';
import { useSignUp } from '../context/SignUpContext';
import { LabeledInput } from '../components/LabeledInput';
import { SelectField } from '../components/SelectField';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme/theme';

type Props = RootStackScreenProps<'SignUp2'>;

const ROLES = [
  { label: 'LISTING AGENT', value: 'LISTING_AGENT' },
  { label: 'BUYERS AGENT', value: 'BUYERS_AGENT' },
  { label: 'BUYER', value: 'BUYER' },
];

const STATES = [{ label: 'VICTORIA', value: 'VICTORIA' }];

const MUNICIPALITIES = [{ label: 'BOROONDARA', value: 'BOROONDARA' }];

export function SignUpStep2Screen({ navigation }: Props) {
  const { data, setField } = useSignUp();

  const canContinue =
    Boolean(data.role) && Boolean(data.state) && Boolean(data.municipality) && data.agencyName.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SafeAreaView edges={['top']} style={styles.safe}>
          <Text style={styles.step}>STEP 02</Text>
          <Text style={styles.title}>Your role & location</Text>

          <SelectField
            label="Your role"
            metaLabel="ROLE"
            required
            value={data.role}
            options={ROLES}
            onChange={(v) => setField('role', v as typeof data.role)}
            helper="Pick Listing Agent, Buyers Agent, or Buyer."
          />

          <Text style={styles.section}>LOCATION</Text>
          <View style={styles.row2}>
            <View style={styles.half}>
              <SelectField
                label="State"
                value={data.state}
                options={STATES}
                onChange={(v) => setField('state', v)}
                required
              />
            </View>
            <View style={styles.half}>
              <SelectField
                label="Municipality"
                value={data.municipality}
                options={MUNICIPALITIES}
                onChange={(v) => setField('municipality', v)}
                required
              />
            </View>
          </View>

          <LabeledInput
            label="Agency name"
            required
            value={data.agencyName}
            onChangeText={(t) => setField('agencyName', t)}
            placeholder="A-Z Real Estate"
          />

          <PrimaryButton
            label="Sign Up"
            uppercase
            disabled={!canContinue}
            onPress={() => navigation.navigate('SignUp3')}
          />

          <Pressable onPress={() => navigation.navigate('ContactSupport')} style={styles.helpWrap}>
            <Text style={styles.help}>
              Need help? <Text style={styles.helpLink}>Contact support</Text>
            </Text>
          </Pressable>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xxl },
  safe: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
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
  section: {
    fontSize: 12,
    letterSpacing: 0.8,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  row2: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  helpWrap: { alignItems: 'center', marginTop: spacing.lg },
  help: { fontSize: 14, color: colors.textSecondary },
  helpLink: { color: colors.primary, fontWeight: '600' },
});
