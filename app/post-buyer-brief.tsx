import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

/** [Figma 1053:1137](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-1137) */
const SCREEN_H_PAD = 32;
const FIELD_RADIUS = 14;
const FIELD_HEIGHT = 54;
const FIELD_TEXT = '#000000';
const LABEL_DEFAULT = 'rgba(0, 0, 0, 0.72)';
const LABEL_OPTIONAL = 'rgba(0, 0, 0, 0.65)';

function BriefField({
  label,
  value,
  onChangeText,
  multiline,
  optionalLabel,
  showPin,
  style,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  optionalLabel?: boolean;
  showPin?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const labelStyle: StyleProp<TextStyle> = [
    styles.fieldLabel,
    optionalLabel ? styles.fieldLabelOptional : styles.fieldLabelPrimary,
  ];

  if (multiline) {
    return (
      <View style={[styles.fieldBlock, style]}>
        <Text style={labelStyle}>{label}</Text>
        <View style={styles.fieldShellMultiline}>
          <TextInput
            style={styles.fieldInputMultiline}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="rgba(0, 0, 0, 0.35)"
            multiline
            textAlign="center"
            textAlignVertical="top"
          />
        </View>
      </View>
    );
  }

  const shellStyle = showPin ? styles.fieldShellRowPin : styles.fieldShellPlain;

  return (
    <View style={[styles.fieldBlock, style]}>
      <Text style={labelStyle}>{label}</Text>
      <View style={shellStyle}>
        {showPin ? (
          <FontAwesome name="map-marker" size={14} color="rgba(0, 0, 0, 0.55)" style={styles.fieldPinIcon} />
        ) : null}
        <TextInput
          style={[styles.fieldInput, showPin && styles.fieldInputInRow]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="rgba(0, 0, 0, 0.35)"
          textAlign="center"
          textAlignVertical="center"
        />
      </View>
    </View>
  );
}

export default function PostBuyerBriefScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [suburbs, setSuburbs] = useState('218 Victoria St, West Melbourne — walk-up flat');
  const [budget, setBudget] = useState('$1.80m – $2.60m · flexible if sole mandate');
  const [propertyType, setPropertyType] = useState('Period home or renovated townhouse · 3........');
  const [minBedrooms, setMinBedrooms] = useState('3+ (4 preferred)');
  const [minBathrooms, setMinBathrooms] = useState('2+ (3 preferred)');
  const [minCarSpaces, setMinCarSpaces] = useState('2+ (2 preferred)');
  const [brief, setBrief] = useState(
    'Renovated Edwardian near North Melbourne station. North living. Relocating family · need childcare & primary …',
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.headerBack}>
          <FontAwesome name="chevron-left" size={18} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>Post buyer brief</Text>
        <View style={styles.headerBackPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 28 },
        ]}>
        <Text style={styles.intro}>
          Be specific on suburbs, budget, and timing. Your brief is shared only with agents who hold relevant stock;
          you initiate contact from property pages, the same pattern as major listing portals.
        </Text>

        <BriefField label="Preferred suburbs or areas" value={suburbs} onChangeText={setSuburbs} showPin />

        <BriefField label="Budget range" value={budget} onChangeText={setBudget} />

        <BriefField label="Property type" value={propertyType} onChangeText={setPropertyType} />

        <BriefField
          label="Minimum bedrooms (optional)"
          value={minBedrooms}
          onChangeText={setMinBedrooms}
          optionalLabel
        />

        <BriefField
          label="Minimum bathrooms (optional)"
          value={minBathrooms}
          onChangeText={setMinBathrooms}
          optionalLabel
        />

        <BriefField
          label="Minimum car spaces (optional)"
          value={minCarSpaces}
          onChangeText={setMinCarSpaces}
          optionalLabel
        />

        <BriefField label="Your brief" value={brief} onChangeText={setBrief} multiline style={styles.fieldBlockTight} />

        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
          onPress={() => router.back()}
          accessibilityRole="button">
          <Text style={styles.submitLabel}>SUBMIT BRIEF</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.draftBtn, pressed && styles.btnPressed]}
          onPress={() => router.back()}
          accessibilityRole="button">
          <Text style={styles.draftLabel}>SAVE DRAFT & EXIT</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_H_PAD,
    paddingBottom: 4,
    minHeight: 44,
  },
  headerBack: {
    width: 40,
    height: 40,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackPlaceholder: { width: 40 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  scroll: {
    paddingHorizontal: SCREEN_H_PAD,
    paddingTop: 6,
  },
  intro: {
    fontSize: 13,
    fontWeight: '400',
    color: LABEL_OPTIONAL,
    textAlign: 'left',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 340,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldBlockTight: {
    marginBottom: 36,
  },
  fieldLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    lineHeight: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  fieldLabelPrimary: {
    color: LABEL_DEFAULT,
    letterSpacing: 0.8,
  },
  fieldLabelOptional: {
    color: LABEL_OPTIONAL,
    letterSpacing: 0.1,
  },
  fieldShellRowPin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: FIELD_RADIUS,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
    height: FIELD_HEIGHT,
    paddingLeft: 13,
    paddingRight: 12,
  },
  fieldShellPlain: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: FIELD_RADIUS,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
    height: FIELD_HEIGHT,
    paddingHorizontal: 14,
  },
  fieldPinIcon: {
    marginRight: 8,
  },
  fieldShellMultiline: {
    backgroundColor: '#fff',
    borderRadius: FIELD_RADIUS,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
    minHeight: 116,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 14,
  },
  fieldInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: '400',
    color: FIELD_TEXT,
    paddingVertical: 0,
    margin: 0,
    letterSpacing: 0.14,
    lineHeight: 20,
  },
  fieldInputInRow: {
    paddingLeft: 2,
  },
  fieldInputMultiline: {
    width: '100%',
    fontSize: 14,
    fontWeight: '400',
    color: FIELD_TEXT,
    letterSpacing: 0.14,
    lineHeight: 22,
    minHeight: 88,
    paddingVertical: 0,
  },
  submitBtn: {
    backgroundColor: '#000000',
    height: 48,
    borderRadius: FIELD_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  submitLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: -0.14,
  },
  draftBtn: {
    backgroundColor: '#fff',
    height: 48,
    borderRadius: FIELD_RADIUS,
    borderWidth: FIELD_OUTLINE_WIDTH,
    borderColor: FIELD_OUTLINE_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: LABEL_OPTIONAL,
    letterSpacing: -0.14,
  },
  btnPressed: {
    opacity: 0.88,
  },
});
