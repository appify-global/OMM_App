import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppButton, APP_BUTTON_HEIGHT } from '@/components/AppButton';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import {
  Alert,
  Dimensions,
  FlatList,
  type ListRenderItemInfo,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/constants/theme';
import {
  AUTO_PAY_OPTIONS,
  PAYMENT_CARDS,
  type BillingAddressFields,
  type PaymentCardDisplay,
  PAYMENT_METHOD_OTHER,
} from '@/lib/payment-method-mock';
import { FIELD_OUTLINE_COLOR, FIELD_OUTLINE_WIDTH } from '@/lib/field-outline';

/**
 * Payment method — Figma 1053:4044 (+ Add card sheet 1053:4131).
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-4044
 * https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-4131
 * Invoice delivery sheet: https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-4274
 */
const ADD_CARD_SHEET_R = 16;
const FIELD_ROW_R = 8;
const FIELD_MIN_H = 56;
const DEFAULT_ROW_MIN_H = 88;
const SCRIM_WEB = 'rgba(26,26,26,0.45)';
const SCRIM_OVERLAY = 'rgba(26,26,26,0.28)';

const { width: SCREEN_W } = Dimensions.get('window');
const STROKE = FIELD_OUTLINE_COLOR;
const STROKE_W = FIELD_OUTLINE_WIDTH;
/** Inner content height inside outline stroke for fixed field rows */
const FIELD_INNER_H = FIELD_MIN_H - STROKE_W * 2;
const AUTO_PAY_ROW_H = 52;
const MUTED = 'rgba(0, 0, 0, 0.55)';
const BLOCK_AFTER_INTRO = 20;
const BLOCK_AFTER_CAROUSEL = 20;
const SECTION_LABEL_GAP = 10;
const OTHER_SECTION_TOP = 8;
const ROW_GAP = 10;
const CARD_R = 14;
const ADD_BTN_R = 4;
const LIST_ROW_R = 8;
/** Full-size center card */
const PRIMARY_CARD_H = 218;
/** Width of each scroll “page” (one card focus per screen) */
const CAROUSEL_SLOT_W = SCREEN_W - 28;
/** Center card at 1:1 scale — largest shown */
const PRIMARY_CARD_W = Math.min(350, CAROUSEL_SLOT_W - 8);
/** Side cards scale down (cover-flow style) */
const SIDE_CARD_SCALE = 0.82;
const SNAP = CAROUSEL_SLOT_W;
const CAROUSEL_SIDE_INSET = (SCREEN_W - CAROUSEL_SLOT_W) / 2;

function RoundedOutlineFrame({
  width,
  height,
  borderRadius,
}: {
  width: number;
  height: number;
  borderRadius: number;
}) {
  if (width <= 0 || height <= 0) return null;
  const inset = STROKE_W / 2;
  return (
    <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
      <Rect
        x={inset}
        y={inset}
        width={Math.max(0, width - STROKE_W)}
        height={Math.max(0, height - STROKE_W)}
        rx={borderRadius}
        ry={borderRadius}
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_W}
      />
    </Svg>
  );
}

function OutlineShell({
  borderRadius,
  children,
  minHeight,
  height,
  style,
  elevated,
}: {
  borderRadius: number;
  children: ReactNode;
  minHeight?: number;
  /** When set, fixes vertical size so the SVG outline matches the field box (recommended for TextInputs). */
  height?: number;
  style?: object;
  elevated?: boolean;
}) {
  const initialH = height ?? Math.max(minHeight ?? 0, 1);
  const [size, setSize] = useState({ w: 0, h: initialH });
  return (
    <View
      style={[
        styles.dashOuter,
        {
          borderRadius,
          minHeight: height ?? minHeight ?? undefined,
          height: height ?? undefined,
          overflow: elevated ? 'visible' : 'hidden',
        },
        elevated && styles.dashElevated,
        style,
      ]}
      collapsable={false}
      onLayout={(e) => {
        const { width, height: layoutH } = e.nativeEvent.layout;
        setSize({ w: Math.ceil(width), h: Math.ceil(layoutH) });
      }}>
      <RoundedOutlineFrame width={size.w} height={size.h} borderRadius={borderRadius} />
      {children}
    </View>
  );
}

