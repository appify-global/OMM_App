import { Text } from "@/components/OMMText";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View, type ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { layout } from "@/constants/theme";
import { useTabScreenBottomPad } from "@/lib/useTabScreenBottomPad";
import { useTabBarOnScroll } from "@/lib/tab-bar-visibility";

import { ManageListingSheet } from "@/components/ManageListingSheet";

import {
    DEMO_MANAGE_LISTING_HEADER,
    DEMO_PRIMARY_LISTING_TITLE,
} from "@/lib/melbourne-demo-locations";
import { PROPERTY_IMG_1, propertyImageAtIndex } from "@/lib/propertyImages";

type TabKey = "live" | "contract" | "draft" | "sold";

type ListingDemo = {
  id: string;
  image: ImageSourcePropType;
  statusLabel: string;
  ribbon: string;
  beds: number;
  baths: number;
  cars: number;
  title: string;
  price: string;
  manageHeader: string;
  manageSubtitle: string;
};

const LISTINGS_BY_SEGMENT: Record<TabKey, ListingDemo[]> = {
  live: [
    {
      id: "live-1",
      image: PROPERTY_IMG_1,
      statusLabel: "LIVE",
      ribbon: "Authority expires in 14 days",
      beds: 3,
      baths: 3,
      cars: 2,
      title: DEMO_PRIMARY_LISTING_TITLE,
      price: "$21,000,000",
      manageHeader: DEMO_MANAGE_LISTING_HEADER,
      manageSubtitle: "$21,000,000 • Live • Authority expires in 14 days • SOI 20 Apr",
    },
    {
      id: "live-2",
      image: propertyImageAtIndex(1),
      statusLabel: "LIVE",
      ribbon: "Authority expires in 28 days",
      beds: 4,
      baths: 2,
      cars: 2,
      title: "Rowe St · Fitzroy North",
      price: "$2,150,000",
      manageHeader: "15 Rowe St, Fitzroy North VIC 3068",
      manageSubtitle: "$2,150,000 • Live • Authority expires in 28 days • SOI 18 Apr",
    },
  ],
  contract: [
    {
      id: "contract-1",
      image: propertyImageAtIndex(2),
      statusLabel: "UNDER CONTRACT",
      ribbon: "Exchange due in 21 days",
      beds: 4,
      baths: 2,
      cars: 2,
      title: "Murray St · Ascot Vale",
      price: "$2,100,000",
      manageHeader: "4 Murray St, Ascot Vale VIC 3032",
      manageSubtitle: "$2,100,000 • Under contract • Exchange due in 21 days",
    },
    {
      id: "contract-2",
      image: propertyImageAtIndex(3),
      statusLabel: "UNDER CONTRACT",
      ribbon: "Finance due in 9 days",
      beds: 3,
      baths: 2,
      cars: 1,
      title: "Pasley St · St Kilda",
      price: "$1,420,000",
      manageHeader: "9 Pasley St, St Kilda VIC 3182",
      manageSubtitle: "$1,420,000 • Under contract • Finance due in 9 days",
    },
  ],
  draft: [
    {
      id: "draft-1",
      image: propertyImageAtIndex(4),
      statusLabel: "DRAFT",
      ribbon: "Last edited 2 days ago",
      beds: 2,
      baths: 1,
      cars: 1,
      title: "Joseph Rd · Footscray",
      price: "$850,000 — $920,000",
      manageHeader: "102/8 Joseph Rd, Footscray VIC 3011",
      manageSubtitle: "Draft • Last edited 2 days ago • Photos pending",
    },
    {
      id: "draft-2",
      image: propertyImageAtIndex(5),
      statusLabel: "DRAFT",
      ribbon: "Last edited 5 days ago",
      beds: 5,
      baths: 3,
      cars: 2,
      title: "Wheatland Rd · Malvern",
      price: "$3,250,000",
      manageHeader: "71 Wheatland Rd, Malvern VIC 3144",
      manageSubtitle: "Draft • Last edited 5 days ago • SOI not uploaded",
    },
  ],
  sold: [
    {
      id: "sold-1",
      image: propertyImageAtIndex(6),
      statusLabel: "SOLD",
      ribbon: "Sold 14 Apr 2026",
      beds: 3,
      baths: 2,
      cars: 2,
      title: "Hartington St · Elsternwick",
      price: "SOLD $1,850,000",
      manageHeader: "12 Hartington St, Elsternwick VIC 3185",
      manageSubtitle: "Sold $1,850,000 • Settled 14 Apr 2026",
    },
    {
      id: "sold-2",
      image: propertyImageAtIndex(7),
      statusLabel: "SOLD",
      ribbon: "Sold 02 Apr 2026",
      beds: 4,
      baths: 3,
      cars: 2,
      title: "Orrong Rd · Armadale",
      price: "SOLD $2,100,000",
      manageHeader: "44 Orrong Rd, Armadale VIC 3143",
      manageSubtitle: "Sold $2,100,000 • Settled 02 Apr 2026",
    },
  ],
};

