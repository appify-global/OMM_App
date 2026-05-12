import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';
import { layout } from '@/constants/theme';

const LABEL = 'rgba(0, 0, 0, 0.42)';
const INPUT = '#000000';
const SINGLE_LINE_H = 54;
/** Standard rounded rectangle — corner radius only (not capsule / pill). */
const FIELD_RADIUS = 12;

const fieldOutline = {
  borderWidth: FIELD_OUTLINE_WIDTH,
  borderColor: FIELD_OUTLINE_COLOR,
  backgroundColor: '#fff',
};

function FieldRow({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputField, fieldOutline]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.inputSingle}
          placeholderTextColor="rgba(0, 0, 0, 0.35)"
          keyboardType={keyboardType}
          returnKeyType="done"
          {...(Platform.OS === 'android' ? { includeFontPadding: false } : {})}
        />
      </View>
    </View>
  );
}

/**
 * Edit listing — field form (empty state).
 */
export default function EditListingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [street, setStreet] = useState('');
  const [suburb, setSuburb] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [cars, setCars] = useState('');
  const [description, setDescription] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}>
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
          <Text style={styles.pageTitle}>Edit listing</Text>

          <FieldRow label="LISTING TITLE" value={title} onChangeText={setTitle} />
          <FieldRow label="LIST PRICE" value={price} onChangeText={setPrice} />
          <FieldRow label="STREET ADDRESS" value={street} onChangeText={setStreet} />
          <FieldRow label="SUBURB & POSTCODE" value={suburb} onChangeText={setSuburb} />
          <FieldRow label="BEDROOMS" value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" />
          <FieldRow label="BATHROOMS" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" />
          <FieldRow label="CAR SPACES" value={cars} onChangeText={setCars} keyboardType="numeric" />

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>DESCRIPTION</Text>
            <View style={[styles.inputArea, fieldOutline]}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={styles.inputMultiline}
                placeholderTextColor="rgba(0, 0, 0, 0.35)"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.ctaBlock}>
            <AppButton variant="filled" onPress={() => router.back()} textStyle={styles.saveLabel}>
              SAVE CHANGES
            </AppButton>
            <Pressable
              onPress={() => router.back()}
              style={styles.cancelWrap}
              accessibilityRole="button"
              accessibilityLabel="Cancel">
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: layout.screenGutter, paddingTop: 4 },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    letterSpacing: -0.6,
    marginBottom: 28,
  },
  fieldBlock: { marginBottom: 22 },
  label: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: LABEL,
    letterSpacing: 0.65,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  /** Rounded rectangle: long straight edges, small radius at corners only. */
  inputField: {
    height: SINGLE_LINE_H,
    borderRadius: FIELD_RADIUS,
    overflow: 'hidden',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenGutter,
  },
  inputSingle: {
    flex: 1,
    width: '100%',
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: INPUT,
    margin: 0,
    paddingHorizontal: 0,
    ...Platform.select({
      ios: {
        paddingVertical: 16,
      },
      android: {
        paddingVertical: 0,
        textAlignVertical: 'center' as const,
      },
      default: { paddingVertical: 14 },
    }),
  },
  /** Multiline — same corner radius as single-line. */
  inputArea: {
    borderRadius: FIELD_RADIUS,
    minHeight: 168,
    overflow: 'hidden',
    paddingHorizontal: layout.screenGutter,
    paddingVertical: 16,
  },
  inputMultiline: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: INPUT,
    lineHeight: 24,
    minHeight: 136,
    margin: 0,
    padding: 0,
    ...Platform.select({
      android: { textAlignVertical: 'top' as const },
      default: {},
    }),
  },
  saveLabel: { fontSize: 14, fontFamily: 'Satoshi-Medium', letterSpacing: 0.65 },
  ctaBlock: { marginTop: 8 },
  cancelWrap: { alignItems: 'center', marginTop: 18, paddingVertical: 8 },
  cancel: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.55)' },
});