function CardFace({ card }: { card: PaymentCardDisplay }) {
  return (
    <View style={[styles.cardFaceInner, { backgroundColor: card.color }]}>
      <View style={styles.cardTopRow}>
        <Text style={styles.visaMark}>VISA</Text>
        {card.isDefault ? (
          <View style={styles.defaultChip}>
            <Text style={styles.defaultChipText}>DEFAULT</Text>
          </View>
        ) : (
          <View style={styles.defaultChipSpacer} />
        )}
      </View>
      <View style={styles.cardNumberRow}>
        <Text style={styles.dotGroup}>••••</Text>
        <Text style={styles.dotGroup}>••••</Text>
        <Text style={styles.dotGroup}>••••</Text>
        <Text style={styles.last4}>{card.last4}</Text>
      </View>
      <View style={styles.cardBottomRow}>
        <View style={styles.holderCol}>
          <Text style={styles.cardMetaLabel}>Card Holder</Text>
          <Text style={styles.cardMetaVal}>{card.holder}</Text>
        </View>
        <View style={styles.expiresCol}>
          <Text style={styles.cardMetaLabel}>Expires</Text>
          <Text style={styles.cardMetaVal}>{card.expiry}</Text>
        </View>
      </View>
    </View>
  );
}

function PaginationDots({ count, active }: { count: number; active: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dot, i === active ? styles.dotOn : styles.dotOff]} />
      ))}
    </View>
  );
}

/** Layout for payment bottom sheets: cap sheet to ~92% of window; scroll area leaves room for pinned footer. */
function usePaymentSheetLayout() {
  const { height: wh } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetMaxH = Math.round(wh * 0.92);
  /** Pinned footer: paddingTop + border + button + paddingBottom (safe area). */
  const footerReserve = 12 + StyleSheet.hairlineWidth + APP_BUTTON_HEIGHT + Math.max(insets.bottom, 12) + 8;
  return {
    sheetMaxH,
    scrollMaxH: Math.max(160, sheetMaxH - footerReserve),
  };
}

type SheetMode = null | 'addCard' | 'invoice' | 'billing' | 'autopay';

type PaymentOtherSettings = {
  billing: BillingAddressFields;
  invoiceEmail: string;
  autoPay: string;
};

function truncateEmailForList(email: string) {
  return email.length <= 22 ? email : `${email.slice(0, 18)}…`;
}

function billingSummaryForList(b: BillingAddressFields) {
  const parts = [b.addressLine1, b.municipality, b.state].filter((x) => x.trim().length > 0);
  const line = parts.join(', ');
  if (!line) return 'Add address';
  return line.length <= 28 ? line : `${line.slice(0, 26)}…`;
}

function OtherRow({
  label,
  value,
  onPress,
  chevron = 'next',
}: {
  label: string;
  value: string;
  onPress?: () => void;
  chevron?: 'next' | 'down';
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
      <OutlineShell borderRadius={LIST_ROW_R} minHeight={56} style={styles.otherRowShell}>
        <View style={styles.otherRowInner}>
          <Text style={styles.otherLabel}>{label}</Text>
          <View style={styles.otherRight}>
            <Text style={styles.otherValue} numberOfLines={1}>
              {value}
            </Text>
            <FontAwesome
              name={chevron === 'down' ? 'chevron-down' : 'chevron-right'}
              size={12}
              color="rgba(0, 0, 0, 0.35)"
            />
          </View>
        </View>
      </OutlineShell>
    </Pressable>
  );
}