function firstQueryString(
  v: string | string[] | undefined,
): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function tabKeyFromSegmentQuery(q: string | undefined): TabKey | null {
  if (q === "live" || q === "contract" || q === "draft" || q === "sold") return q;
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingHorizontal: layout.screenGutter },
  pageTitle: {
    fontSize: 28,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    letterSpacing: -0.6,
    marginBottom: 20,
  },
  searchQueryBanner: {
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.55)",
    marginTop: -12,
    marginBottom: 16,
    lineHeight: 20,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  segItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 11,
    minWidth: 0,
  },
  segItemOn: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segLabel: {
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: "rgba(0, 0, 0, 0.45)",
    textAlign: "center",
  },
  segLabelOn: { color: "#000000" },
  listingCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  imgWrap: {
    height: 200,
    position: "relative",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  img: { width: "100%", height: "100%" },
  badgeLive: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#000000",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeLiveText: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    color: "#fff",
    letterSpacing: 0.4,
  },
  badgeAuth: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#000000",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: "58%",
  },
  badgeAuthText: {
    fontSize: 9,
    fontFamily: "Satoshi-Medium",
    color: "#fff",
    letterSpacing: 0.2,
    lineHeight: 13,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  specItem: { flex: 1, alignItems: "center", gap: 6 },
  specText: {
    fontSize: 11,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    textAlign: "center",
  },
  propTitle: {
    fontSize: 18,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    paddingHorizontal: 16,
    marginTop: 18,
  },
  propPrice: {
    fontSize: 16,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    paddingHorizontal: 16,
    marginTop: 6,
  },
  manageBtn: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 16,
    backgroundColor: "#000000",
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  manageBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Satoshi-Medium",
    letterSpacing: 0.35,
  },
  emptyTab: { paddingVertical: 40, alignItems: "center" },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Satoshi-Medium",
    color: "#000000",
    marginBottom: 8,
  },
  emptySub: { fontSize: 14, color: "rgba(0, 0, 0, 0.45)" },
});

function ListingCard({
  listing,
  onManage,
}: {
  listing: ListingDemo;
  onManage: () => void;
}) {
  return (
    <View style={styles.listingCard}>
      <View style={styles.imgWrap}>
        <Image source={listing.image} style={styles.img} resizeMode="cover" />
        <View style={styles.badgeLive}>
          <Text style={styles.badgeLiveText}>{listing.statusLabel}</Text>
        </View>
        <View style={styles.badgeAuth}>
          <Text style={styles.badgeAuthText}>{listing.ribbon}</Text>
        </View>
      </View>
      <View style={styles.specRow}>
        <View style={styles.specItem}>
          <MaterialCommunityIcons name="bed" size={20} color="#000000" />
          <Text style={styles.specText}>{listing.beds} bedrooms</Text>
        </View>
        <View style={styles.specItem}>
          <MaterialCommunityIcons name="bathtub" size={20} color="#000000" />
          <Text style={styles.specText}>{listing.baths} bathrooms</Text>
        </View>
        <View style={styles.specItem}>
          <MaterialCommunityIcons name="car" size={20} color="#000000" />
          <Text style={styles.specText}>{listing.cars} car spaces</Text>
        </View>
      </View>
      <Text style={styles.propTitle}>{listing.title}</Text>
      <Text style={styles.propPrice}>{listing.price}</Text>
      <Pressable style={styles.manageBtn} onPress={onManage} accessibilityRole="button">
        <Text style={styles.manageBtnText}>MANAGE LISTING</Text>
      </Pressable>
    </View>
  );
}

