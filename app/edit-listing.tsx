import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';
import {
  formatListingPriceRangeDisplay,
  mergePublishedListingFromEditForm,
} from '@/lib/agent-published-listings';
import { useAgentPublishedListings } from '@/lib/agent-published-listings-context';
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

function firstQueryParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

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

function initialPriceDisplay(listing: {
  listingPriceFromAud?: number | null;
  listingPriceToAud?: number | null;
  priceRangeDisplay: string;
}): string {
  if (listing.listingPriceFromAud != null || listing.listingPriceToAud != null) {
    return formatListingPriceRangeDisplay(
      listing.listingPriceFromAud ?? null,
      listing.listingPriceToAud ?? null,
    );
  }
  return listing.priceRangeDisplay;
}

/**
 * Edit listing — loads device-published listing by `listingId`, persists edits locally.
 */
export default function EditListingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ listingId?: string | string[] }>();
  const listingId = firstQueryParam(params.listingId);

  const { listings, ready, refresh, updateListing } = useAgentPublishedListings();

  const listing = useMemo(
    () => (listingId ? listings.find((l) => l.id === listingId) : undefined),
    [listings, listingId],
  );

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [street, setStreet] = useState('');
  const [suburb, setSuburb] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [cars, setCars] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!listing) return;
    setTitle(listing.titleLine);
    setPrice(initialPriceDisplay(listing));
    setStreet(listing.streetLine);
    setSuburb(listing.suburbLine);
    setBedrooms(String(listing.beds));
    setBathrooms(String(listing.baths));
    setCars(String(listing.cars));
    setDescription(listing.description ?? '');
  }, [listing]);

  const onSave = useCallback(async () => {
    if (!listingId) return;
    const current = listings.find((l) => l.id === listingId);
    if (!current) {
      Alert.alert(
        'Listing unavailable',
        'Open Manage listings and choose a listing you published from this device.',
      );
      return;
    }
    if (!title.trim()) {
      Alert.alert('Listing title required', 'Enter a headline for this listing.');
      return;
    }
    setSaving(true);
    try {
      const next = mergePublishedListingFromEditForm(current, {
        titleLine: title,
        priceInput: price,
        streetLine: street,
        suburbLine: suburb,
        bedrooms,
        bathrooms,
        carSpaces: cars,
        description,
      });
      const ok = await updateListing(next);
      if (!ok) {
        Alert.alert('Could not save', 'Listing could not be updated on this device.');
        return;
      }
      Alert.alert('Saved', 'Your listing changes are updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setSaving(false);
    }
  }, [
    listingId,
    listings,
    title,
    price,
    street,
    suburb,
    bedrooms,
    bathrooms,
    cars,
    description,
    updateListing,
    router,
  ]);

  if (!listingId) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.pageTitle}>Edit listing</Text>
        <Text style={styles.helperMuted}>Missing listing reference.</Text>
        <AppButton variant="filled" onPress={() => router.back()} textStyle={styles.saveLabel}>
          GO BACK
        </AppButton>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top + 40 }]}>
        <ActivityIndicator color="#111" />
        <Text style={[styles.helperMuted, { marginTop: 16 }]}>Loading listing…</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 24, paddingHorizontal: layout.screenGutter }]}>
        <Text style={styles.pageTitle}>Edit listing</Text>
        <Text style={styles.helperMuted}>
          Only listings published from this device can be edited here. Demo listings use sample data that
          isn&apos;t saved locally.
        </Text>
        <View style={{ marginTop: 28 }}>
          <AppButton variant="filled" onPress={() => router.back()} textStyle={styles.saveLabel}>
            GO BACK
          </AppButton>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}>
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}>
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
            <AppButton
              variant="filled"
              onPress={() => void onSave()}
              disabled={saving}
              textStyle={styles.saveLabel}>
              {saving ? 'SAVING…' : 'SAVE CHANGES'}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenGutter,
  },
  helperMuted: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0,0,0,0.55)',
    textAlign: 'center',
    lineHeight: 22,
  },
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
