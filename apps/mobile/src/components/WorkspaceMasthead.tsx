import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SquareFilled, SquareOutline } from "./BrandGlyph";
import { colors, fonts, radii } from "../theme/tokens";

export type MastheadTab = "home" | "listings" | "briefs" | "messages" | "profile";

type Props = {
  userInitials: string;
  hasUnreadNotifications?: boolean;
  active: MastheadTab;
  onTab: (t: MastheadTab) => void;
  onNotifications: () => void;
  onProfilePress: () => void;
};

const tabs: { key: MastheadTab; label: string; section: string }[] = [
  { key: "home", label: "Home", section: "I" },
  { key: "listings", label: "Listings", section: "II" },
  { key: "briefs", label: "Briefs", section: "III" },
  { key: "messages", label: "Messages", section: "IV" },
  { key: "profile", label: "Profile", section: "V" },
];

export function WorkspaceMasthead({
  userInitials,
  hasUnreadNotifications,
  active,
  onTab,
  onNotifications,
  onProfilePress,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.rule}>
        <Text style={styles.ruleText}>PreMarket · Workspace</Text>
        <Text style={styles.ruleText}>Vol. I — Issue 04</Text>
      </View>
      <View style={styles.masthead}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <SquareFilled size={5} />
            <SquareOutline size={5} />
          </View>
          <Text style={styles.brandWordmark}>
            <Text style={styles.brandPre}>Pre</Text>
            <Text style={styles.brandMarket}>Market</Text>
            <Text style={styles.brandTld}>.com.au</Text>
          </Text>
        </View>
        <View style={styles.navRow}>
          {tabs.map((t) => {
            const isActive = active === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => onTab(t.key)}
                style={styles.navItem}
              >
                <Text
                  style={[
                    styles.navSection,
                    isActive && styles.navSectionActive,
                  ]}
                >
                  {t.section}
                </Text>
                <Text
                  style={[styles.navLabel, isActive && styles.navLabelActive]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={onNotifications}
            style={styles.bell}
            accessibilityLabel="Notifications"
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {hasUnreadNotifications ? <View style={styles.bellDot} /> : null}
          </Pressable>
          <Pressable
            onPress={onProfilePress}
            style={styles.avatar}
            accessibilityLabel="Profile"
          >
            <Text style={styles.avatarText}>{userInitials}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rule: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  ruleText: { fontFamily: fonts.sans, fontSize: 10, color: colors.muted },
  masthead: { paddingHorizontal: 12, paddingBottom: 10, gap: 10 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandMark: { flexDirection: "row", alignItems: "center", gap: 3 },
  brandWordmark: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  brandPre: { color: colors.ink },
  brandMarket: { fontFamily: fonts.displayItalic, fontSize: 18, color: colors.forest },
  brandTld: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: -0.1,
  },
  navRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  navItem: { marginRight: 8 },
  navSection: {
    fontFamily: fonts.displayRegularItalic,
    fontSize: 11,
    color: "rgba(17, 17, 17, 0.4)",
  },
  navSectionActive: { color: colors.forest },
  navLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.inkSoft,
  },
  navLabelActive: { color: colors.forest },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  bell: { padding: 6 },
  bellIcon: { fontSize: 16 },
  bellDot: {
    position: "absolute",
    top: 4,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#c43",
  },
  avatar: {
    minWidth: 36,
    height: 36,
    borderRadius: radii.control,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  avatarText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.paper,
  },
});
