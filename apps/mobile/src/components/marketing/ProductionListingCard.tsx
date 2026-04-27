import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SquareFilled } from "../BrandGlyph";
import type { PublicListing } from "../../data/marketingHome";
import { colors, fonts, shadow, space } from "../../theme/tokens";

type Props = {
  listing: PublicListing;
  onPress?: () => void;
};

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <Text style={styles.metaDt}>{label}</Text>
      <Text style={styles.metaDd} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

/** Listing tile aligned with `apps/web/app/listings/page.tsx` `.listing-card`. */
export function ProductionListingCard({ listing, onPress }: Props) {
  const suburbLine = `${listing.suburb}, ${listing.state} ${listing.postcode}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${listing.address}, ${suburbLine}`}
      style={({ pressed }) => [styles.wrap, pressed && styles.wrapPressed]}
    >
      <Image
        source={{ uri: listing.image }}
        style={styles.image}
        contentFit="cover"
        transition={180}
      />
      <View style={styles.body}>
        <View style={styles.folioRow}>
          <SquareFilled size={5} />
          <Text style={styles.folioText}>No. {listing.folio}</Text>
          <Text style={styles.folioDot}>·</Text>
          <Text style={styles.folioTag}>{listing.tag}</Text>
        </View>
        <Text style={styles.address}>{listing.address}</Text>
        <Text style={styles.suburb}>{suburbLine}</Text>

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <MetaCell label="Guide" value={listing.priceGuide} />
            <MetaCell label="Plan" value={listing.plan} />
          </View>
          <View style={styles.metaRow}>
            <MetaCell label="Land" value={listing.land} />
            <MetaCell label="Agent" value={listing.agent} />
          </View>
        </View>

        <Text style={styles.cta}>
          Request access <Text style={styles.ctaArrow}>→</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardLine,
    overflow: "hidden",
    marginBottom: space.lg,
    ...shadow.card,
  },
  wrapPressed: { opacity: 0.94 },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    paddingHorizontal: space.md,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  folioRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  folioText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.muted,
  },
  folioDot: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  folioTag: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.forest,
  },
  address: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.3,
    color: colors.ink,
    marginBottom: 6,
  },
  suburb: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    marginBottom: space.md,
  },
  metaBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: space.md,
    marginBottom: space.md,
    gap: 14,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
  },
  metaCell: {
    flex: 1,
    minWidth: 0,
  },
  metaDt: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 4,
  },
  metaDd: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  cta: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.forest,
  },
  ctaArrow: {},
});
