import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  PL_PAD,
  PL_BODY,
  PL_BORDER,
  PL_LABEL,
  PL_TITLE,
  PrimaryCta,
  PublishStepHeader,
  dashedShell,
  useListingFlowBottomPad,
} from './_shared';
import { parseFormattedAudWholeDollars } from '@/lib/referral-pricing';
import { useTabBarOnScroll } from '@/lib/tab-bar-visibility';

import {
  ADDRESS_DISCLOSURE_LABELS,
  type AddressDisclosureChoice,
  useListingDraft,
} from './listing-draft-context';

const ADDRESS_DISCLOSURE_OPTIONS = Object.keys(ADDRESS_DISCLOSURE_LABELS) as AddressDisclosureChoice[];

const PROPERTY_TYPES = [
  'House',
  'Apartment',
  'Townhouse',
  'Villa',
  'Land',
  'Block of Units',
] as const;
const COUNT_OPTS = ['1', '2', '3', '4', '5', '6+'] as const;

/** Strip non-digits and format as Australian dollar display while typing. */
function formatPriceInputDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const n = Number.parseInt(digits, 10);
  if (!Number.isFinite(n)) return '';
  return `$${n.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
}

function PickModal<T extends string>({
  visible,
  title,
  options,
  onPick,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: readonly T[];
  onPick: (v: T) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={pickStyles.scrim} onPress={onClose}>
        <Pressable style={pickStyles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={pickStyles.sheetTitle}>{title}</Text>
          <ScrollView
            style={pickStyles.optionScroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled>
            {options.map((o) => (
              <Pressable
                key={o}
                style={pickStyles.option}
                onPress={() => {
                  onPick(o);
                  onClose();
                }}>
                <Text style={pickStyles.optionText}>{o}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const pickStyles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
  },
  sheetTitle: { fontSize: 16, fontFamily: 'Satoshi-Medium', marginBottom: 12, color: PL_BODY },
  optionScroll: { maxHeight: 400 },
  option: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)' },
  optionText: { fontSize: 16, color: PL_BODY },
});

function PublishListingStep1() {
  const router = useRouter();
  const bottomPad = useListingFlowBottomPad();
  const { onScroll } = useTabBarOnScroll();
  const { addressDisclosure, setAddressDisclosure, listingPriceFromAud, listingPriceToAud, setListingPriceRange } =
    useListingDraft();

  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [cars, setCars] = useState('');
  const [landAreaSize, setLandAreaSize] = useState('');
  const [internalArea, setInternalArea] = useState('');

  const [pickKind, setPickKind] = useState<null | 'type' | 'beds' | 'baths' | 'cars'>(null);

  useFocusEffect(
    useCallback(() => {
      if (listingPriceFromAud != null) {
        setPriceFrom(formatPriceInputDisplay(String(listingPriceFromAud)));
      }
      if (listingPriceToAud != null) {
        setPriceTo(formatPriceInputDisplay(String(listingPriceToAud)));
      }
    }, [listingPriceFromAud, listingPriceToAud]),
  );

  const saveDraft = useCallback(() => {
    Alert.alert('Draft saved', 'Your listing draft has been saved.');
  }, []);

  const goStep2 = useCallback(() => {
    const fromAud = parseFormattedAudWholeDollars(priceFrom);
    const toAud = parseFormattedAudWholeDollars(priceTo);
    setListingPriceRange(fromAud, toAud);
    router.push('/add/media' as Href);
  }, [priceFrom, priceTo, router, setListingPriceRange]);

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <PublishStepHeader step={1} onBack={() => router.back()} onSaveDraft={saveDraft} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Property Details</Text>

        <View style={styles.fieldBlock}>
          <Text style={styles.floatLabel}>PROPERTY ADDRESS</Text>
          <View style={[styles.inputShell, dashedShell]}>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="12 Collins St, Melbourne VIC 3000"
              placeholderTextColor="rgba(0, 0, 0, 0.35)"
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.floatLabel}>ADDRESS VISIBILITY</Text>
          <Text style={styles.fieldHint}>
            Choose whether buyers see the full street address on the published listing.
          </Text>
          <View
            style={styles.segmentRow}
            accessibilityRole="radiogroup"
            accessibilityLabel="Address visibility">
            {ADDRESS_DISCLOSURE_OPTIONS.map((key) => {
              const selected = addressDisclosure === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setAddressDisclosure(key)}
                  style={[styles.segmentCell, dashedShell, selected && styles.segmentCellSelected]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}>
                  <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                    {ADDRESS_DISCLOSURE_LABELS[key]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.floatLabel}>PROPERTY TYPE</Text>
          <Pressable
            onPress={() => setPickKind('type')}
            style={[styles.inputShell, dashedShell, styles.inputRow]}>
            <Text style={[styles.input, !propertyType && styles.inputPlaceholder]}>
              {propertyType || 'Townhouse'}
            </Text>
            <FontAwesome name="chevron-down" size={12} color={PL_BORDER} />
          </Pressable>
        </View>

        <View style={styles.rangeBlock}>
          <Text style={styles.rangeSectionLabel}>LISTING PRICE RANGE</Text>
          <View style={styles.rangeRow}>
            <View style={[styles.rangeHalf, dashedShell]}>
              <Text style={styles.innerCaps}>FROM</Text>
              <TextInput
                style={styles.rangeInput}
                value={priceFrom}
                onChangeText={(t) => setPriceFrom(formatPriceInputDisplay(t))}
                placeholder="$850,000"
                placeholderTextColor="rgba(0, 0, 0, 0.35)"
                keyboardType="number-pad"
              />
            </View>
            <Text style={styles.rangeDash}>–</Text>
            <View style={[styles.rangeHalf, dashedShell]}>
              <Text style={styles.innerCaps}>TO</Text>
              <TextInput
                style={styles.rangeInput}
                value={priceTo}
                onChangeText={(t) => setPriceTo(formatPriceInputDisplay(t))}
                placeholder="$920,000"
                placeholderTextColor="rgba(0, 0, 0, 0.35)"
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.tripleRow}>
          <View style={styles.tripleCol}>
            <Text style={styles.smallCaps}>BEDROOMS</Text>
            <Pressable
              onPress={() => setPickKind('beds')}
              style={[styles.tripleField, dashedShell, styles.inputRowCenter]}>
              <Text style={[styles.tripleVal, !beds && styles.inputPlaceholder]}>{beds || '3'}</Text>
              <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
            </Pressable>
          </View>
          <View style={styles.tripleCol}>
            <Text style={styles.smallCaps}>BATHROOMS</Text>
            <Pressable
              onPress={() => setPickKind('baths')}
              style={[styles.tripleField, dashedShell, styles.inputRowCenter]}>
              <Text style={[styles.tripleVal, !baths && styles.inputPlaceholder]}>{baths || '2'}</Text>
              <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
            </Pressable>
          </View>
          <View style={styles.tripleCol}>
            <Text style={styles.smallCaps}>CAR SPACES</Text>
            <Pressable
              onPress={() => setPickKind('cars')}
              style={[styles.tripleField, dashedShell, styles.inputRowCenter]}>
              <Text style={[styles.tripleVal, !cars && styles.inputPlaceholder]}>{cars || '2'}</Text>
              <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
            </Pressable>
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.floatLabel}>LAND AREA SIZE</Text>
          <View style={[styles.inputShell, dashedShell]}>
            <TextInput
              style={styles.input}
              value={landAreaSize}
              onChangeText={setLandAreaSize}
              placeholder="450 sqm"
              placeholderTextColor="rgba(0, 0, 0, 0.35)"
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.floatLabel}>INTERNAL AREA</Text>
          <View style={[styles.inputShell, dashedShell]}>
            <TextInput
              style={styles.input}
              value={internalArea}
              onChangeText={setInternalArea}
              placeholder="180 sqm"
              placeholderTextColor="rgba(0, 0, 0, 0.35)"
            />
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={{ paddingBottom: 6 }}>
        <PrimaryCta label="CONTINUE" onPress={goStep2} />
      </View>

      <PickModal
        visible={pickKind === 'type'}
        title="Property type"
        options={PROPERTY_TYPES}
        onPick={(v) => setPropertyType(v)}
        onClose={() => setPickKind(null)}
      />
      <PickModal
        visible={pickKind === 'beds'}
        title="Bedrooms"
        options={COUNT_OPTS}
        onPick={(v) => setBeds(v)}
        onClose={() => setPickKind(null)}
      />
      <PickModal
        visible={pickKind === 'baths'}
        title="Bathrooms"
        options={COUNT_OPTS}
        onPick={(v) => setBaths(v)}
        onClose={() => setPickKind(null)}
      />
      <PickModal
        visible={pickKind === 'cars'}
        title="Car spaces"
        options={COUNT_OPTS}
        onPick={(v) => setCars(v)}
        onClose={() => setPickKind(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingTop: 8, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontFamily: 'Satoshi-Medium', color: PL_TITLE, marginLeft: PL_PAD, marginBottom: 20 },

  fieldBlock: { marginBottom: 18, paddingHorizontal: PL_PAD },
  floatLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: PL_LABEL,
    letterSpacing: 0.1,
    marginBottom: 6,
    marginLeft: 8,
  },
  fieldHint: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.45)',
    lineHeight: 16,
    marginBottom: 10,
    marginLeft: 8,
    marginRight: 8,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentCell: {
    flex: 1,
    borderRadius: 14,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentCellSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderColor: PL_BODY,
  },
  segmentLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: PL_LABEL,
    textAlign: 'center',
  },
  segmentLabelSelected: {
    color: PL_BODY,
  },
  inputShell: {
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { flex: 1, fontSize: 14, color: PL_BODY },
  inputPlaceholder: { color: 'rgba(0, 0, 0, 0.35)' },

  rangeBlock: { paddingHorizontal: PL_PAD, marginBottom: 20 },
  rangeSectionLabel: {
    fontSize: 10,
    color: PL_LABEL,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rangeHalf: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 12,
    minHeight: 69.5,
  },
  innerCaps: { fontSize: 9, color: PL_LABEL, letterSpacing: 0.45, textTransform: 'uppercase' },
  rangeInput: {
    flex: 1,
    marginTop: 4,
    padding: 0,
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: PL_BODY,
    minWidth: 0,
  },
  rangeDash: { fontSize: 18, color: PL_LABEL, width: 17, textAlign: 'center' },

  tripleRow: { flexDirection: 'row', alignSelf: 'center', gap: 12, marginBottom: 8, width: '100%', paddingHorizontal: PL_PAD },
  tripleCol: { flex: 1 },
  smallCaps: {
    fontSize: 10,
    color: PL_LABEL,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tripleField: {
    borderRadius: 4,
    height: 54,
    paddingHorizontal: 10,
  },
  inputRowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tripleVal: { fontSize: 14, color: '#000' },
});

export default PublishListingStep1;
