import { StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../BrandGlyph";
import { colors, fonts, space } from "../../theme/tokens";

type Props = {
  items: string[];
};

export function HeroMetaList({ items }: Props) {
  return (
    <View style={styles.list}>
      {items.map((item, i) => (
        <View key={item} style={styles.row}>
          <View style={styles.dt}>
            <SquareFilled size={5} />
            <Text style={styles.index}>{String(i + 1).padStart(2, "0")}</Text>
          </View>
          <Text style={styles.dd}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.lg, marginBottom: space.md },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  dt: { flexDirection: "row", alignItems: "center", gap: 6, minWidth: 52 },
  index: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.forest,
  },
  dd: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
  },
});
