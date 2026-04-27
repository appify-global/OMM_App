import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

type IonName = ComponentProps<typeof Ionicons>["name"];

const ICON_SIZE = 23;
const ICON_SIZE_FOCUSED = 24;

function makeTabIcon(outline: IonName, solid: IonName) {
  return function TabIcon({
    color,
    focused,
  }: {
    color: string;
    size: number;
    focused: boolean;
  }) {
    return (
      <Ionicons
        name={focused ? solid : outline}
        size={focused ? ICON_SIZE_FOCUSED : ICON_SIZE}
        color={color}
      />
    );
  };
}

/** Marketing stack bottom tabs — matches SiteHeader destinations. */
export const marketingIcons = {
  Home: makeTabIcon("home-outline", "home"),
  Listings: makeTabIcon("albums-outline", "albums"),
  Suburbs: makeTabIcon("map-outline", "map"),
  Briefs: makeTabIcon("document-text-outline", "document-text"),
  Blog: makeTabIcon("newspaper-outline", "newspaper"),
  About: makeTabIcon("information-circle-outline", "information-circle"),
} as const;

/** Signed-in workspace tabs. */
export const workspaceIcons = {
  HomeTab: makeTabIcon("home-outline", "home"),
  ListingsTab: makeTabIcon("pricetags-outline", "pricetags"),
  BriefsTab: makeTabIcon("document-text-outline", "document-text"),
  MessagesTab: makeTabIcon("chatbubbles-outline", "chatbubbles"),
  ProfileTab: makeTabIcon("person-outline", "person"),
} as const;
