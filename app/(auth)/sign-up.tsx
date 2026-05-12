import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { LegalDocModal } from '@/components/LegalDocModal';
import { setAuthenticated, setUserRole, type StoredUserRole } from '@/lib/auth-session';
import { FIELD_OUTLINE_COLOR } from '@/lib/field-outline';
import { LEGAL_PRIVACY_BODY, LEGAL_TERMS_SIGNUP_MODAL_BODY } from '@/lib/legal-docs';

const REFERRAL_BODY = `Draft for counsel. This Agency Referral Agreement covers referral or co-agency fees, GST treatment, disclosure expectations, and your obligation to record fees, confirmations, and trail items within OMM to support a Victorian compliance record.`;

const ROLE_OPTIONS = ['Real Estate Agent', 'Buyer Agent', 'Vendor Agent'] as const;
const STATE_OPTIONS = ['Victoria', 'New South Wales', 'Queensland', 'South Australia', 'Western Australia', 'Tasmania', 'Australian Capital Territory', 'Northern Territory'] as const;
const MUNICIPALITY_OPTIONS = [
  'Boroondara',
  'Stonnington',
  'Melbourne',
  'Yarra',
  'Port Phillip',
  'Bayside',
  'Glen Eira',
  'Monash',
  'Whitehorse',
  'Manningham',
  'Maribyrnong',
  'Moonee Valley',
  'Merri-bek',
  'Darebin',
  'Kingston',
  'Frankston',
  'Casey',
  'Cardinia',
  'Mornington Peninsula',
  'Hobsons Bay',
  'Wyndham',
  'Melton',
  'Hume',
  'Whittlesea',
  'Nillumbik',
  'Knox',
  'Maroondah',
  'Greater Dandenong',
  'Yarra Ranges',
  'Brimbank',
  'Greater Geelong',
  'Ballarat',
  'Bendigo',
] as const;

type LegalKey = 'terms' | 'privacy' | 'referral' | null;

