import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, fonts } from "../../theme/tokens";

type Props = {
  onSubmit?: (query: string) => void;
  onFiltersPress?: () => void;
  /** `hero` matches mobile web: frosted pill, Filters label, round submit. */
  visual?: "plain" | "hero";
};

export function NativeSearchBar({
  onSubmit,
  onFiltersPress,
  visual = "plain",
}: Props) {
  const [q, setQ] = useState("");

  if (visual === "hero") {
    return (
      <View style={styles.heroShell}>
        <Ionicons
          name="search"
          size={18}
          color="rgba(10, 18, 12, 0.72)"
          style={styles.heroSearchIcon}
        />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Hawthorn, VIC 3122"
          placeholderTextColor="rgba(17, 17, 17, 0.48)"
          style={styles.heroInput}
          returnKeyType="search"
          onSubmitEditing={() => onSubmit?.(q)}
        />
        <Pressable
          onPress={onFiltersPress}
          hitSlop={10}
          style={({ pressed }) => [
            styles.heroFiltersBtn,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Text style={styles.heroFiltersLabel}>Filters</Text>
        </Pressable>
        <Pressable
          onPress={() => onSubmit?.(q)}
          style={({ pressed }) => [
            styles.heroSubmit,
            pressed && { backgroundColor: "rgba(17, 17, 17, 0.06)" },
          ]}
          accessibilityLabel="Search"
        >
          <Ionicons
            name="arrow-forward"
            size={18}
            color={colors.ink}
            style={{ marginLeft: 1 }}
          />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <Ionicons
        name="search"
        size={20}
        color={colors.muted}
        style={styles.searchIcon}
      />
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Suburb, street or postcode"
        placeholderTextColor={colors.muted}
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit?.(q)}
      />
      <Pressable
        onPress={onFiltersPress}
        hitSlop={12}
        style={({ pressed }) => [styles.filterHit, pressed && { opacity: 0.6 }]}
        accessibilityLabel="Filters"
      >
        <Ionicons name="options-outline" size={22} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const heroShadow =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.28,
        shadowRadius: 20,
      }
    : { elevation: 12 };

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingLeft: 14,
    paddingRight: 10,
    minHeight: 52,
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.ink,
    paddingVertical: 12,
  },
  filterHit: { padding: 8 },
  heroShell: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.65)",
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 52,
    ...heroShadow,
  },
  heroSearchIcon: { marginRight: 8 },
  heroInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 15,
    letterSpacing: -0.05,
    color: colors.ink,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  heroFiltersBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 2,
  },
  heroFiltersLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: "rgba(17, 17, 17, 0.62)",
  },
  heroSubmit: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(17, 17, 17, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
