import FontAwesome from '@expo/vector-icons/FontAwesome';
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
  PL_MUTED,
  PL_TITLE,
  PrimaryCta,
  PublishStepHeader,
  dashedShell,
  useListingFlowBottomPad,
} from './_shared';

const PROPERTY_TYPES = ['House', 'Apartment', 'Townhouse', 'Land', 'Other'] as const;
const COUNT_OPTS = ['1', '2', '3', '4', '5', '6+'] as const;

function formatListingPriceAUD(n: number): string {
  return `$${n.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
}

const LISTING_PRICE_OPTS: string[] = (() => {
  const r: string[] = [];
  for (let v = 400_000; v < 1_000_000; v += 50_000) {
    r.push(formatListingPriceAUD(v));
  }
  for (let v = 1_000_000; v <= 3_000_000; v += 100_000) {
    r.push(formatListingPriceAUD(v));
  }
  for (let v = 3_500_000; v <= 9_500_000; v += 500_000) {
    r.push(formatListingPriceAUD(v));
  }
  r.push('$10,000,000+');
  return r;
})();

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

export default function PublishListingStep1() {
  const router = useRouter();
  const bottomPad = useListingFlowBottomPad();

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [cars, setCars] = useState('');

  const [pickKind, setPickKind] = useState<
    null | 'type' | 'beds' | 'baths' | 'cars' | 'priceFrom' | 'priceTo'
  >(null);

  const saveDraft = useCallback(() => {
    Alert.alert('Draft saved', 'Your listing draft has been saved.');
  }, []);

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <PublishStepHeader step={1} onBack={() => router.back()} onSaveDraft={saveDraft} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Property Details</Text>

        <View style={styles.aiBanner}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
          <View style={styles.aiCopy}>
            <Text style={styles.aiTitle}>Auto-filled from PriceFinder</Text>
            <Text style={styles.aiSub}>Review & confirm. Previous photos are excluded.</Text>
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.floatLabel}>PROPERTY TITLE</Text>
          <View style={[styles.inputShell, dashedShell]}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Property title"
              placeholderTextColor="rgba(0, 0, 0, 0.35)"
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.floatLabel}>PROPERTY ADDRESS</Text>
          <View style={[styles.inputShell, dashedShell]}>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Street address, suburb, state, postcode"
              placeholderTextColor="rgba(0, 0, 0, 0.35)"
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.floatLabel}>PROPERTY TYPE</Text>
          <Pressable
            onPress={() => setPickKind('type')}
            style={[styles.inputShell, dashedShell, styles.inputRow]}>
            <Text style={[styles.input, !propertyType && styles.inputPlaceholder]}>
              {propertyType || 'Select type'}
            </Text>
            <FontAwesome name="chevron-down" size={12} color={PL_BORDER} />
          </Pressable>
        </View>

        <View style={styles.rangeBlock}>
          <Text style={styles.rangeSectionLabel}>LISTING PRICE RANGE</Text>
          <View style={styles.rangeRow}>
            <Pressable
              onPress={() => setPickKind('priceFrom')}
              style={[styles.rangeHalf, dashedShell]}>
              <Text style={styles.innerCaps}>FROM</Text>
              <View style={styles.rangePickerRow}>
                <Text style={[styles.rangeValue, !priceFrom && styles.inputPlaceholder]} numberOfLines={1}>
                  {priceFrom || 'Select'}
                </Text>
                <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
              </View>
            </Pressable>
            <Text style={styles.rangeDash}>–</Text>
            <Pressable
              onPress={() => setPickKind('priceTo')}
              style={[styles.rangeHalf, dashedShell]}>
              <Text style={styles.innerCaps}>TO</Text>
              <View style={styles.rangePickerRow}>
                <Text style={[styles.rangeValue, !priceTo && styles.inputPlaceholder]} numberOfLines={1}>
                  {priceTo || 'Select'}
                </Text>
                <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.tripleRow}>
          <View style={styles.tripleCol}>
            <Text style={styles.smallCaps}>BEDS</Text>
            <Pressable
              onPress={() => setPickKind('beds')}
              style={[styles.tripleField, dashedShell, styles.inputRowCenter]}>
              <Text style={[styles.tripleVal, !beds && styles.inputPlaceholder]}>{beds || '—'}</Text>
              <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
            </Pressable>
          </View>
          <View style={styles.tripleCol}>
            <Text style={styles.smallCaps}>BATHROOMS</Text>
            <Pressable
              onPress={() => setPickKind('baths')}
              style={[styles.tripleField, dashedShell, styles.inputRowCenter]}>
              <Text style={[styles.tripleVal, !baths && styles.inputPlaceholder]}>{baths || '—'}</Text>
              <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
            </Pressable>
          </View>
          <View style={styles.tripleCol}>
            <Text style={styles.smallCaps}>CAR SPACES</Text>
            <Pressable
              onPress={() => setPickKind('cars')}
              style={[styles.tripleField, dashedShell, styles.inputRowCenter]}>
              <Text style={[styles.tripleVal, !cars && styles.inputPlaceholder]}>{cars || '—'}</Text>
              <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
            </Pressable>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={{ paddingBottom: 6 }}>
        <PrimaryCta label="CONTINUE" onPress={() => router.push('/add/media' as Href)} />
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
        title="Beds"
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
      <PickModal
        visible={pickKind === 'priceFrom'}
        title="Price from"
        options={LISTING_PRICE_OPTS}
        onPick={(v) => setPriceFrom(v)}
        onClose={() => setPickKind(null)}
      />
      <PickModal
        visible={pickKind === 'priceTo'}
        title="Price to"
        options={LISTING_PRICE_OPTS}
        onPick={(v) => setPriceTo(v)}
        onClose={() => setPickKind(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingTop: 8, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontFamily: 'Satoshi-Medium', color: PL_TITLE, marginLeft: PL_PAD, marginBottom: 20 },
  aiBanner: {
    marginHorizontal: PL_PAD - 4,
    marginBottom: 24,
    padding: 12,
    minHeight: 81,
    borderRadius: 10,
    ...dashedShell,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  aiBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6e6e6e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Satoshi-Medium' },
  aiCopy: { flex: 1 },
  aiTitle: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: '#000000' },
  aiSub: { fontSize: 11, color: PL_MUTED, marginTop: 4 },

  fieldBlock: { marginBottom: 18, paddingHorizontal: PL_PAD },
  floatLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: PL_LABEL,
    letterSpacing: 0.1,
    marginBottom: 6,
    marginLeft: 8,
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
  rangePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    gap: 6,
  },
  rangeValue: { flex: 1, minWidth: 0, fontSize: 16, fontFamily: 'Satoshi-Medium', color: PL_BODY },
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