function SheetChrome({
  visible,
  onClose,
  dismissA11yLabel,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  dismissA11yLabel: string;
  children: ReactNode;
}) {
  const { sheetMaxH } = usePaymentSheetLayout();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.addCardModalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <View style={styles.addCardModalRoot}>
          {Platform.OS === 'web' ? (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: SCRIM_WEB }]} />
          ) : (
            <>
              <BlurView intensity={52} tint="light" style={StyleSheet.absoluteFillObject} />
              <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: SCRIM_OVERLAY }]} />
            </>
          )}
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => {
              Keyboard.dismiss();
              onClose();
            }}
            accessibilityLabel={dismissA11yLabel}
          />
          <View style={[styles.addCardSheet, { maxHeight: sheetMaxH }]}>
            <View style={styles.sheetFlexCol}>{children}</View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <>
      <View style={styles.sheetHandleWrap}>
        <View style={styles.sheetHandle} />
      </View>
      <View style={styles.addCardHeaderRow}>
        <View style={styles.addCardHeaderSide} />
        <Text style={styles.addCardTitle}>{title}</Text>
        <Pressable
          style={styles.addCardHeaderSide}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <FontAwesome name="times" size={20} color="#000000" />
        </Pressable>
      </View>
    </>
  );
}

function AddCardSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCardNumber('');
      setNameOnCard('');
      setExpiry('');
      setCvv('');
      setSetAsDefault(false);
    }
  }, [visible]);

  const submit = useCallback(() => {
    Keyboard.dismiss();
    Alert.alert('Add card', 'Card capture will connect to Stripe when billing is enabled.');
    onClose();
  }, [onClose]);

  const insets = useSafeAreaInsets();
  const { scrollMaxH } = usePaymentSheetLayout();

  return (
    <SheetChrome visible={visible} onClose={onClose} dismissA11yLabel="Dismiss add card">
      <View style={[styles.sheetScrollCap, { maxHeight: scrollMaxH }]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.addCardScrollContent}
          style={styles.sheetScrollInner}>
        <SheetHeader title="Add card" onClose={onClose} />

        <View style={styles.addCardFieldGap} />
              <Text style={styles.addCardFieldKicker}>CARD NUMBER</Text>
              <View style={styles.addCardKickerGap} />
              <OutlineShell
                borderRadius={FIELD_ROW_R}
                height={FIELD_MIN_H}
                style={styles.addCardFieldShell}>
                <View style={styles.addCardFieldInner}>
                  <TextInput
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="1234 1234 1234 1234"
                    placeholderTextColor={MUTED}
                    keyboardType="number-pad"
                    maxLength={19}
                    style={styles.addCardInput}
                    underlineColorAndroid="transparent"
                  />
                </View>
              </OutlineShell>

              <View style={styles.addCardBetweenFields} />
              <Text style={styles.addCardFieldKicker}>NAME ON CARD</Text>
              <View style={styles.addCardKickerGap} />
              <OutlineShell
                borderRadius={FIELD_ROW_R}
                height={FIELD_MIN_H}
                style={styles.addCardFieldShell}>
                <View style={styles.addCardFieldInner}>
                  <TextInput
                    value={nameOnCard}
                    onChangeText={setNameOnCard}
                    placeholder="John Lim"
                    placeholderTextColor={MUTED}
                    autoCapitalize="words"
                    style={styles.addCardInput}
                    underlineColorAndroid="transparent"
                  />
                </View>
              </OutlineShell>

              <View style={styles.addCardBetweenFields} />
              <View style={styles.addCardExpiryRow}>
                <View style={styles.addCardExpiryCol}>
                  <Text style={styles.addCardFieldKicker}>EXPIRY</Text>
                  <View style={styles.addCardKickerGap} />
                  <OutlineShell
                    borderRadius={FIELD_ROW_R}
                    height={FIELD_MIN_H}
                    style={styles.addCardFieldShell}>
                    <View style={styles.addCardFieldInner}>
                      <TextInput
                        value={expiry}
                        onChangeText={setExpiry}
                        placeholder="02 / 26"
                        placeholderTextColor={MUTED}
                        keyboardType="numbers-and-punctuation"
                        maxLength={7}
                        style={styles.addCardInput}
                        underlineColorAndroid="transparent"
                      />
                    </View>
                  </OutlineShell>
                </View>
                <View style={styles.addCardExpiryGap} />
                <View style={styles.addCardExpiryCol}>
                  <Text style={styles.addCardFieldKicker}>CVV</Text>
                  <View style={styles.addCardKickerGap} />
                  <OutlineShell
                    borderRadius={FIELD_ROW_R}
                    height={FIELD_MIN_H}
                    style={styles.addCardFieldShell}>
                    <View style={styles.addCardFieldInner}>
                      <TextInput
                        value={cvv}
                        onChangeText={setCvv}
                        placeholder="313"
                        placeholderTextColor={MUTED}
                        keyboardType="number-pad"
                        maxLength={4}
                        secureTextEntry
                        style={styles.addCardInput}
                        underlineColorAndroid="transparent"
                      />
                    </View>
                  </OutlineShell>
                </View>
              </View>

              <View style={styles.addCardBetweenFields} />
              <OutlineShell
                borderRadius={FIELD_ROW_R}
                minHeight={DEFAULT_ROW_MIN_H}
                style={styles.addCardFieldShell}>
                <View style={styles.addCardDefaultInner}>
                  <View style={styles.addCardDefaultTextCol}>
                    <Text style={styles.addCardDefaultTitle}>Set as default</Text>
                    <Text style={styles.addCardDefaultSub}>
                      Use this card for Commission and Referral Fee Payments
                    </Text>
                  </View>
                  <Switch
                    value={setAsDefault}
                    onValueChange={setSetAsDefault}
                    trackColor={{ false: '#e9e9ea', true: '#000000' }}
                    thumbColor="#fff"
                    ios_backgroundColor="#e9e9ea"
                  />
                </View>
              </OutlineShell>

              <Text style={styles.addCardSheetFooter}>
                Tokenized by Stripe. OMM never stores full card numbers.
              </Text>
        </ScrollView>
      </View>
      <View style={[styles.sheetFormFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton variant="filled" onPress={submit} textStyle={styles.sheetFooterBtnLabel} accessibilityLabel="Add card">
          Add card
        </AppButton>
      </View>
    </SheetChrome>
  );
}

function InvoiceDeliverySheet({
  visible,
  onClose,
  initialEmail,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initialEmail: string;
  onSave: (email: string) => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  useEffect(() => {
    if (visible) setEmail(initialEmail);
  }, [visible, initialEmail]);

  const save = useCallback(() => {
    Keyboard.dismiss();
    onSave(email.trim());
    onClose();
  }, [email, onSave, onClose]);

  const insets = useSafeAreaInsets();
  const { scrollMaxH } = usePaymentSheetLayout();

  return (
    <SheetChrome visible={visible} onClose={onClose} dismissA11yLabel="Dismiss invoice delivery">
      <View style={[styles.sheetScrollCap, { maxHeight: scrollMaxH }]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.addCardScrollContent}
          style={styles.sheetScrollInner}>
        <SheetHeader title="Invoice delivery" onClose={onClose} />
        <Text style={styles.sheetIntro}>Invoices will be emailed to this address as PDF.</Text>
        <Text style={styles.addCardFieldKicker}>EMAIL ADDRESS</Text>
        <View style={styles.addCardKickerGap} />
        <OutlineShell
          borderRadius={FIELD_ROW_R}
          height={FIELD_MIN_H}
          style={styles.addCardFieldShell}>
          <View style={styles.addCardFieldInner}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={MUTED}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.addCardInput}
              underlineColorAndroid="transparent"
            />
          </View>
        </OutlineShell>
      </ScrollView>
      </View>
      <View style={[styles.sheetFormFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton variant="filled" onPress={save} textStyle={styles.sheetFooterBtnLabel} accessibilityLabel="Save invoice delivery">
          Save
        </AppButton>
      </View>
    </SheetChrome>
  );
}

function BillingFieldRow({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View>
      <Text style={styles.addCardFieldKicker}>{label}</Text>
      <View style={styles.addCardKickerGap} />
      <OutlineShell
        borderRadius={FIELD_ROW_R}
        height={FIELD_MIN_H}
        style={styles.addCardFieldShell}>
        <View style={styles.addCardFieldInner}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={MUTED}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize ?? 'sentences'}
            style={styles.addCardInput}
            underlineColorAndroid="transparent"
          />
        </View>
      </OutlineShell>
    </View>
  );
}

function BillingAddressSheet({
  visible,
  onClose,
  initialBilling,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initialBilling: BillingAddressFields;
  onSave: (billing: BillingAddressFields) => void;
}) {
  const [form, setForm] = useState<BillingAddressFields>(initialBilling);

  useEffect(() => {
    if (visible) {
      setForm({ ...initialBilling });
    }
  }, [visible, initialBilling]);

  const patchField = (key: keyof BillingAddressFields) => (text: string) => {
    setForm((f) => ({ ...f, [key]: text }));
  };

  const save = useCallback(() => {
    Keyboard.dismiss();
    onSave({ ...form });
    onClose();
  }, [form, onSave, onClose]);

  const insets = useSafeAreaInsets();
  const { scrollMaxH } = usePaymentSheetLayout();

  return (
    <SheetChrome visible={visible} onClose={onClose} dismissA11yLabel="Dismiss billing address">
      <View style={[styles.sheetScrollCap, { maxHeight: scrollMaxH }]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.addCardScrollContent}
          style={styles.sheetScrollInner}>
        <SheetHeader title="Billing address" onClose={onClose} />
        <Text style={styles.sheetIntro}>This address appears on your invoices and tax documents.</Text>

        <BillingFieldRow
          label="ADDRESS LINE 1"
          value={form.addressLine1}
          onChangeText={patchField('addressLine1')}
          placeholder="e.g. Unit / level"
        />
        <View style={styles.addCardBetweenFields} />
        <BillingFieldRow
          label="ADDRESS LINE 2"
          value={form.addressLine2}
          onChangeText={patchField('addressLine2')}
          placeholder="Optional"
        />
        <View style={styles.addCardBetweenFields} />
        <BillingFieldRow
          label="STREET"
          value={form.street}
          onChangeText={patchField('street')}
          placeholder="Street name"
        />
        <View style={styles.addCardBetweenFields} />
        <BillingFieldRow
          label="STATE"
          value={form.state}
          onChangeText={patchField('state')}
          placeholder="State / region"
          autoCapitalize="characters"
        />
        <View style={styles.addCardBetweenFields} />
        <BillingFieldRow
          label="MUNICIPALITY"
          value={form.municipality}
          onChangeText={patchField('municipality')}
          placeholder="City or municipality"
        />
        <View style={styles.addCardBetweenFields} />
        <BillingFieldRow
          label="ZIP CODE"
          value={form.zipCode}
          onChangeText={patchField('zipCode')}
          placeholder="Postcode"
          keyboardType="number-pad"
        />
      </ScrollView>
      </View>
      <View style={[styles.sheetFormFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton variant="filled" onPress={save} textStyle={styles.sheetFooterBtnLabel} accessibilityLabel="Save billing address">
          Save
        </AppButton>
      </View>
    </SheetChrome>
  );
}

function AutoPaySheet({
  visible,
  onClose,
  initialValue,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (value: string) => void;
}) {
  const [selected, setSelected] = useState(initialValue);
  useEffect(() => {
    if (visible) {
      const opts = AUTO_PAY_OPTIONS as readonly string[];
      setSelected(opts.includes(initialValue) ? initialValue : AUTO_PAY_OPTIONS[0]);
    }
  }, [visible, initialValue]);

  const save = useCallback(() => {
    onSave(selected);
    onClose();
  }, [selected, onSave, onClose]);

  const insets = useSafeAreaInsets();
  const { scrollMaxH } = usePaymentSheetLayout();

  return (
    <SheetChrome visible={visible} onClose={onClose} dismissA11yLabel="Dismiss auto-pay">
      <View style={[styles.sheetScrollCap, { maxHeight: scrollMaxH }]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.addCardScrollContent}
          style={styles.sheetScrollInner}>
        <SheetHeader title="Auto-pay" onClose={onClose} />
        <Text style={styles.sheetIntro}>Choose whether referral fees are charged automatically when due.</Text>
        <View style={{ gap: ROW_GAP }}>
          {AUTO_PAY_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => setSelected(opt)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === opt }}
              accessibilityLabel={`Auto-pay ${opt}`}>
              <OutlineShell
                borderRadius={FIELD_ROW_R}
                height={AUTO_PAY_ROW_H}
                style={styles.addCardFieldShell}>
                <View style={styles.autoPayOptionInner}>
                  <Text style={styles.autoPayOptionLabel}>{opt}</Text>
                  {selected === opt ? (
                    <FontAwesome name="check" size={16} color="#000000" />
                  ) : (
                    <View style={styles.autoPayCheckSpacer} />
                  )}
                </View>
              </OutlineShell>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      </View>
      <View style={[styles.sheetFormFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton variant="filled" onPress={save} textStyle={styles.sheetFooterBtnLabel} accessibilityLabel="Save auto-pay">
          Save
        </AppButton>
      </View>
    </SheetChrome>
  );
}


export default function PaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState<SheetMode>(null);
  const [otherSettings, setOtherSettings] = useState<PaymentOtherSettings>({
    billing: { ...PAYMENT_METHOD_OTHER.billing },
    invoiceEmail: PAYMENT_METHOD_OTHER.invoiceEmail,
    autoPay: PAYMENT_METHOD_OTHER.autoPay,
  });
  const [activeCardIndex, setActiveCardIndex] = useState(1);
  const listRef = useRef<FlatList<PaymentCardDisplay>>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 55 }).current;

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const idx = viewableItems[0]?.index;
    if (idx != null) setActiveCardIndex(idx);
  }, []);

  const renderCard = useCallback(
    ({ item, index }: ListRenderItemInfo<PaymentCardDisplay>) => {
      const isPrimary = index === activeCardIndex;
      return (
        <View style={[styles.carouselSlot, { width: CAROUSEL_SLOT_W }]}>
          <View
            style={[
              styles.carouselCardScaleWrap,
              {
                width: PRIMARY_CARD_W,
                transform: [{ scale: isPrimary ? 1 : SIDE_CARD_SCALE }],
                opacity: isPrimary ? 1 : 0.93,
              },
            ]}>
            <CardFace card={item} />
          </View>
        </View>
      );
    },
    [activeCardIndex],
  );

  const keyExtractor = useCallback((item: PaymentCardDisplay) => item.id, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navSide} onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Payment method</Text>
        </View>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        style={styles.scrollFill}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <Text style={styles.intro}>
          Used for Commission and Referral Fee Payments. Commission payouts still go to your bank account.
        </Text>

        <View style={{ height: BLOCK_AFTER_INTRO }} />

        <Text style={styles.sectionKicker}>ACTIVE CARD</Text>
        <View style={{ height: SECTION_LABEL_GAP }} />

        <View style={styles.carouselClip}>
          <FlatList
            ref={listRef}
            data={PAYMENT_CARDS}
            horizontal
            showsHorizontalScrollIndicator={false}
            removeClippedSubviews={false}
            style={styles.carouselList}
            keyExtractor={keyExtractor}
            renderItem={renderCard}
            snapToInterval={SNAP}
            decelerationRate="fast"
            snapToAlignment="start"
            contentContainerStyle={[
              styles.carouselListContent,
              { paddingHorizontal: CAROUSEL_SIDE_INSET, paddingVertical: 20 },
            ]}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            getItemLayout={(_, index) => ({
              length: SNAP,
              offset: SNAP * index,
              index,
            })}
            initialScrollIndex={1}
            onScrollToIndexFailed={({ index }) => {
              setTimeout(() => listRef.current?.scrollToIndex({ index, animated: false }), 100);
            }}
          />
          <PaginationDots count={PAYMENT_CARDS.length} active={activeCardIndex} />
        </View>

        <View style={{ height: BLOCK_AFTER_CAROUSEL }} />

        <Pressable
          onPress={() => setSheet('addCard')}
          style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
          <OutlineShell borderRadius={ADD_BTN_R} minHeight={48} style={styles.addBtnShell}>
            <View style={styles.addBtnInner}>
              <Text style={styles.addBtnText}>ADD PAYMENT METHOD</Text>
            </View>
          </OutlineShell>
        </Pressable>

        <View style={{ height: OTHER_SECTION_TOP }} />

        <Text style={styles.sectionKicker}>OTHER</Text>
        <View style={{ height: SECTION_LABEL_GAP }} />

        <View style={{ gap: ROW_GAP }}>
          <OtherRow
            label="Billing address"
            value={billingSummaryForList(otherSettings.billing)}
            onPress={() => setSheet('billing')}
          />
          <OtherRow
            label="Invoice delivery"
            value={truncateEmailForList(otherSettings.invoiceEmail)}
            onPress={() => setSheet('invoice')}
          />
          <OtherRow
            label="Auto-pay"
            value={otherSettings.autoPay}
            chevron="down"
            onPress={() => setSheet('autopay')}
          />
        </View>

        <View style={{ height: 28 }} />

        <Text style={styles.footerNote}>Cards are tokenized by Stripe. OMM never stores full card numbers.</Text>
      </ScrollView>

      <AddCardSheet visible={sheet === 'addCard'} onClose={() => setSheet(null)} />
      <InvoiceDeliverySheet
        visible={sheet === 'invoice'}
        onClose={() => setSheet(null)}
        initialEmail={otherSettings.invoiceEmail}
        onSave={(invoiceEmail) => setOtherSettings((s) => ({ ...s, invoiceEmail }))}
      />
      <BillingAddressSheet
        visible={sheet === 'billing'}
        onClose={() => setSheet(null)}
        initialBilling={otherSettings.billing}
        onSave={(billing) => setOtherSettings((s) => ({ ...s, billing }))}
      />
      <AutoPaySheet
        visible={sheet === 'autopay'}
        onClose={() => setSheet(null)}
        initialValue={otherSettings.autoPay}
        onSave={(autoPay) => setOtherSettings((s) => ({ ...s, autoPay }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  navSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 27,
    textAlign: 'center',
  },
  scrollFill: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, backgroundColor: '#fff', paddingHorizontal: layout.screenGutter, paddingTop: 8 },
  intro: {
    fontSize: 14,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 21,
  },
  sectionKicker: {
    fontSize: 10,
    fontWeight: '400',
    color: MUTED,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    lineHeight: 15,
    marginLeft: 1,
  },
  carouselClip: {
    marginHorizontal: -layout.screenGutter,
    overflow: 'visible',
    backgroundColor: '#fff',
  },
  carouselList: { backgroundColor: '#fff' },
  carouselListContent: { backgroundColor: '#fff' },
  carouselSlot: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  carouselCardScaleWrap: {
    alignSelf: 'center',
  },
  dashOuter: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  dashElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  cardFaceInner: {
    width: '100%',
    borderRadius: CARD_R,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: PRIMARY_CARD_H,
  },
  defaultChipSpacer: {
    width: 102,
    minHeight: 32,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  visaMark: {
    fontSize: 22,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 3,
  },
  defaultChip: {
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 16,
  },
  defaultChipText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 0.28,
  },
  cardNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingRight: 2,
  },
  dotGroup: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.58)',
    letterSpacing: 1.8,
  },
  last4: {
    fontSize: 17,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 1.2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  holderCol: { flex: 1, paddingRight: 12 },
  expiresCol: { alignItems: 'flex-end' },
  cardMetaLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(255,255,255,0.62)',
    marginBottom: 5,
    letterSpacing: 0.15,
  },
  cardMetaVal: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    lineHeight: 21,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: layout.screenGutter,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOn: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  dotOff: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  addBtnShell: {
    width: '100%',
  },
  addBtnInner: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    margin: STROKE_W,
  },
  addBtnText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  otherRowShell: {
    width: '100%',
  },
  otherRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 52,
    paddingVertical: 12,
    margin: STROKE_W,
  },
  otherLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 21,
    paddingRight: 10,
  },
  otherRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '58%',
  },
  otherValue: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 21,
    textAlign: 'right',
    flexShrink: 1,
  },
  footerNote: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: MUTED,
    lineHeight: 18,
    textAlign: 'center',
    letterSpacing: 0.11,
    paddingHorizontal: 8,
  },
  addCardModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  addCardSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: ADD_CARD_SHEET_R,
    borderTopRightRadius: ADD_CARD_SHEET_R,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.14)',
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  sheetFlexCol: {
    flexDirection: 'column',
    width: '100%',
  },
  sheetScrollCap: {
    width: '100%',
    alignSelf: 'stretch',
  },
  sheetScrollInner: {
    width: '100%',
  },
  sheetFormFooter: {
    flexShrink: 0,
    paddingTop: 12,
    paddingHorizontal: layout.screenGutter,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
    backgroundColor: '#fff',
  },
  sheetFooterBtnLabel: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  addCardScrollContent: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 4,
    paddingBottom: 12,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  addCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  addCardHeaderSide: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
    textAlign: 'center',
    lineHeight: 22,
  },
  sheetIntro: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 13,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 19,
    letterSpacing: 0.08,
  },
  addCardFieldGap: { height: 4 },
  addCardFieldKicker: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: MUTED,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  addCardKickerGap: { height: 8 },
  addCardFieldShell: {
    width: '100%',
  },
  addCardFieldInner: {
    margin: STROKE_W,
    paddingHorizontal: 16,
    height: FIELD_INNER_H,
    justifyContent: 'center',
  },
  addCardInput: {
    width: '100%',
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 22,
    paddingVertical: Platform.OS === 'ios' ? 2 : 0,
    margin: 0,
    ...(Platform.OS === 'android'
      ? { textAlignVertical: 'center' as const, includeFontPadding: false }
      : {}),
  },
  autoPayOptionInner: {
    margin: STROKE_W,
    paddingHorizontal: 16,
    height: AUTO_PAY_ROW_H - STROKE_W * 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoPayOptionLabel: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
  },
  autoPayCheckSpacer: {
    width: 16,
    height: 16,
  },
  addCardBetweenFields: { height: 18 },
  addCardExpiryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addCardExpiryCol: {
    flex: 1,
    minWidth: 0,
  },
  addCardExpiryGap: { width: 10 },
  addCardDefaultInner: {
    margin: STROKE_W,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: DEFAULT_ROW_MIN_H - STROKE_W * 2,
  },
  addCardDefaultTextCol: {
    flex: 1,
    minWidth: 0,
  },
  addCardDefaultTitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    marginBottom: 6,
  },
  addCardDefaultSub: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
    lineHeight: 17,
    letterSpacing: 0.1,
  },
  addCardBeforeCta: { height: 20 },
  addCardCta: {
    backgroundColor: '#000000',
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  addCardCtaLabel: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  addCardSheetFooter: {
    marginTop: 18,
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: MUTED,
    textAlign: 'center',
    letterSpacing: 0.08,
    lineHeight: 16,
    paddingHorizontal: 0,
    alignSelf: 'stretch',
    paddingBottom: 4,
  },
});
