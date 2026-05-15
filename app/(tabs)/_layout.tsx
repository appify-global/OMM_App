import {
  TAB_ICON_INACTIVE,
  TAB_SLOT_SIZE,
  TabActivitiesGlyph,
  TabAddGlyph,
  TabHomeGlyph,
  TabListGlyph,
  TabProfileGlyph,
} from "@/components/TabBarGlyphs";
import { accent, frost, slateNavy } from "@/constants/theme";
import { isAuthenticated } from "@/lib/auth-session";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

type TabName = "home" | "activities" | "add" | "list" | "profile";

function TabBarIcon({ tab, focused }: { tab: TabName; focused: boolean }) {
  const inactive = TAB_ICON_INACTIVE;
  /** REA-inspired light “selected” tray; glyphs use accent when focused. */
  const active = accent;

  const glyph = (color: string) => {
    switch (tab) {
      case "home":
        return <TabHomeGlyph color={color} />;
      case "activities":
        return <TabActivitiesGlyph color={color} />;
      case "add":
        return <TabAddGlyph color={color} />;
      case "list":
        return <TabListGlyph color={color} />;
      case "profile":
        return <TabProfileGlyph color={color} />;
    }
  };

  return (
    <View style={[styles.slot, focused && styles.slotActive]}>
      {glyph(focused ? active : inactive)}
    </View>
  );
}

/**
 * Navigation’s UIKit tab item uses `justifyContent: 'flex-start'` for icon-above-label.
 * Icons should stay vertically centered relative to labels — override Navigation defaults.
 */
function TabBarButton({ style, ...rest }: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...rest}
      android_ripple={{ borderless: true }}
      style={[style, styles.tabPressableCentered]}
    />
  );
}

export default function TabLayout() {
  const [gate, setGate] = useState<"loading" | "authed" | "guest">("loading");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ok = await isAuthenticated();
        if (alive) setGate(ok ? "authed" : "guest");
      } catch {
        if (alive) setGate("guest");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (gate === "loading") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: frost,
        }}>
        <ActivityIndicator color="#000000" />
      </View>
    );
  }
  if (gate === "guest") {
    return <Redirect href="/welcome" />;
  }

  return (
    <Tabs
      safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: slateNavy,
        tabBarInactiveTintColor: TAB_ICON_INACTIVE,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarButton: (p) => <TabBarButton {...p} />,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.tabIconPosition,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon tab="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Activities",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon tab="activities" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon tab="add" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: "List",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon tab="list" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon tab="profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    height: 72,
    borderTopWidth: 0,
    borderRadius: 50,
    marginHorizontal: 16,
    marginBottom: Platform.select({ ios: 24, default: 16 }),
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 14,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginVertical: 0,
  },
  tabIconPosition: {
    marginTop: 0,
    marginBottom: 2,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  tabBarLabel: {
    fontSize: 10,
    fontFamily: "Satoshi-Medium",
    letterSpacing: 0.15,
    marginTop: -2,
  },
  tabPressableCentered: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
  },
  slot: {
    width: TAB_SLOT_SIZE,
    height: TAB_SLOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  slotActive: {
    borderRadius: 9,
    backgroundColor: "rgba(17,17,17,0.07)",
  },
});
