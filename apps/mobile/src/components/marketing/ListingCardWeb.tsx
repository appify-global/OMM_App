import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../BrandGlyph";
import { colors, fonts, radii, space } from "../../theme/tokens";

export type ListingCardData = {
  tag: string;
  price: string;
  address: string;
  suburb: string;
  meta: string;
  folio: string;
  image: string;
};

type Props = {
  listing: ListingCardData;
  onRequestAccess?: () => void;
};

export function ListingCardWeb({ listing, onRequestAccess }: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: listing.image }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.body}>
        <View style={styles.folioRow}>
          <SquareFilled size={5} />
          <Text style={styles.folioText}>No. {listing.folio}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.tag}>{listing.tag}</Text>
        </View>
        <Text style={styles.address}>{listing.address}</Text>
        <Text style={styles.suburb}>{listing.suburb}</Text>
        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaDt}>Guide</Text>
            <Text style={styles.metaDd}>{listing.price}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaDt}>Plan</Text>
            <Text style={styles.metaDd}>{listing.meta}</Text>
          </View>
        </View>
        <Pressable onPress={onRequestAccess} style={styles.cta}>
          <Text style={styles.ctaText}>Request access →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.controlSoft,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.cardLine,
    backgroundColor: colors.paper,
    marginBottom: space.md,
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: colors.surfaceMuted,
  },
  body: { padding: space.md },
  folioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: space.sm,
    flexWrap: "wrap",
  },
  folioText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.muted,
  },
  dot: { color: colors.muted, fontSize: 12 },
  tag: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.forest },
  address: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  suburb: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.muted,
    marginBottom: space.md,
  },
  metaGrid: {
    flexDirection: "row",
    gap: space.xl,
    marginBottom: space.md,
  },
  metaCol: { flex: 1 },
  metaDt: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.muted,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metaDd: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  cta: { alignSelf: "flex-start", paddingVertical: 4 },
  ctaText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.forest,
  },
});
