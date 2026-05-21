import { useClerk, useSignUp } from "@clerk/expo";
import { Text } from "@/components/OMMText";
import { TextInput } from "@/components/OMMTextInput";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, useRouter } from "expo-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { LegalDocModal } from "@/components/LegalDocModal";
import {
  clerkFieldError,
  clerkFinalizeNavigate,
  clerkIncompleteAuthMessage,
  clerkSignUpProfileParams,
  syncClerkSignUpProfile,
} from "@/lib/clerk-auth";
import { setUserRole, type StoredUserRole } from "@/lib/auth-session";
import {
  LEGAL_PRIVACY_BODY,
  LEGAL_TERMS_SIGNUP_MODAL_BODY,
} from "@/lib/legal-docs";
import { fieldShell } from "@/components/list-add/flow-shared";
import { accent } from "@/constants/theme";
import { isPermittedWorkEmail, workEmailValidationMessage } from "@/lib/work-email";

const REFERRAL_BODY = `Draft for counsel. This Agency Referral Agreement covers referral or co-agency fees, GST treatment, disclosure expectations, and your obligation to record fees, confirmations, and trail items within OMM to support a Victorian compliance record.`;

/** iOS-like filled controls (system gray 6) */
const FIELD_FILL = "#F2F2F7";
const SEPARATOR = "rgba(60, 60, 67, 0.29)";
const ROLE_OPTIONS = [
  "Real Estate Agent",
  "Buyer Agent",
  "Vendor advocate",
] as const;
const STATE_OPTIONS = [
  "Victoria",
  "New South Wales",
  "Queensland",
  "South Australia",
  "Western Australia",
  "Tasmania",
  "Australian Capital Territory",
  "Northern Territory",
] as const;
const MUNICIPALITY_OPTIONS = [
  "Boroondara",
  "Stonnington",
  "Melbourne",
  "Yarra",
  "Port Phillip",
  "Bayside",
  "Glen Eira",
  "Monash",
  "Whitehorse",
  "Manningham",
  "Maribyrnong",
  "Moonee Valley",
  "Merri-bek",
  "Darebin",
  "Kingston",
  "Frankston",
  "Casey",
  "Cardinia",
  "Mornington Peninsula",
  "Hobsons Bay",
  "Wyndham",
  "Melton",
  "Hume",
  "Whittlesea",
  "Nillumbik",
  "Knox",
  "Maroondah",
  "Greater Dandenong",
  "Yarra Ranges",
  "Brimbank",
  "Greater Geelong",
  "Ballarat",
  "Bendigo",
] as const;

type LegalKey = "terms" | "privacy" | "referral" | null;