/**
 * Manage listings — [Figma 1053:8853](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-8853&t=gEfFuYKIwBHVUzXh-4)
 */
export default function ManageListingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    segment?: string | string[];
    q?: string | string[];
  }>();
  const searchQRaw = firstQueryString(params.q);
  const searchQ = searchQRaw?.trim() || undefined;

  const bottomPad = useTabScreenBottomPad();
  const [activeSegment, setActiveSegment] = useState<TabKey>("live");
  const [manageSheetOpen, setManageSheetOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingDemo | null>(null);
  const { onScroll } = useTabBarOnScroll();

  const segmentListings = LISTINGS_BY_SEGMENT[activeSegment];

  const openManageSheet = (listing: ListingDemo) => {
    setSelectedListing(listing);
    setManageSheetOpen(true);
  };

  useEffect(() => {
    const next = tabKeyFromSegmentQuery(firstQueryString(params.segment));
    if (next) setActiveSegment(next);
  }, [params.segment]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <ManageListingSheet
        visible={manageSheetOpen}
        onClose={() => {
          setManageSheetOpen(false);
          setSelectedListing(null);
        }}
        title={selectedListing?.manageHeader ?? DEMO_MANAGE_LISTING_HEADER}
        subtitle={
          selectedListing?.manageSubtitle ??
          "$2,450,000 • Live • Authority expires in 14 days • SOI 20 Apr"
        }
        onMenuItemPress={(item) => {
          setManageSheetOpen(false);
          if (item === "Edit listing details")
            router.push("/edit-listing" as Href);
          if (item === "Update photos & floorplan")
            router.push("/photos-floorplan" as Href);
          if (item === "View performance")
            router.push("/view-performance" as Href);
          if (item === "Change status")
            router.push("/change-listing-status" as Href);
          if (item === "Archive listing")
            router.push("/archive-listing" as Href);
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: bottomPad + 24 },
        ]}
      >
        <Text style={styles.pageTitle}>Manage listings</Text>
        {searchQ ? (
          <Text style={styles.searchQueryBanner} numberOfLines={2}>
            {`Results for “${searchQ}”`}
          </Text>
        ) : null}

        <View style={styles.segment}>
          {(
            [
              { key: "live" as const, label: "Live" },
              { key: "contract" as const, label: "Under contract" },
              { key: "draft" as const, label: "Draft" },
              { key: "sold" as const, label: "Sold" },
            ] as const
          ).map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setActiveSegment(key)}
              style={[
                styles.segItem,
                activeSegment === key && styles.segItemOn,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: activeSegment === key }}
            >
              <Text
                style={[
                  styles.segLabel,
                  activeSegment === key && styles.segLabelOn,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {segmentListings.length > 0 ? (
          segmentListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onManage={() => openManageSheet(listing)}
            />
          ))
        ) : (
          <View style={styles.emptyTab}>
            <Text style={styles.emptyTitle}>
              {activeSegment === "contract"
                ? "Under contract"
                : activeSegment === "sold"
                ? "Sold listings"
                : activeSegment === "draft"
                ? "Drafts"
                : "Live listings"}
            </Text>
            <Text style={styles.emptySub}>Nothing here yet in this demo.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
