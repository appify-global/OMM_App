import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ListingCardData } from "./ListingCardWeb";
import { colors, fonts, shadow, space } from "../../theme/tokens";

type Props = {
  listing: ListingCardData;
  onPress?: () => void;
};

/** Compact listing tile for horizontal feed — native discovery pattern. */
export function FeaturedStripCard({ listing, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <Image
        source={{ uri: listing.image }}
        style={styles.image}
        contentFit="cover"
        transition={150}
      />
      <View style={styles.body}>
        <Text style={styles.tag}>{listing.tag}</Text>
        <Text style={styles.address} numberOfLines={2}>
          {listing.address}
        </Text>
        <Text style={styles.suburb}>{listing.suburb}</Text>
        <Text style={styles.meta}>{listing.meta}</Text>
        <Text style={styles.price}>{listing.price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 268,
    marginRight: space.md,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.cardLine,
    ...shadow.card,
  },
  image: {
    width: "100%",
    height: 148,
    backgroundColor: colors.surfaceMuted,
  },
  body: { padding: space.sm },
  tag: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.forest,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  address: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 6,
    lineHeight: 20,
  },
  suburb: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 4,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
  },
  price: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.ink,
  },
});
