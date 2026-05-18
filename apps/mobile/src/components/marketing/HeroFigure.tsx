import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, radii, space } from "../../theme/tokens";

const poster = require("../../../assets/hero-poster.jpg");

type Props = {
  folio: string;
  tag: string;
};

export function HeroFigure({ folio, tag }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.frame}>
        <Image
          source={poster}
          style={styles.image}
          contentFit="cover"
          transition={300}
          accessibilityLabel="Featured private campaign"
        />
      </View>
      <View style={styles.caption}>
        <Text style={styles.captionFolio}>No. {folio}</Text>
        <Text style={styles.captionTag}>{tag}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.md, marginBottom: 0 },
  frame: {
    borderRadius: radii.controlSoft,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.cardLine,
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  caption: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: space.sm,
    paddingHorizontal: 2,
  },
  captionFolio: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.muted,
  },
  captionTag: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.forest,
  },
});
