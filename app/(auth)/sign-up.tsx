import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Text } from '@/components/OMMText';
import { TextInput } from '@/components/OMMTextInput';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { LegalDocModal } from '@/components/LegalDocModal';
import { clearAuthenticated } from '@/lib/auth-session';
import { LEGAL_PRIVACY_BODY, LEGAL_TERMS_SIGNUP_MODAL_BODY } from '@/lib/legal-docs';

const REFERRAL_BODY = `Draft for counsel. This Agency Referral Agreement covers referral or co-agency fees, GST treatment, disclosure expectations, and your obligation to record fees, confirmations, and trail items within OMM to support a Victorian compliance record.`;

const ROLE_OPTIONS = ['Listing Agent', 'Buyers Agent', 'Buyer'] as const;
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
] as const;
const GOV_ID_OPTIONS = ['Driver licence', 'Passport', 'Other'] as const;

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

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

const AUTH_PAD_H = 28;

function TrackerRow({
  label,
  status,
}: {
  label: string;
  status: 'done' | 'current' | 'pending';
}) {
  return (
    <View style={styles.trackerRow}>
      {status === 'done' ? (
        <View style={styles.trackerDotFilled} />
      ) : status === 'current' ? (
        <View style={styles.trackerDotRing} />
      ) : (
        <View style={styles.trackerDotMuted} />
      )}
      <Text
        style={[styles.trackerLabel, status === 'pending' && styles.trackerLabelMuted]}
        numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function UploadSlot({
  label,
  meta,
  fileName,
  onPick,
}: {
  label: string;
  meta: string;
  fileName: string | null;
  onPick: () => void;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        onPress={onPick}
        style={({ pressed }) => [styles.uploadZone, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={label}>
        <View style={styles.uploadIconWrap}>
          <FontAwesome name="file-o" size={24} color="#aeaeb2" />
        </View>
        <Text style={styles.uploadFileName} numberOfLines={1}>
          {fileName ?? 'Tap to choose a file'}
        </Text>
        <Text style={styles.uploadMeta}>{meta}</Text>
      </Pressable>
    </View>
  );
}

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

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
  const [municipality, setMunicipality] = useState<(typeof MUNICIPALITY_OPTIONS)[number] | ''>('');
  const [agencyName, setAgencyName] = useState('');

  const [govIdType, setGovIdType] = useState<(typeof GOV_ID_OPTIONS)[number] | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [licenceExpiry, setLicenceExpiry] = useState('');
  const [idDocName, setIdDocName] = useState<string | null>(null);
  const [licenceDocName, setLicenceDocName] = useState<string | null>(null);

  const canStep1 =
    !!firstName &&
    !!lastName &&
    !!email &&
    !!phone &&
    !!password &&
    agreeLegal &&
    agreeReferral;
  const canStep2 = !!role && !!stateAus && !!municipality && !!agencyName.trim();
  const canStep3 =
    !!govIdType &&
    !!dateOfBirth.trim() &&
    !!licenceNumber.trim() &&
    !!licenceExpiry.trim() &&
    !!idDocName &&
    !!licenceDocName;

  const goNext = () => {
    if (step === 1 && canStep1) setStep(2);
    else if (step === 2 && canStep2) setStep(3);
    else if (step === 3 && canStep3) setStep(4);
  };

  const primaryDisabled =
    step === 1 ? !canStep1 : step === 2 ? !canStep2 : step === 3 ? !canStep3 : true;

  const primaryLabel = step === 1 ? 'Continue' : step === 2 ? 'Sign Up' : 'SUBMIT FOR VERIFICATION';

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scrollPad, { paddingBottom: insets.bottom + 28 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {step > 1 && step < 4 ? (
          <Pressable
            style={styles.backRow}
            onPress={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s))}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <FontAwesome name="chevron-left" size={16} color="#000000" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}

        <Text style={styles.step}>
          {step === 1 ? 'STEP 01' : step === 2 ? 'STEP 02' : step === 3 ? 'STEP 03' : 'STEP 04'}
        </Text>
        <Text style={styles.screenTitle}>
          {step === 1
            ? 'Create your account'
            : step === 2
              ? 'Your role & location'
              : step === 3
                ? 'Identity & documents'
                : 'Verification in progress'}
        </Text>

        {step === 1 ? (
          <>
            <FormField label="FIRST NAME *" value={firstName} onChangeText={setFirstName} autoComplete="name-given" />
            <FormField label="LAST NAME *" value={lastName} onChangeText={setLastName} autoComplete="name-family" />
            <FormField
              label="EMAIL ADDRESS *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <FormField
              label="PHONE NUMBER *"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <FormField
              label="PASSWORD *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
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
              placeholder="ROLE"
              formatDisplay={(r) =>
                r
                  .split(' ')
                  .map((w) => w.toUpperCase())
                  .join(' ')
              }
            />
            <Text style={styles.helper}>Pick Listing Agent, Buyers Agent, or Buyer.</Text>

            <SectionLabel>LOCATION</SectionLabel>
            <View style={styles.row2}>
              <View style={styles.row2Item}>
                <SelectField
                  label="STATE *"
                  value={stateAus}
                  options={STATE_OPTIONS}
                  onSelect={setStateAus}
                  placeholder="STATE"
                  formatDisplay={(s) => s.toUpperCase()}
                />
              </View>
              <View style={styles.row2Item}>
                <SelectField
                  label="MUNICIPALITY *"
                  value={municipality}
                  options={MUNICIPALITY_OPTIONS}
                  onSelect={setMunicipality}
                  placeholder="COUNCIL"
                  formatDisplay={(m) => m.toUpperCase()}
                />
              </View>
            </View>

            <FormField label="AGENCY NAME *" value={agencyName} onChangeText={setAgencyName} />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <SelectField
              label="GOVT ID TYPE *"
              value={govIdType}
              options={GOV_ID_OPTIONS}
              onSelect={setGovIdType}
            />
            <FormField
              label="DATE OF BIRTH *"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="DD / MM / YYYY"
            />
            <FormField label="DRIVER LICENCE NUMBER *" value={licenceNumber} onChangeText={setLicenceNumber} />
            <FormField
              label="EXPIRY DATE *"
              value={licenceExpiry}
              onChangeText={setLicenceExpiry}
              placeholder="DD / MM / YYYY"
            />

            <UploadSlot
              label="UPLOAD DOCUMENT *"
              meta="MAXIMUM FILE SIZE 10MB"
              fileName={idDocName}
              onPick={() => setIdDocName('john_lim_dl_front.jpg')}
            />
            <UploadSlot
              label="REAL ESTATE LICENCE *"
              meta="AGENTS ONLY • MAX 10MB"
              fileName={licenceDocName}
              onPick={() => setLicenceDocName('realestate_licence.pdf')}
            />

            <Text style={styles.processNote}>Process Time: 24–48 Business Hours.</Text>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <FontAwesome name="hourglass-o" size={36} color="#000000" style={styles.verifyIcon} />
            <Text style={styles.verifyLead}>
              OMM is exclusive to verified agents. We will notify you when your application has been approved and
              access is enabled.
            </Text>
            <View style={styles.trackerBox}>
              <TrackerRow label="Application submitted" status="done" />
              <TrackerRow label="Documents being reviewed" status="current" />
              <TrackerRow label="Account approved" status="pending" />
            </View>
            <View style={styles.timelineRow}>
              <FontAwesome name="clock-o" size={16} color="rgba(0, 0, 0, 0.75)" />
              <Text style={styles.timelineText}>Typically 24–48 business hours.</Text>
            </View>
            <AppButton
              variant="filled"
              style={{ marginTop: 16 }}
              onPress={() => router.push('/(auth)/contact-support')}>
              Contact support
            </AppButton>
            <Pressable
              style={styles.signOutBtn}
              onPress={async () => {
                await clearAuthenticated();
                router.replace('/welcome');
              }}
              accessibilityRole="button">
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </>
        ) : (
          <AppButton
            variant="filled"
            style={{ marginTop: 16 }}
            disabled={primaryDisabled}
            onPress={goNext}
            textStyle={step === 3 ? { letterSpacing: 0.8, fontSize: 13 } : undefined}>
            {primaryLabel}
          </AppButton>
        )}

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

        {step < 4 ? (
          <View style={styles.supportRow}>
            <Text style={styles.supportMuted}>Need help? </Text>
            <Text style={styles.link} onPress={() => router.push('/(auth)/contact-support')}>
              Contact support
            </Text>
          </View>
        ) : null}
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
  row2: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  row2Item: { flex: 1, minWidth: 0 },
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
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 14,
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
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 14,
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
  uploadZone: {
    minHeight: 120,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    gap: 8,
  },
  uploadIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadFileName: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: '#3a3a3c', textAlign: 'center' },
  uploadMeta: { fontSize: 10, fontFamily: 'Satoshi-Medium', color: 'rgba(0, 0, 0, 0.65)', letterSpacing: 0.4 },
  processNote: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.85)',
    textAlign: 'center',
    marginTop: -6,
    marginBottom: 8,
  },
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
  verifyIcon: { alignSelf: 'center', marginTop: 8, marginBottom: 20 },
  verifyLead: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(26,26,26,0.88)',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 22,
  },
  trackerBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
    gap: 16,
  },
  trackerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trackerDotFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
  },
  trackerDotRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#fff',
  },
  trackerDotMuted: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#d1d1d6',
  },
  trackerLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    lineHeight: 20,
  },
  trackerLabelMuted: { color: 'rgba(0, 0, 0, 0.55)', fontFamily: 'Satoshi-Medium' },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 22,
  },
  timelineText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: 'rgba(0, 0, 0, 0.85)',
  },
  signOutBtn: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  signOutText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#000000',
    textDecorationLine: 'underline',
  },
});
