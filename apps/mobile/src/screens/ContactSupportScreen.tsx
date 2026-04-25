import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackScreenProps } from "../navigation/types";
import { LabeledInput } from "../components/LabeledInput";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, radii, spacing } from "../theme/theme";
import { TopBar } from "../components/TopBar";

type Props = RootStackScreenProps<"ContactSupport">;

export function ContactSupportScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <TopBar title="Contact support" />
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          Tell us what went wrong and we will reply within one business day.
        </Text>
        <LabeledInput
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="John Lim"
        />
        <LabeledInput
          label="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="john.lim@azrealestate.com.au"
        />
        <LabeledInput
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+61 436 815 589"
        />
        <Text style={styles.label}>YOUR MESSAGE</Text>
        <TextInput
          style={styles.message}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
          placeholder="Describe the issue…"
          placeholderTextColor={colors.textMuted}
        />
        <PrimaryButton
          label="Send message"
          onPress={() => navigation.goBack()}
        />
        <PrimaryButton
          label="Done"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={styles.done}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  back: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backPlaceholder: { width: 40 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "500",
    color: colors.primary,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  intro: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.6,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  message: {
    minHeight: 140,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  done: { marginTop: spacing.md },
});
