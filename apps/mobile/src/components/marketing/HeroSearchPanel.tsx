import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, fonts, radii } from "../../theme/tokens";

type Props = {
  onSubmit?: (query: string) => void;
  onFiltersPress?: () => void;
};

export function HeroSearchPanel({ onSubmit, onFiltersPress }: Props) {
  const [q, setQ] = useState("");

  return (
    <View style={styles.row}>
      <View style={styles.searchBox}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Hawthorn, VIC 3122"
          placeholderTextColor={colors.muted}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => onSubmit?.(q)}
        />
      </View>
      <Pressable
        onPress={onFiltersPress}
        style={({ pressed }) => [styles.filterBtn, pressed && styles.pressed]}
      >
        <View style={styles.filterLabel}>
          <Text style={styles.filterText}>Filters</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={() => onSubmit?.(q)}
        style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed]}
        accessibilityLabel="Search"
      >
        <View style={styles.submitInner}>
          <Text style={styles.returnKey}>⏎</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginBottom: 24,
  },
  searchBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.control,
    backgroundColor: colors.paper,
    justifyContent: "center",
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
  },
  filterBtn: { justifyContent: "center" },
  filterLabel: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.control,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filterText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.ink,
  },
  submitBtn: { justifyContent: "center" },
  submitInner: {
    width: 44,
    height: 44,
    borderRadius: radii.control,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  returnKey: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.paper,
  },
  pressed: { opacity: 0.85 },
});
