import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { HomeScreen } from "../screens/HomeScreen";
import { MessagesScreen } from "../screens/MessagesScreen";
import { MessageThreadScreen } from "../screens/MessageThreadScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { AgentProfileScreen } from "../screens/AgentProfileScreen";
import { AgentReviewsScreen } from "../screens/AgentReviewsScreen";
import { AgentListingsScreen } from "../screens/AgentListingsScreen";
import { BuyerBriefsScreen } from "../screens/BuyerBriefsScreen";
import { BuyerBriefDetailScreen } from "../screens/BuyerBriefDetailScreen";
import { PostBuyerBriefScreen } from "../screens/PostBuyerBriefScreen";
import { BuyingSearchScreen } from "../screens/BuyingSearchScreen";
import { SavedSearchesScreen } from "../screens/SavedSearchesScreen";
import { AuthorityExpiringScreen } from "../screens/AuthorityExpiringScreen";
import { ListingSeeAllScreen } from "../screens/ListingSeeAllScreen";
import { ContactSupportScreen } from "../screens/ContactSupportScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="MessageThread" component={MessageThreadScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="AgentProfile" component={AgentProfileScreen} />
      <Stack.Screen name="AgentReviews" component={AgentReviewsScreen} />
      <Stack.Screen name="AgentListings" component={AgentListingsScreen} />
      <Stack.Screen name="BuyerBriefs" component={BuyerBriefsScreen} />
      <Stack.Screen name="PostBuyerBrief" component={PostBuyerBriefScreen} />
      <Stack.Screen
        name="BuyerBriefDetail"
        component={BuyerBriefDetailScreen}
      />
      <Stack.Screen name="BuyingSearch" component={BuyingSearchScreen} />
      <Stack.Screen name="SavedSearches" component={SavedSearchesScreen} />
      <Stack.Screen
        name="AuthorityExpiring"
        component={AuthorityExpiringScreen}
      />
      <Stack.Screen name="ListingSeeAll" component={ListingSeeAllScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
    </Stack.Navigator>
  );
}