function FormField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry,
  autoCapitalize = 'sentences',
  autoComplete,
  right,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences';
  autoComplete?: 'email' | 'tel' | 'password' | 'name-given' | 'name-family' | 'password-new';
  right?: ReactNode;
  placeholder?: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          style={[styles.input, right ? styles.inputWithRight : undefined]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          placeholder={placeholder}
          placeholderTextColor="rgba(0, 0, 0, 0.45)"
        />
        {right}
      </View>
    </View>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select',
  formatDisplay,
}: {
  label: string;
  value: string;
  options: readonly T[];
  onSelect: (v: T) => void;
  placeholder?: string;
  formatDisplay?: (v: T) => string;
}) {
  const [open, setOpen] = useState(false);
  const display = (value ? formatDisplay?.(value as T) ?? value : '') || '';

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.selectPressable}
        accessibilityRole="button"
        accessibilityHint="Opens list of options">
        <Text style={[styles.selectValue, !value && styles.selectPlaceholder]} numberOfLines={1}>
          {display || placeholder}
        </Text>
        <FontAwesome name="chevron-down" size={14} color="#000000" />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.selectModalRoot}>
          <Pressable style={styles.selectModalBackdrop} onPress={() => setOpen(false)} />
          <View style={styles.selectSheet}>
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.selectSheetScroll}>
              {options.map((opt) => (
                <Pressable
                  key={opt}
                  style={({ pressed }) => [styles.selectOption, pressed && styles.pressed]}
                  onPress={() => {
                    onSelect(opt);
                    setOpen(false);
                  }}>
                  <Text style={styles.selectOptionText}>{formatDisplay?.(opt) ?? opt}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MunicipalityMultiSelectField({
  label,
  selected,
  options,
  onChangeSelected,
  placeholder = 'COUNCIL',
}: {
  label: string;
  selected: readonly string[];
  options: readonly string[];
  onChangeSelected: (next: string[]) => void;
  placeholder?: string;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...options];
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChangeSelected(selected.filter((x) => x !== opt));
    } else {
      onChangeSelected([...selected, opt]);
    }
  };

  const summary =
    selected.length === 0 ? '' : selected.map((s) => s.toUpperCase()).join(', ');

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.selectPressable}
        accessibilityRole="button"
        accessibilityHint="Opens searchable list. You can select multiple councils.">
        <Text
          style={[styles.selectValue, selected.length === 0 && styles.selectPlaceholder]}
          numberOfLines={3}>
          {summary || placeholder}
        </Text>
        <FontAwesome name="chevron-down" size={14} color="#000000" />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.selectModalRoot}>
          <Pressable style={styles.selectModalBackdrop} onPress={() => setOpen(false)} />
          <View style={[styles.multiSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <Text style={styles.multiSheetTitle}>Municipalities</Text>
            <View style={styles.searchShell}>
              <FontAwesome name="search" size={14} color="rgba(0,0,0,0.45)" />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search e.g. Boroondara"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.multiSheetScroll}>
              {filtered.map((opt) => {
                const isOn = selected.includes(opt);
                return (
                  <Pressable
                    key={opt}
                    style={({ pressed }) => [styles.multiOptionRow, pressed && styles.pressed]}
                    onPress={() => toggle(opt)}>
                    <Text style={styles.multiOptionText}>{opt.toUpperCase()}</Text>
                    {isOn ? (
                      <FontAwesome name="check" size={18} color="#000000" />
                    ) : (
                      <View style={styles.multiOptionCheckSpacer} />
                    )}
                  </Pressable>
                );
              })}
              {filtered.length === 0 ? (
                <Text style={styles.multiEmpty}>No councils match your search.</Text>
              ) : null}
            </ScrollView>
            <Pressable
              style={({ pressed }) => [styles.multiDoneBtn, pressed && styles.pressed]}
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Done selecting municipalities">
              <Text style={styles.multiDoneBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

const AUTH_PAD_H = 28;

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<1 | 2>(1);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeLegal, setAgreeLegal] = useState(false);
  const [agreeReferral, setAgreeReferral] = useState(false);
  const [legalOpen, setLegalOpen] = useState<LegalKey>(null);

  const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number] | ''>('');
  const [stateAus, setStateAus] = useState<(typeof STATE_OPTIONS)[number] | ''>('');
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [agencyName, setAgencyName] = useState('');

  const canStep1 =
    !!firstName &&
    !!lastName &&
    !!email &&
    !!phone &&
    !!password &&
    agreeLegal &&
    agreeReferral;
  const canStep2 = !!role && !!stateAus && municipalities.length > 0 && !!agencyName.trim();

  const goNext = async () => {
    if (step === 1 && canStep1) setStep(2);
    else if (step === 2 && canStep2) {
      await setUserRole(role as StoredUserRole);
      await setAuthenticated();
      router.replace('/(tabs)');
    }
  };

  const primaryDisabled = step === 1 ? !canStep1 : !canStep2;

  const primaryLabel = step === 1 ? 'Continue' : 'Sign Up';

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scrollPad, { paddingBottom: insets.bottom + 28 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {step === 2 ? (
          <Pressable
            style={styles.backRow}
            onPress={() => setStep(1)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <FontAwesome name="chevron-left" size={16} color="#000000" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}

        <Text style={styles.step}>{step === 1 ? 'STEP 01' : 'STEP 02'}</Text>
        <Text style={styles.screenTitle}>
          {step === 1 ? 'Create your account' : 'Your role & location'}
        </Text>

        {step === 1 ? (
          <>
            <FormField
              label="FIRST NAME *"
              value={firstName}
              onChangeText={setFirstName}
              autoComplete="name-given"
              placeholder="Sam"
            />
            <FormField
              label="LAST NAME *"
              value={lastName}
              onChangeText={setLastName}
              autoComplete="name-family"
              placeholder="Taylor"
            />
            <FormField
              label="WORK EMAIL *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="you@company.com"
            />
            <FormField
              label="PHONE NUMBER *"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="0412 345 678"
            />
            <FormField
              label="PASSWORD *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              placeholder="StrongPass123"
              right={
                <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                  <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={18} color="#000000" />
                </Pressable>
              }
            />

            <View style={styles.checkboxRow}>
              <Pressable
                onPress={() => setAgreeLegal((v) => !v)}
                style={[styles.checkbox, agreeLegal && styles.checkboxOn]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreeLegal }}>
                {agreeLegal ? <FontAwesome name="check" size={11} color="#000000" /> : null}
              </Pressable>
              <Text style={styles.checkboxText}>
                I agree to the{' '}
                <Text style={styles.link} onPress={() => setLegalOpen('terms')}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={styles.link} onPress={() => setLegalOpen('privacy')}>
                  Privacy Policy
                </Text>
              </Text>
            </View>

            <View style={styles.checkboxRow}>
              <Pressable
                onPress={() => setAgreeReferral((v) => !v)}
                style={[styles.checkbox, agreeReferral && styles.checkboxOn]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreeReferral }}>
                {agreeReferral ? <FontAwesome name="check" size={11} color="#000000" /> : null}
              </Pressable>
              <Text style={styles.checkboxText}>
                I have read and accepted the{' '}
                <Text style={styles.link} onPress={() => setLegalOpen('referral')}>
                  Agency Referral Agreement
                </Text>
              </Text>
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <SelectField
              label="YOUR ROLE *"
              value={role}
              options={ROLE_OPTIONS}
              onSelect={setRole}
              placeholder="REAL ESTATE AGENT"
              formatDisplay={(r) =>
                r
                  .split(' ')
                  .map((w) => w.toUpperCase())
                  .join(' ')
              }
            />
            <Text style={styles.helper}>Pick Real Estate Agent, Buyer Agent, or Vendor Agent.</Text>

            <SectionLabel>LOCATION</SectionLabel>
            <SelectField
              label="STATE *"
              value={stateAus}
              options={STATE_OPTIONS}
              onSelect={setStateAus}
              placeholder="VICTORIA"
              formatDisplay={(s) => s.toUpperCase()}
            />
            <MunicipalityMultiSelectField
              label="MUNICIPALITIES *"
              selected={municipalities}
              options={MUNICIPALITY_OPTIONS}
              onChangeSelected={setMunicipalities}
              placeholder="BOROONDARA, STONNINGTON"
            />
            <Text style={styles.helper}>Search councils and select one or more municipalities.</Text>

            <FormField
              label="AGENCY NAME *"
              value={agencyName}
              onChangeText={setAgencyName}
              placeholder="MATCH Residential"
            />
          </>
        ) : null}

        <AppButton variant="filled" style={{ marginTop: 16 }} disabled={primaryDisabled} onPress={goNext}>
          {primaryLabel}
        </AppButton>

        {step === 1 ? (
          <View style={styles.footerCenter}>
            <Text style={styles.footerMuted}>Already have an account? </Text>
            <Link href="/sign-in" asChild>
              <Pressable>
                <Text style={styles.footerBold}>Sign in</Text>
              </Pressable>
            </Link>
          </View>
        ) : null}

        <View style={styles.supportRow}>
          <Text style={styles.supportMuted}>Need help? </Text>
          <Text style={styles.link} onPress={() => router.push('/(auth)/contact-support')}>
            Contact support
          </Text>
        </View>
      </ScrollView>

      <LegalDocModal
        visible={legalOpen === 'terms'}
        title="Terms of Service"
        body={LEGAL_TERMS_SIGNUP_MODAL_BODY}
        onClose={() => setLegalOpen(null)}
      />
      <LegalDocModal
        visible={legalOpen === 'privacy'}
        title="Privacy Policy"
        body={LEGAL_PRIVACY_BODY}
        onClose={() => setLegalOpen(null)}
      />
      <LegalDocModal
        visible={legalOpen === 'referral'}
        title="Agency Referral Agreement"
        body={REFERRAL_BODY}
        onClose={() => setLegalOpen(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scrollPad: { paddingHorizontal: AUTH_PAD_H, paddingTop: 8 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backText: { fontSize: 15, fontFamily: 'Satoshi-Medium', color: '#000000' },
  step: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: 'rgba(26,26,26,0.96)', marginBottom: 6 },
  screenTitle: { fontSize: 24, fontFamily: 'Satoshi-Medium', color: 'rgba(26,26,26,0.96)', marginBottom: 20, lineHeight: 30 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: '#636366',
    letterSpacing: 1.2,
    marginTop: 4,
    marginBottom: 10,
    marginLeft: 2,
  },
  helper: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.75)',
    marginTop: -10,
    marginBottom: 18,
    marginLeft: 2,
  },
  fieldBlock: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    color: '#636366',
    letterSpacing: 0.1,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  inputShell: { position: 'relative' },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: FIELD_OUTLINE_COLOR,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(26,26,26,0.96)',
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  inputWithRight: { paddingRight: 44 },
  selectPressable: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: FIELD_OUTLINE_COLOR,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  selectValue: { flex: 1, fontSize: 14, fontFamily: 'Satoshi-Medium', color: 'rgba(26,26,26,0.96)' },
  selectPlaceholder: { color: 'rgba(0, 0, 0, 0.45)' },
  selectModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  selectModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  selectSheet: {
    marginHorizontal: 16,
    marginBottom: 24,
    maxHeight: '56%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectSheetScroll: { maxHeight: 360 },
  multiSheet: {
    marginHorizontal: 16,
    marginBottom: 24,
    maxHeight: '72%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  multiSheetTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    marginBottom: 12,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: FIELD_OUTLINE_COLOR,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(26,26,26,0.96)',
    padding: 0,
    minHeight: 22,
  },
  multiSheetScroll: { maxHeight: 300 },
  multiOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
  },
  multiOptionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    paddingRight: 12,
  },
  multiOptionCheckSpacer: { width: 18 },
  multiEmpty: {
    paddingVertical: 28,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.55)',
  },
  multiDoneBtn: {
    marginTop: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#000000',
  },
  multiDoneBtnText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#ffffff',
  },
  selectOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
  },
  selectOptionText: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#000000' },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
    maxWidth: '100%',
  },
  checkbox: {
    width: 13,
    height: 13,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxOn: { backgroundColor: '#ffffff' },
  checkboxText: { flex: 1, fontSize: 12, fontFamily: 'Satoshi-Medium', color: 'rgba(26,26,26,0.96)', lineHeight: 20 },
  link: { textDecorationLine: 'underline', fontFamily: 'Satoshi-Medium' },
  pressed: { opacity: 0.9 },
  footerCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    flexWrap: 'wrap',
    gap: 4,
  },
  footerMuted: { fontSize: 14, color: 'rgba(26,26,26,0.88)' },
  footerBold: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#000000' },
  supportRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' },
  supportMuted: { fontSize: 13, color: 'rgba(26,26,26,0.96)' },
});
