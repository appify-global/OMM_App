import { Text } from "@/components/OMMText";
import { TextInput } from "@/components/OMMTextInput";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter, type Href } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  formatAudWhole,
  parseFormattedAudWholeDollars,
  suggestAudCompletionsFromDisplay,
} from "@/lib/referral-pricing";
import { useTabBarOnScroll } from "@/lib/tab-bar-visibility";
import {
  PL_BODY,
  PL_BORDER,
  PL_LABEL,
  PL_PAD,
  PL_TITLE,
  PrimaryCta,
  PublishStepHeader,
  fieldShell,
  useListingFlowBottomPad,
} from "./_shared";

import {
  ADDRESS_DISCLOSURE_LABELS,
  useListingDraft,
  type AddressDisclosureChoice,
} from "./listing-draft-context";

const ADDRESS_DISCLOSURE_OPTIONS = Object.keys(
  ADDRESS_DISCLOSURE_LABELS,
) as AddressDisclosureChoice[];

const PROPERTY_TYPES = [
  "House",
  "Apartment",
  "Townhouse",
  "Villa",
  "Land",
  "Block of Units",
] as const;
const COUNT_OPTS = ["1", "2", "3", "4", "5", "6+"] as const;

/** `$` prefix + en-AU thousands grouping only; no AUD currency suffix in the field. */
function formatPriceInputDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const n = Number.parseInt(digits, 10);
  if (!Number.isFinite(n)) return "";
  return `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;
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
        <Pressable
          style={pickStyles.sheet}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={pickStyles.sheetTitle}>{title}</Text>
          <ScrollView
            style={pickStyles.optionScroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {options.map((o) => (
              <Pressable
                key={o}
                style={pickStyles.option}
                onPress={() => {
                  onPick(o);
                  onClose();
                }}
              >
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
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: "Satoshi-Medium",
    marginBottom: 12,
    color: PL_BODY,
  },
  optionScroll: { maxHeight: 400 },
  option: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  optionText: { fontSize: 16, color: PL_BODY },
});

function PublishListingStep1() {
  const router = useRouter();
  const bottomPad = useListingFlowBottomPad();
  const { onScroll } = useTabBarOnScroll();
  const {
    addressDisclosure,
    setAddressDisclosure,
    listingPriceFromAud,
    listingPriceToAud,
    setListingPriceRange,
  } = useListingDraft();

  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [carSpaces, setCarSpaces] = useState("");
  const [landAreaSize, setLandAreaSize] = useState("");
  const [internalArea, setInternalArea] = useState("");

  const [pickKind, setPickKind] = useState<
    null | "type" | "bedrooms" | "bathrooms" | "car_spaces"
  >(null);
  const [activePriceField, setActivePriceField] = useState<
    "from" | "to" | null
  >(null);
  const priceBlurClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fromSuggestions = useMemo(
    () => suggestAudCompletionsFromDisplay(priceFrom),
    [priceFrom],
  );
  const toSuggestions = useMemo(
    () => suggestAudCompletionsFromDisplay(priceTo),
    [priceTo],
  );
  const visiblePriceSuggestions = useMemo(() => {
    if (activePriceField === "from") return fromSuggestions;
    if (activePriceField === "to") return toSuggestions;
    return [];
  }, [activePriceField, fromSuggestions, toSuggestions]);

  const clearPriceBlurTimer = () => {
    if (priceBlurClearRef.current) {
      clearTimeout(priceBlurClearRef.current);
      priceBlurClearRef.current = null;
    }
  };

  const schedulePriceFieldBlur = () => {
    clearPriceBlurTimer();
    priceBlurClearRef.current = setTimeout(
      () => setActivePriceField(null),
      220,
    );
  };

  const applyPriceSuggestion = (which: "from" | "to", aud: number) => {
    clearPriceBlurTimer();
    const next = formatPriceInputDisplay(String(aud));
    if (which === "from") {
      setPriceFrom(next);
    } else {
      setPriceTo(next);
    }
    setActivePriceField(null);
  };

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
    Alert.alert("Draft saved", "Your listing draft has been saved.");
  }, []);

  const goStep2 = useCallback(() => {
    if (!address.trim()) {
      return;
    }
    const fromAud = parseFormattedAudWholeDollars(priceFrom);
    const toAud = parseFormattedAudWholeDollars(priceTo);
    setListingPriceRange(fromAud, toAud);
    router.push("/add/media" as Href);
  }, [priceFrom, priceTo, router, setListingPriceRange]);

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <PublishStepHeader
        step={1}
        onBack={() => router.back()}
        onSaveDraft={saveDraft}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.pageTitle}>Property Details</Text>

        <View style={styles.fieldBlock}>
          <Text style={styles.floatLabel}>PROPERTY ADDRESS</Text>
          <View style={[styles.inputShell, fieldShell]}>
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
            Choose whether buyers see the full street address on the published
            listing.
          </Text>
          <View
            style={styles.segmentRow}
            accessibilityRole="radiogroup"
            accessibilityLabel="Address visibility"
          >
            {ADDRESS_DISCLOSURE_OPTIONS.map((key) => {
              const selected = addressDisclosure === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setAddressDisclosure(key)}
                  style={[
                    styles.segmentCell,
                    fieldShell,
                    selected && styles.segmentCellSelected,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      selected && styles.segmentLabelSelected,
                    ]}
                  >
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
            onPress={() => setPickKind("type")}
            style={[styles.inputShell, fieldShell, styles.inputRow]}
          >
            <Text
              style={[styles.input, !propertyType && styles.inputPlaceholder]}
            >
              {propertyType || "Select property type"}
            </Text>
            <FontAwesome name="chevron-down" size={12} color={PL_BORDER} />
          </Pressable>
        </View>

        <View style={styles.rangeBlock}>
          <Text style={styles.rangeSectionLabel}>LISTING PRICE RANGE</Text>
          <View style={styles.rangeRow}>
            <View style={[styles.rangeHalf, fieldShell]}>
              <Text style={styles.innerCaps}>FROM</Text>
              <TextInput
                style={styles.rangeInput}
                value={priceFrom}
                onChangeText={(t) => setPriceFrom(formatPriceInputDisplay(t))}
                onFocus={() => {
                  clearPriceBlurTimer();
                  setActivePriceField("from");
                }}
                onBlur={schedulePriceFieldBlur}
                placeholder="$850,000"
                placeholderTextColor="rgba(0, 0, 0, 0.35)"
                keyboardType="number-pad"
              />
            </View>
            <Text style={styles.rangeDash}>–</Text>
            <View style={[styles.rangeHalf, fieldShell]}>
              <Text style={styles.innerCaps}>TO</Text>
              <TextInput
                style={styles.rangeInput}
                value={priceTo}
                onChangeText={(t) => setPriceTo(formatPriceInputDisplay(t))}
                onFocus={() => {
                  clearPriceBlurTimer();
                  setActivePriceField("to");
                }}
                onBlur={schedulePriceFieldBlur}
                placeholder="$920,000"
                placeholderTextColor="rgba(0, 0, 0, 0.35)"
                keyboardType="number-pad"
              />
            </View>
          </View>
          {visiblePriceSuggestions.length > 0 && activePriceField ? (
            <View style={styles.priceSuggestWrap} accessibilityRole="menu">
              <Text style={styles.priceSuggestHint}>Complete as</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.priceSuggestScroll}
              >
                {visiblePriceSuggestions.map((aud) => (
                  <Pressable
                    key={`${activePriceField}-${aud}`}
                    style={styles.priceSuggestChip}
                    onPressIn={() => clearPriceBlurTimer()}
                    onPress={() => applyPriceSuggestion(activePriceField, aud)}
                    accessibilityRole="button"
                    accessibilityLabel={`Complete price as ${formatAudWhole(aud)}`}
                  >
                    <Text style={styles.priceSuggestChipText}>
                      {formatAudWhole(aud)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        <View style={styles.tripleRow}>
          <View style={styles.tripleCol}>
            <Text style={styles.smallCaps}>BEDROOMS</Text>
            <Pressable
              onPress={() => setPickKind("bedrooms")}
              style={[styles.tripleField, fieldShell, styles.inputRowCenter]}
            >
              <Text
                style={[styles.tripleVal, !bedrooms && styles.inputPlaceholder]}
              >
                {bedrooms || "3"}
              </Text>
              <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
            </Pressable>
          </View>
          <View style={styles.tripleCol}>
            <Text style={styles.smallCaps}>BATHROOMS</Text>
            <Pressable
              onPress={() => setPickKind("bathrooms")}
              style={[styles.tripleField, fieldShell, styles.inputRowCenter]}
            >
              <Text
                style={[
                  styles.tripleVal,
                  !bathrooms && styles.inputPlaceholder,
                ]}
              >
                {bathrooms || "2"}
              </Text>
              <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
            </Pressable>
          </View>
          <View style={styles.tripleCol}>
            <Text style={styles.smallCaps}>CAR SPACES</Text>
            <Pressable
              onPress={() => setPickKind("car_spaces")}
              style={[styles.tripleField, fieldShell, styles.inputRowCenter]}
            >
              <Text
                style={[
                  styles.tripleVal,
                  !carSpaces && styles.inputPlaceholder,
                ]}
              >
                {carSpaces || "2"}
              </Text>
              <FontAwesome name="chevron-down" size={11} color={PL_BORDER} />
            </Pressable>
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.floatLabel}>LAND AREA SIZE</Text>
          <View style={[styles.inputShell, fieldShell]}>
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
          <View style={[styles.inputShell, fieldShell]}>
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
        <PrimaryCta
          label="CONTINUE"
          onPress={goStep2}
          disabled={!address.trim()}
        />
      </View>

      <PickModal
        visible={pickKind === "type"}
        title="Property type"
        options={PROPERTY_TYPES}
        onPick={(v) => setPropertyType(v)}
        onClose={() => setPickKind(null)}
      />
      <PickModal
        visible={pickKind === "bedrooms"}
        title="Bedrooms"
        options={COUNT_OPTS}
        onPick={(v) => setBedrooms(v)}
        onClose={() => setPickKind(null)}
      />
      <PickModal
        visible={pickKind === "bathrooms"}
        title="Bathrooms"
        options={COUNT_OPTS}
        onPick={(v) => setBathrooms(v)}
        onClose={() => setPickKind(null)}
      />
      <PickModal
        visible={pickKind === "car_spaces"}
        title="Car spaces"
        options={COUNT_OPTS}
        onPick={(v) => setCarSpaces(v)}
        onClose={() => setPickKind(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingTop: 8, paddingBottom: 16 },
  pageTitle: {
    fontSize: 24,
    fontFamily: "Satoshi-Medium",
    color: PL_TITLE,
    marginLeft: PL_PAD,
    marginBottom: 20,
  },

  fieldBlock: { marginBottom: 18, paddingHorizontal: PL_PAD },
  floatLabel: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: PL_LABEL,
    letterSpacing: 0.1,
    marginBottom: 6,
    marginLeft: 8,
  },
  fieldHint: {
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
    lineHeight: 16,
    marginBottom: 10,
    marginLeft: 8,
    marginRight: 8,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 10,
  },
  segmentCell: {
    flex: 1,
    borderRadius: 14,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentCellSelected: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderColor: PL_BODY,
  },
  segmentLabel: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: PL_LABEL,
    textAlign: "center",
  },
  segmentLabelSelected: {
    color: PL_BODY,
  },
  inputShell: {
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: { flex: 1, fontSize: 14, color: PL_BODY },
  inputPlaceholder: { color: "rgba(0, 0, 0, 0.35)" },

  rangeBlock: { paddingHorizontal: PL_PAD, marginBottom: 20 },
  rangeSectionLabel: {
    fontSize: 10,
    color: PL_LABEL,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  rangeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rangeHalf: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 12,
    minHeight: 69.5,
  },
  innerCaps: {
    fontSize: 9,
    color: PL_LABEL,
    letterSpacing: 0.45,
    textTransform: "uppercase",
  },
  rangeInput: {
    flex: 1,
    marginTop: 4,
    padding: 0,
    fontSize: 16,
    fontFamily: "Satoshi-Medium",
    color: PL_BODY,
    minWidth: 0,
  },
  rangeDash: { fontSize: 18, color: PL_LABEL, width: 17, textAlign: "center" },
  priceSuggestWrap: {
    marginTop: 10,
    marginBottom: 2,
  },
  priceSuggestHint: {
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: PL_LABEL,
    letterSpacing: 0.35,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  priceSuggestScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 4,
  },
  priceSuggestChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60, 60, 67, 0.22)",
  },
  priceSuggestChipText: {
    fontSize: 15,
    fontFamily: "Satoshi-Medium",
    color: PL_BODY,
  },

  tripleRow: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 12,
    marginBottom: 8,
    width: "100%",
    paddingHorizontal: PL_PAD,
  },
  tripleCol: { flex: 1 },
  smallCaps: {
    fontSize: 10,
    color: PL_LABEL,
    letterSpacing: 0.25,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  tripleField: {
    borderRadius: 4,
    height: 54,
    paddingHorizontal: 10,
  },
  inputRowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tripleVal: { fontSize: 14, color: "#000" },
});

export default PublishListingStep1;
