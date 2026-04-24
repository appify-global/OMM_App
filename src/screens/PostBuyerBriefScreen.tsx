import React, { useState } from 'react';
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
import { brand } from '../theme/brand';

type Props = RootStackScreenProps<'PostBuyerBrief'>;

export function PostBuyerBriefScreen({ navigation }: Props) {
  const [suburbs, setSuburbs] = useState('12 Denham St — period home');
  const [budget, setBudget] = useState('$1.80m — $2.60m • flexible if sole mandate');
  const [propertyType, setPropertyType] = useState(
    'Period home or renovated townhouse • 3+ beds',
  );
  const [minBeds, setMinBeds] = useState('3+ (4 preferred)');
  const [minBaths, setMinBaths] = useState('2+ (3 preferred)');
  const [minCars, setMinCars] = useState('2+ (2 preferred)');
  const [brief, setBrief] = useState(
    'Renovated Edwardian behind Auburn Rd shops. North living, 2 storeys. Relocating family · need childcare & primary within walk distance.',
  );

  const exit = () => navigation.goBack();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeTop} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={exit} style={styles.back} hitSlop={10} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={26} color={brand.charcoal} />
          </Pressable>
          <Text style={styles.title}>Post buyer brief</Text>
          <View style={styles.backSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Be specific on suburbs, budget, and timing. Matches are private, only agents with
          relevant off-market stock will see your brief.
        </Text>

        <FieldLabel text="Preferred suburbs or areas" />
        <View style={styles.inputWithIcon}>
          <Ionicons name="location-outline" size={18} color={brand.sage} style={styles.inputIcon} />
          <TextInput
            value={suburbs}
            onChangeText={setSuburbs}
            style={styles.inputNoBorder}
            placeholder="Suburb, street, or area"
            placeholderTextColor={brand.sage}
          />
        </View>

        <FieldLabel text="Budget range" />
        <TextInput
          value={budget}
          onChangeText={setBudget}
          style={styles.input}
          placeholderTextColor={brand.sage}
        />

        <FieldLabel text="Property type" />
        <TextInput
          value={propertyType}
          onChangeText={setPropertyType}
          style={styles.input}
          placeholderTextColor={brand.sage}
        />

        <FieldLabel text="Minimum bedrooms (optional)" />
        <TextInput
          value={minBeds}
          onChangeText={setMinBeds}
          style={styles.input}
          placeholderTextColor={brand.sage}
        />

        <FieldLabel text="Minimum bathrooms (optional)" />
        <TextInput
          value={minBaths}
          onChangeText={setMinBaths}
          style={styles.input}
          placeholderTextColor={brand.sage}
        />

        <FieldLabel text="Minimum car spaces (optional)" />
        <TextInput
          value={minCars}
          onChangeText={setMinCars}
          style={styles.input}
          placeholderTextColor={brand.sage}
        />

        <FieldLabel text="Your brief" />
        <TextInput
          value={brief}
          onChangeText={setBrief}
          style={styles.briefInput}
          multiline
          textAlignVertical="top"
          placeholder="Describe what you’re looking for…"
          placeholderTextColor={brand.sage}
        />

        <Pressable
          style={styles.submitBtn}
          onPress={exit}
          accessibilityRole="button"
          accessibilityLabel="Submit brief"
        >
          <Text style={styles.submitLabel}>SUBMIT BRIEF</Text>
        </Pressable>

        <Pressable
          style={styles.draftBtn}
          onPress={exit}
          accessibilityRole="button"
          accessibilityLabel="Save draft and exit"
        >
          <Text style={styles.draftLabel}>SAVE DRAFT & EXIT</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <Text style={styles.fieldLabel}>{text.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.warmWhite },
  safeTop: { paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backSpacer: { width: 44 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: brand.charcoal,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    color: brand.sage,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: brand.sage,
    marginBottom: 8,
  },
  input: {
    backgroundColor: brand.cream,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: brand.charcoal,
    marginBottom: 18,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.cream,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.35)',
    paddingLeft: 12,
    paddingRight: 14,
    marginBottom: 18,
  },
  inputIcon: { marginRight: 4 },
  inputNoBorder: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: brand.charcoal,
  },
  briefInput: {
    backgroundColor: brand.cream,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: brand.charcoal,
    minHeight: 140,
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: brand.terracotta,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitLabel: {
    color: brand.warmWhite,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  draftBtn: {
    backgroundColor: brand.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(138,155,142,0.45)',
  },
  draftLabel: {
    color: brand.charcoal,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
