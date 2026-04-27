import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, radii, space } from "../../theme/tokens";

const poster = require("../../../assets/hero-poster.jpg");

type Props = {
  folio: string;
  tag: string;
};

/** Hero visual as a raised card — reads as “app module”, not full-bleed web hero. */
export function NativeHeroCard({ folio, tag }: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={poster}
        style={styles.image}
        contentFit="cover"
        transition={200}
        accessibilityLabel="Featured campaign"
      />
      <View style={styles.caption}>
        <Text style={styles.folio}>No. {folio}</Text>
        <Text style={styles.tag}>{tag}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.cardLine,
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: space.lg,
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: colors.surfaceMuted,
  },
  caption: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  folio: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.muted,
  },
  tag: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.forest,
  },
});
