import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackScreenProps } from "../navigation/types";
import { brand } from "../theme/brand";
import { BUYER_BRIEFS } from "../data/buyerBriefs";
import { TopBar } from "../components/TopBar";

type Props = RootStackScreenProps<"BuyerBriefs">;

const INFO_BG = "#f7f4f0";

export function BuyerBriefsScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <TopBar title="Potential buyers" />

        <Text style={styles.kicker}>6 buyer briefs</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            New briefs land here automatically
          </Text>
          <Text style={styles.infoBody}>
            When a buyer/buyer agent posts a brief that fits your profile, it
            appears as a private lead, suburbs, budget, and timing come straight
            from their form.
          </Text>
        </View>

        <View style={styles.sortRow}>
          <Text style={styles.sortText}>Sort · Newest briefs</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {BUYER_BRIEFS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              navigation.navigate("BuyerBriefDetail", { id: item.id })
            }
            style={styles.itemPress}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${item.price}`}
          >
            <View style={styles.itemRow}>
              <View style={styles.thumbBox}>
                <Image
                  source={item.image}
                  style={styles.thumb}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.itemTextCol}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.itemPrice} numberOfLines={1}>
                  {item.price}
                </Text>
                <Text
                  style={styles.itemDetails}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.details}
                </Text>
                <View style={styles.itemRule} />
              </View>
            </View>
          </Pressable>
        ))}
        <Text style={styles.endText}>End of briefs</Text>
        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

const H_PAD = 16;
const GAP = 12;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.warmWhite },
  safe: { paddingHorizontal: H_PAD },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  back: {
    width: 44,
    height: 44,
    marginLeft: -4,
    alignItems: "center",
    justifyContent: "center",
  },
  backSpacer: { width: 40 },
  title: {
    flex: 1,
    textAlign: "center",
    fontFamily: brand.fontSans,
    fontSize: brand.type.subtitle,
    fontWeight: "500",
    color: brand.charcoal,
  },
  kicker: {
    fontFamily: brand.fontSans,
    fontSize: brand.type.caption,
    color: brand.sage,
    marginTop: 2,
    marginBottom: 14,
  },
  infoCard: {
    backgroundColor: INFO_BG,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  infoTitle: {
    fontFamily: brand.fontSans,
    fontSize: 15,
    fontWeight: "500",
    color: brand.charcoal,
    lineHeight: 22,
    marginBottom: 8,
  },
  infoBody: {
    fontFamily: brand.fontSans,
    fontSize: 13,
    lineHeight: 20,
    color: brand.sage,
  },
  sortRow: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  sortText: {
    fontFamily: brand.fontSans,
    fontSize: 12,
    color: brand.sage,
  },
  listScroll: { flex: 1 },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingBottom: 8,
  },
  itemPress: { marginBottom: 0 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 0,
  },
  thumbBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: brand.cream,
  },
  thumb: { width: 60, height: 60 },
  itemTextCol: {
    flex: 1,
    marginLeft: GAP,
    minWidth: 0,
  },
  itemTitle: {
    fontFamily: brand.fontSans,
    fontSize: 16,
    fontWeight: "500",
    color: brand.charcoal,
    lineHeight: 21,
  },
  itemPrice: {
    fontFamily: brand.fontSans,
    fontSize: 15,
    fontWeight: "500",
    color: brand.charcoal,
    marginTop: 4,
  },
  itemDetails: {
    fontFamily: brand.fontSans,
    fontSize: 13,
    lineHeight: 19,
    color: brand.sage,
    marginTop: 4,
  },
  itemRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(138,155,142,0.28)",
    marginTop: 14,
    alignSelf: "stretch",
    marginRight: -H_PAD,
  },
  endText: {
    textAlign: "center",
    fontFamily: brand.fontSans,
    fontSize: 12,
    color: brand.sage,
    marginTop: 8,
  },
});
