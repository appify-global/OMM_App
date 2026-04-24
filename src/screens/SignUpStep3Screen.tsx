import React, { useCallback, useState } from 'react';
import {
  Alert,
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
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../navigation/types';
import { useSignUp } from '../context/SignUpContext';
import { LabeledInput } from '../components/LabeledInput';
import { SelectField } from '../components/SelectField';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radii, spacing } from '../theme/theme';

type Props = RootStackScreenProps<'SignUp3'>;

const GOVT_TYPES = [
  { label: 'Driver licence', value: 'Driver licence' },
  { label: 'Passport', value: 'Passport' },
];

export function SignUpStep3Screen({ navigation }: Props) {
  const { data, setField } = useSignUp();
  const [busy, setBusy] = useState(false);

  const pick = useCallback(
    async (kind: 'id' | 'licence') => {
      try {
        const res = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          copyToCacheDirectory: true,
        });
        if (res.canceled || !res.assets?.length) return;
        const name = res.assets[0].name;
        if (kind === 'id') setField('idDocumentName', name);
        else setField('licenceDocumentName', name);
      } catch {
        Alert.alert('Could not open files', 'Please try again.');
      }
    },
    [setField],
  );

  const canSubmit =
    data.govIdType &&
    data.dateOfBirth.trim().length > 0 &&
    data.driverLicenceNumber.trim().length > 0 &&
    data.expiryDate.trim().length > 0 &&
    data.idDocumentName.length > 0 &&
    data.licenceDocumentName.length > 0;

  const submit = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 400));
    setBusy(false);
    navigation.navigate('SignUp4');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SafeAreaView edges={['top']} style={styles.safe}>
          <Text style={styles.step}>STEP 03</Text>
          <Text style={styles.title}>Identity & documents</Text>

          <SelectField
            label="Govt ID type"
            value={data.govIdType}
            options={GOVT_TYPES}
            onChange={(v) => setField('govIdType', v)}
            required
          />
          <LabeledInput
            label="Date of birth"
            required
            value={data.dateOfBirth}
            onChangeText={(t) => setField('dateOfBirth', t)}
            placeholder="14 / 04 / 1988"
          />
          <LabeledInput
            label="Driver licence number"
            required
            value={data.driverLicenceNumber}
            onChangeText={(t) => setField('driverLicenceNumber', t)}
            placeholder="1AB2C3456"
            autoCapitalize="characters"
          />
          <LabeledInput
            label="Expiry date"
            required
            value={data.expiryDate}
            onChangeText={(t) => setField('expiryDate', t)}
            placeholder="12 / 04 / 2030"
          />

          <Text style={styles.uploadLabel}>
            UPLOAD DOCUMENT<Text style={styles.star}> *</Text>
          </Text>
          <Pressable style={styles.upload} onPress={() => pick('id')}>
            <Ionicons name="document-text-outline" size={28} color={colors.textSecondary} />
            <Text style={styles.uploadName}>
              {data.idDocumentName || 'Tap to choose a file'}
            </Text>
            <Text style={styles.uploadHint}>MAXIMUM FILE SIZE 10MB</Text>
          </Pressable>

          <Text style={styles.uploadLabel}>
            REAL ESTATE LICENCE<Text style={styles.star}> *</Text>
          </Text>
          <Pressable style={styles.upload} onPress={() => pick('licence')}>
            <Ionicons name="document-text-outline" size={28} color={colors.textSecondary} />
            <Text style={styles.uploadName}>
              {data.licenceDocumentName || 'Tap to choose a file'}
            </Text>
            <Text style={styles.uploadHint}>AGENTS ONLY - MAX 10MB</Text>
          </Pressable>

          <PrimaryButton
            label="Submit for verification"
            uppercase
            disabled={!canSubmit}
            loading={busy}
            onPress={submit}
          />

          <Text style={styles.process}>Process Time: 24-48 Business Hours</Text>
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
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  uploadLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  star: { color: colors.destructive },
  upload: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.inputSurface,
  },
  uploadName: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  uploadHint: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  process: {
    textAlign: 'center',
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  helpWrap: { alignItems: 'center', marginTop: spacing.md },
  help: { fontSize: 14, color: colors.textSecondary },
  helpLink: { color: colors.primary, fontWeight: '500' },
});