function FormField({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry,
  autoCapitalize = "sentences",
  autoComplete,
  right,
  placeholder,
  errorMessage,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences";
  autoComplete?:
    | "email"
    | "tel"
    | "password"
    | "name-given"
    | "name-family"
    | "password-new";
  right?: ReactNode;
  placeholder?: string;
  errorMessage?: string;
  maxLength?: number;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          style={[
            styles.input,
            right ? styles.inputWithRight : undefined,
            errorMessage ? styles.inputInvalid : undefined,
          ]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          placeholder={placeholder}
          placeholderTextColor="rgba(0, 0, 0, 0.45)"
          maxLength={maxLength}
        />
        {right}
      </View>
      {errorMessage ? (
        <Text style={styles.fieldError}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select",
  sheetTitle,
  formatDisplay,
}: {
  label: string;
  value: string;
  options: readonly T[];
  onSelect: (v: T) => void;
  placeholder?: string;
  sheetTitle?: string;
  formatDisplay?: (v: T) => string;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const displayFn = formatDisplay ?? ((v: T) => String(v));
  const display = value ? displayFn(value as T) : "";

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.listingSelectRow, fieldShell]}
        accessibilityRole="button"
        accessibilityHint="Opens list of options"
      >
        <Text
          style={[styles.selectValue, !value && styles.selectPlaceholder]}
          numberOfLines={1}
        >
          {display || placeholder}
        </Text>
        <FontAwesome name="chevron-down" size={12} color="rgba(0, 0, 0, 0.55)" />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.selectModalRoot}>
          <Pressable
            style={styles.selectModalBackdrop}
            onPress={() => setOpen(false)}
          />
          <View
            style={[
              styles.selectSheet,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>
                {sheetTitle ?? label.replace(/\s*\*?\s*$/, "")}
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Done"
              >
                <Text style={styles.sheetDone}>Done</Text>
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={styles.selectSheetScroll}
              bounces
            >
              {options.map((opt, idx) => {
                const isSel = value === opt;
                return (
                  <Pressable
                    key={opt}
                    style={[
                      styles.selectOption,
                      idx === options.length - 1 && styles.selectOptionLast,
                    ]}
                    onPress={() => {
                      onSelect(opt);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        isSel && styles.selectOptionTextSelected,
                      ]}
                    >
                      {displayFn(opt)}
                    </Text>
                    {isSel ? (
                      <FontAwesome name="check" size={16} color="#007AFF" />
                    ) : (
                      <View style={styles.selectCheckSpacer} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SearchableMultiSelectField({
  label,
  selected,
  options,
  onChangeSelected,
  placeholder,
  sheetTitle,
  searchPlaceholder,
  emptySearchMessage,
  accessibilityHint,
}: {
  label: string;
  selected: readonly string[];
  options: readonly string[];
  onChangeSelected: (next: string[]) => void;
  placeholder: string;
  sheetTitle: string;
  searchPlaceholder: string;
  emptySearchMessage: string;
  accessibilityHint: string;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
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

  const summary = selected.length === 0 ? "" : selected.join(", ");

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.listingSelectRow, fieldShell]}
        accessibilityRole="button"
        accessibilityHint={accessibilityHint}
      >
        <Text
          style={[
            styles.selectValue,
            selected.length === 0 && styles.selectPlaceholder,
          ]}
          numberOfLines={3}
        >
          {summary || placeholder}
        </Text>
        <FontAwesome name="chevron-down" size={12} color="rgba(0, 0, 0, 0.55)" />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.selectModalRoot}>
          <Pressable
            style={styles.selectModalBackdrop}
            onPress={() => setOpen(false)}
          />
          <View
            style={[
              styles.multiSheet,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>{sheetTitle}</Text>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Done"
              >
                <Text style={styles.sheetDone}>Done</Text>
              </Pressable>
            </View>
            <View style={[styles.searchShell, fieldShell]}>
              <FontAwesome
                name="search"
                size={15}
                color="rgba(60,60,67,0.45)"
              />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor="rgba(60, 60, 67, 0.45)"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={styles.multiSheetScroll}
              bounces
            >
              {filtered.map((opt, idx) => {
                const isOn = selected.includes(opt);
                return (
                  <Pressable
                    key={opt}
                    style={[
                      styles.multiOptionRow,
                      idx === filtered.length - 1 && styles.selectOptionLast,
                    ]}
                    onPress={() => toggle(opt)}
                  >
                    <Text style={styles.multiOptionText}>{opt}</Text>
                    {isOn ? (
                      <FontAwesome name="check" size={16} color="#007AFF" />
                    ) : (
                      <View style={styles.multiOptionCheckSpacer} />
                    )}
                  </Pressable>
                );
              })}
              {filtered.length === 0 ? (
                <Text style={styles.multiEmpty}>{emptySearchMessage}</Text>
              ) : null}
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

type SignUpPhase = "form" | "verify";

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { signOut } = useClerk();

  const [phase, setPhase] = useState<SignUpPhase>("form");
  const [step, setStep] = useState<1 | 2>(1);
  const [verifyCode, setVerifyCode] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeLegal, setAgreeLegal] = useState(false);
  const [agreeReferral, setAgreeReferral] = useState(false);
  const [legalOpen, setLegalOpen] = useState<LegalKey>(null);

  const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number] | "">("");
  const [statesAus, setStatesAus] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [agencyName, setAgencyName] = useState("");

  const workEmailError =
    email.trim().length > 0 ? workEmailValidationMessage(email) : null;

  const canStep1 =
    !!firstName &&
    !!lastName &&
    !!email.trim() &&
    isPermittedWorkEmail(email) &&
    !!phone &&
    !!password &&
    agreeLegal &&
    agreeReferral;
  const canStep2 =
    !!role &&
    statesAus.length > 0 &&
    municipalities.length > 0 &&
    !!agencyName.trim();

  const busy = fetchStatus === "fetching";

  const completeRegistration = async () => {
    await setUserRole(role as StoredUserRole);
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (fn || ln) {
      const { error: nameErr } = await signUp.update({
        ...(fn ? { firstName: fn } : {}),
        ...(ln ? { lastName: ln } : {}),
      });
      if (nameErr) {
        console.warn('[sign-up] Name update:', nameErr.message ?? nameErr);
      }
    }
    await signUp.finalize({
      navigate: (args) => clerkFinalizeNavigate(router, args),
    });
  };

  const goNext = async () => {
    setSubmitError(null);
    if (step === 1 && canStep1) {
      setStep(2);
      return;
    }
    if (step !== 2 || !canStep2) return;

    const profile = clerkSignUpProfileParams(firstName, lastName, phone);
    const { error } = await signUp.password({
      emailAddress: email.trim(),
      password,
      ...profile,
    });
    if (error) {
      setSubmitError(error.message ?? "Could not create your account. Try again.");
      return;
    }

    if (signUp.status === "missing_requirements" && signUp.missingFields.length > 0) {
      const syncErr = await syncClerkSignUpProfile(signUp, firstName, lastName, phone, {
        legalAccepted: agreeLegal,
      });
      if (syncErr) {
        setSubmitError(syncErr);
        return;
      }
    }

    const needsEmailVerify =
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address");

    if (needsEmailVerify) {
      await signUp.verifications.sendEmailCode();
      setPhase("verify");
      return;
    }

    if (signUp.status === "complete") {
      await completeRegistration();
      return;
    }

    if (__DEV__) {
      console.warn("[sign-up] incomplete", {
        status: signUp.status,
        missingFields: signUp.missingFields,
        unverifiedFields: signUp.unverifiedFields,
      });
    }
    setSubmitError(
      clerkIncompleteAuthMessage(
        "sign-up",
        signUp.status,
        signUp.missingFields,
        signUp.unverifiedFields,
      ),
    );
  };

  const onVerifyEmail = async () => {
    setSubmitError(null);
    await signUp.verifications.verifyEmailCode({ code: verifyCode.trim() });
    if (signUp.status === "complete") {
      await completeRegistration();
    } else {
      setSubmitError("Verification failed. Check the code and try again.");
    }
  };

  const primaryDisabled =
    phase === "verify" ? !verifyCode.trim() || busy : step === 1 ? !canStep1 || busy : !canStep2 || busy;

  const primaryLabel = phase === "verify" ? "Verify email" : "Sign Up";
  const clerkCodeError = clerkFieldError(errors, "code");

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollPad,
          { paddingBottom: insets.bottom + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {phase === "verify" ? (
          <Pressable
            style={styles.backRow}
            onPress={() => {
              void signUp.reset();
              void signOut();
              setPhase("form");
              setVerifyCode("");
              setStep(2);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <FontAwesome name="chevron-left" size={16} color="#000000" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : step === 2 ? (
          <Pressable
            style={styles.backRow}
            onPress={() => setStep(1)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <FontAwesome name="chevron-left" size={16} color="#000000" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}

        <Text style={styles.step}>
          {phase === "verify" ? "VERIFY" : step === 1 ? "STEP 01" : "STEP 02"}
        </Text>
        <Text style={styles.screenTitle}>
          {phase === "verify"
            ? "Confirm your work email"
            : step === 1
              ? "Create your account"
              : "Your role & location"}
        </Text>

        {phase === "verify" ? (
          <>
            <Text style={styles.helper}>
              We sent a verification code to {email.trim()}. Enter it below to finish creating
              your account.
            </Text>
            <Text style={styles.sectionLabel}>VERIFICATION CODE *</Text>
            <View style={styles.inputShell}>
              <TextInput
                style={styles.input}
                value={verifyCode}
                onChangeText={setVerifyCode}
                keyboardType="number-pad"
                placeholder="123456"
                autoComplete="one-time-code"
              />
            </View>
            {clerkCodeError ? <Text style={styles.fieldError}>{clerkCodeError}</Text> : null}
            {submitError ? <Text style={styles.fieldError}>{submitError}</Text> : null}
            <Pressable
              onPress={() => void signUp.verifications.sendEmailCode()}
              disabled={busy}
              style={styles.resendRow}
            >
              <Text style={styles.resendLink}>Send a new code</Text>
            </Pressable>
          </>
        ) : null}

        {phase === "form" && step === 1 ? (
          <>
            <FormField
              label="FIRST NAME *"
              value={firstName}
              onChangeText={setFirstName}
              autoComplete="name-given"
              placeholder="John"
            />
            <FormField
              label="LAST NAME *"
              value={lastName}
              onChangeText={setLastName}
              autoComplete="name-family"
              placeholder="Lim"
            />
            <FormField
              label="WORK EMAIL *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="john.lim@azrealestate.com.au"
              errorMessage={workEmailError ?? undefined}
              maxLength={254}
            />
            {!workEmailError && email.trim().length === 0 ? (
              <Text style={styles.workEmailHint}>
                Use your agency or corporate inbox — not Gmail, Outlook personal, or ISP webmail.
              </Text>
            ) : null}
            <FormField
              label="PHONE NUMBER *"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="+61 436 815 589"
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
                <Pressable
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((s) => !s)}
                  hitSlop={8}
                >
                  <FontAwesome
                    name={showPassword ? "eye" : "eye-slash"}
                    size={18}
                    color="#000000"
                  />
                </Pressable>
              }
            />

            <View style={styles.checkboxRow}>
              <Pressable
                onPress={() => setAgreeLegal((v) => !v)}
                style={[styles.checkbox, agreeLegal && styles.checkboxOn]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreeLegal }}
              >
                {agreeLegal ? (
                  <FontAwesome name="check" size={11} color="#000000" />
                ) : null}
              </Pressable>
              <Text style={styles.checkboxText}>
                I agree to the{" "}
                <Text style={styles.link} onPress={() => setLegalOpen("terms")}>
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text
                  style={styles.link}
                  onPress={() => setLegalOpen("privacy")}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>

            <View style={styles.checkboxRow}>
              <Pressable
                onPress={() => setAgreeReferral((v) => !v)}
                style={[styles.checkbox, agreeReferral && styles.checkboxOn]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreeReferral }}
              >
                {agreeReferral ? (
                  <FontAwesome name="check" size={11} color="#000000" />
                ) : null}
              </Pressable>
              <Text style={styles.checkboxText}>
                I have read and accepted the{" "}
                <Text
                  style={styles.link}
                  onPress={() => setLegalOpen("referral")}
                >
                  Agency Referral Agreement
                </Text>
              </Text>
            </View>
          </>
        ) : null}

        {phase === "form" && step === 2 ? (
          <>
            <SelectField
              label="YOUR ROLE *"
              value={role}
              options={ROLE_OPTIONS}
              onSelect={setRole}
              placeholder="Select your role"
              sheetTitle="Your role"
            />
            <Text style={styles.helper}>
              Pick Real Estate Agent, Buyer Agent, or Vendor advocate.
            </Text>

            <SectionLabel>LOCATION</SectionLabel>
            <SearchableMultiSelectField
              label="STATE *"
              selected={statesAus}
              options={STATE_OPTIONS}
              onChangeSelected={setStatesAus}
              placeholder="Select one or more states or territories"
              sheetTitle="State / territory"
              searchPlaceholder="Search states"
              emptySearchMessage="No states match your search."
              accessibilityHint="Opens searchable list. You can select multiple states or territories."
            />
            <Text style={styles.helper}>
              Search and select one or more states or territories you operate in.
            </Text>
            <SearchableMultiSelectField
              label="MUNICIPALITIES *"
              selected={municipalities}
              options={MUNICIPALITY_OPTIONS}
              onChangeSelected={setMunicipalities}
              placeholder="Select one or more councils"
              sheetTitle="Municipalities"
              searchPlaceholder="Search councils"
              emptySearchMessage="No councils match your search."
              accessibilityHint="Opens searchable list. You can select multiple councils."
            />
            <Text style={styles.helper}>
              Search councils and select one or more municipalities.
            </Text>

            <FormField
              label="AGENCY NAME *"
              value={agencyName}
              onChangeText={setAgencyName}
              placeholder="MATCH Residential"
            />
          </>
        ) : null}

        {submitError && phase === "form" ? (
          <Text style={styles.fieldError}>{submitError}</Text>
        ) : null}

        <View nativeID="clerk-captcha" />

        <AppButton
          variant="charcoal"
          style={styles.signUpPrimary}
          disabled={primaryDisabled}
          onPress={phase === "verify" ? onVerifyEmail : goNext}
        >
          {primaryLabel}
        </AppButton>

        {phase === "form" && step === 1 ? (
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
          <Pressable
            onPress={() => router.push("/(auth)/contact-support")}
            hitSlop={8}
          >
            <Text style={styles.supportLink}>Contact support</Text>
          </Pressable>
        </View>
      </ScrollView>

      <LegalDocModal
        visible={legalOpen === "terms"}
        title="Terms of Service"
        body={LEGAL_TERMS_SIGNUP_MODAL_BODY}
        onClose={() => setLegalOpen(null)}
      />
      <LegalDocModal
        visible={legalOpen === "privacy"}
        title="Privacy Policy"
        body={LEGAL_PRIVACY_BODY}
        onClose={() => setLegalOpen(null)}
      />
      <LegalDocModal
        visible={legalOpen === "referral"}
        title="Agency Referral Agreement"
        body={REFERRAL_BODY}
        onClose={() => setLegalOpen(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scrollPad: {
    paddingHorizontal: AUTH_PAD_H,
    paddingTop: 8,
    /** Ensure children (e.g. AppButton) receive a real width inside ScrollView on iOS. */
    alignItems: "stretch",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  backText: { fontSize: 15, fontFamily: "Satoshi-Medium", color: "#000000" },
  step: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "rgba(26,26,26,0.96)",
    marginBottom: 6,
  },
  screenTitle: {
    fontSize: 24,
    fontFamily: "Satoshi-Medium",
    color: "rgba(26,26,26,0.96)",
    marginBottom: 20,
    lineHeight: 30,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "#636366",
    letterSpacing: 1.2,
    marginTop: 4,
    marginBottom: 10,
    marginLeft: 2,
  },
  helper: {
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.75)",
    marginTop: -10,
    marginBottom: 18,
    marginLeft: 2,
  },
  fieldBlock: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "#636366",
    letterSpacing: 0.1,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: "uppercase",
  },
  fieldError: {
    marginTop: 6,
    marginLeft: 2,
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "#C62828",
    lineHeight: 17,
  },
  resendRow: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  resendLink: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    textDecorationLine: "underline",
  },
  workEmailHint: {
    marginTop: -10,
    marginBottom: 18,
    marginLeft: 2,
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.55)",
    lineHeight: 17,
  },
  inputShell: { position: "relative" },
  input: {
    minHeight: 54,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    fontFamily: "Satoshi-Medium",
    color: "rgba(26,26,26,0.96)",
    backgroundColor: FIELD_FILL,
  },
  inputWithRight: { paddingRight: 44 },
  inputInvalid: {
    borderWidth: 1,
    borderColor: "rgba(198, 40, 40, 0.85)",
  },
  listingSelectRow: {
    minHeight: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  selectValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
  },
  selectPlaceholder: { color: "rgba(0, 0, 0, 0.35)" },
  selectModalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  selectModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  selectSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 10,
    paddingHorizontal: 16,
    maxHeight: "78%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(60, 60, 67, 0.3)",
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SEPARATOR,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
  },
  sheetDone: {
    fontSize: 17,
    fontFamily: "Satoshi-Medium",
    color: accent,
  },
  selectSheetScroll: {
    flexGrow: 0,
    maxHeight: 360,
  },
  selectCheckSpacer: { width: 22 },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SEPARATOR,
  },
  selectOptionLast: {
    borderBottomWidth: 0,
  },
  selectOptionText: {
    fontSize: 17,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    flex: 1,
    paddingRight: 12,
  },
  selectOptionTextSelected: { color: accent },
  multiSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 10,
    paddingHorizontal: 16,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },
  searchShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    minHeight: 48,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Satoshi-Medium",
    color: "rgba(26,26,26,0.96)",
    padding: 0,
    minHeight: 22,
  },
  multiSheetScroll: {
    flexGrow: 0,
    maxHeight: 320,
  },
  multiOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SEPARATOR,
  },
  multiOptionText: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    paddingRight: 12,
  },
  multiOptionCheckSpacer: { width: 22 },
  multiEmpty: {
    paddingVertical: 28,
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
    maxWidth: "100%",
  },
  checkbox: {
    width: 13,
    height: 13,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxOn: { backgroundColor: "#ffffff" },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Satoshi-Medium",
    color: "rgba(26,26,26,0.96)",
    lineHeight: 20,
  },
  link: { textDecorationLine: "underline", fontFamily: "Satoshi-Medium" },
  footerCenter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    flexWrap: "wrap",
    gap: 4,
  },
  footerMuted: { fontSize: 14, color: "rgba(26,26,26,0.88)" },
  footerBold: { fontSize: 14, fontFamily: "Satoshi-Medium", color: "#000000" },
  supportRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  supportMuted: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "rgba(26,26,26,0.96)",
  },
  supportLink: {
    fontSize: 13,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    textDecorationLine: "underline",
  },
  signUpPrimary: {
    marginTop: 20,
  },
});
