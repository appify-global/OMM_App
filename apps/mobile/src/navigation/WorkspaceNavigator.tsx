import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { BriefDetailScreen } from "../screens/workspace/BriefDetailScreen";
import { BriefsScreen } from "../screens/workspace/BriefsScreen";
import { ListingDetailScreen } from "../screens/workspace/ListingDetailScreen";
import { ListingsScreen } from "../screens/workspace/ListingsScreen";
import { MessagesScreen } from "../screens/workspace/MessagesScreen";
import { NewBriefScreen } from "../screens/workspace/NewBriefScreen";
import { NewListingScreen } from "../screens/workspace/NewListingScreen";
import { NotificationsScreen } from "../screens/workspace/NotificationsScreen";
import { PlaceholderScreen } from "../screens/workspace/PlaceholderScreen";
import { ProfileScreen } from "../screens/workspace/ProfileScreen";
import { SearchWorkspaceScreen } from "../screens/workspace/SearchWorkspaceScreen";
import { ThreadScreen } from "../screens/workspace/ThreadScreen";
import { WorkspaceHomeScreen } from "../screens/workspace/WorkspaceHomeScreen";
import {
  marketingTabBarOptions,
  stackScreenOptions,
} from "../theme/navigationTheme";
import type {
  BriefsStackParamList,
  HomeStackParamList,
  ListingsStackParamList,
  MessagesStackParamList,
  ProfileStackParamList,
} from "./workspaceTypes";
import { workspaceIcons } from "./tabBarIcons";

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="WorkspaceHome" component={WorkspaceHomeScreen} />
      <HomeStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          ...stackScreenOptions,
          headerShown: true,
          title: "Notifications",
        }}
      />
    </HomeStack.Navigator>
  );
}

const ListingsStackNav = createNativeStackNavigator<ListingsStackParamList>();
function ListingsStackNavigator() {
  return (
    <ListingsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ListingsStackNav.Screen name="ListingsList" component={ListingsScreen} />
      <ListingsStackNav.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{
          ...stackScreenOptions,
          headerShown: true,
          title: "Listing",
        }}
      />
      <ListingsStackNav.Screen
        name="ListingNew"
        component={NewListingScreen}
        options={{
          ...stackScreenOptions,
          headerShown: true,
          title: "New listing",
        }}
      />
    </ListingsStackNav.Navigator>
  );
}

const BriefsStackNav = createNativeStackNavigator<BriefsStackParamList>();
function BriefsStackNavigator() {
  return (
    <BriefsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <BriefsStackNav.Screen name="BriefsList" component={BriefsScreen} />
      <BriefsStackNav.Screen
        name="BriefDetail"
        component={BriefDetailScreen}
        options={{
          ...stackScreenOptions,
          headerShown: true,
          title: "Brief",
        }}
      />
      <BriefsStackNav.Screen
        name="BriefNew"
        component={NewBriefScreen}
        options={{
          ...stackScreenOptions,
          headerShown: true,
          title: "New brief",
        }}
      />
    </BriefsStackNav.Navigator>
  );
}

const MessagesStackNav = createNativeStackNavigator<MessagesStackParamList>();
function MessagesStackNavigator() {
  return (
    <MessagesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStackNav.Screen name="MessagesList" component={MessagesScreen} />
      <MessagesStackNav.Screen
        name="ThreadDetail"
        component={ThreadScreen}
        options={{
          ...stackScreenOptions,
          headerShown: true,
          title: "Thread",
        }}
      />
    </MessagesStackNav.Navigator>
  );
}

const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  return (
    <ProfileStackNav.Navigator
      screenOptions={{ ...stackScreenOptions, headerShown: true }}
    >
      <ProfileStackNav.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStackNav.Screen
        name="ProfileEdit"
        component={PlaceholderScreen}
        options={{ title: "Edit profile" }}
        initialParams={{
          title: "Edit profile",
          subtitle: "Native form parity with the web profile editor.",
        }}
      />
      <ProfileStackNav.Screen
        name="Account"
        component={PlaceholderScreen}
        options={{ title: "Account" }}
        initialParams={{ title: "Account settings" }}
      />
      <ProfileStackNav.Screen
        name="Support"
        component={PlaceholderScreen}
        options={{ title: "Support" }}
        initialParams={{ title: "Contact support" }}
      />
      <ProfileStackNav.Screen
        name="Feedback"
        component={PlaceholderScreen}
        options={{ title: "Feedback" }}
        initialParams={{ title: "Share feedback" }}
      />
      <ProfileStackNav.Screen
        name="Reviews"
        component={PlaceholderScreen}
        options={{ title: "Reviews" }}
        initialParams={{ title: "Reviews" }}
      />
      <ProfileStackNav.Screen
        name="ReviewsNew"
        component={PlaceholderScreen}
        options={{ title: "New review" }}
        initialParams={{ title: "New review" }}
      />
      <ProfileStackNav.Screen
        name="Disputes"
        component={PlaceholderScreen}
        options={{ title: "Disputes" }}
        initialParams={{ title: "Disputes" }}
      />
      <ProfileStackNav.Screen
        name="DisputeDetail"
        component={PlaceholderScreen}
        options={{ title: "Dispute" }}
      />
      <ProfileStackNav.Screen
        name="DisputeNew"
        component={PlaceholderScreen}
        options={{ title: "New dispute" }}
        initialParams={{ title: "New dispute" }}
      />
      <ProfileStackNav.Screen
        name="Billing"
        component={PlaceholderScreen}
        options={{ title: "Billing" }}
        initialParams={{ title: "Payments & billing" }}
      />
      <ProfileStackNav.Screen
        name="Payouts"
        component={PlaceholderScreen}
        options={{ title: "Payouts" }}
        initialParams={{ title: "Payout history" }}
      />
      <ProfileStackNav.Screen
        name="LegalDoc"
        component={PlaceholderScreen}
        options={{ title: "Legal" }}
      />
      <ProfileStackNav.Screen
        name="Danger"
        component={PlaceholderScreen}
        options={{ title: "Delete account" }}
        initialParams={{ title: "Delete account" }}
      />
      <ProfileStackNav.Screen
        name="SavedListings"
        component={PlaceholderScreen}
        options={{ title: "Saved" }}
        initialParams={{ title: "Saved listings" }}
      />
      <ProfileStackNav.Screen
        name="SavedSearches"
        component={PlaceholderScreen}
        options={{ title: "Saved searches" }}
        initialParams={{ title: "Saved searches" }}
      />
      <ProfileStackNav.Screen
        name="SavedSearchDetail"
        component={PlaceholderScreen}
        options={{ title: "Search" }}
      />
      <ProfileStackNav.Screen
        name="Search"
        component={SearchWorkspaceScreen}
        options={{ title: "Search" }}
      />
    </ProfileStackNav.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export function WorkspaceNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        ...marketingTabBarOptions,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: workspaceIcons.HomeTab,
        }}
      />
      <Tab.Screen
        name="ListingsTab"
        component={ListingsStackNavigator}
        options={{
          tabBarLabel: "Listings",
          tabBarIcon: workspaceIcons.ListingsTab,
        }}
      />
      <Tab.Screen
        name="BriefsTab"
        component={BriefsStackNavigator}
        options={{
          tabBarLabel: "Briefs",
          tabBarIcon: workspaceIcons.BriefsTab,
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStackNavigator}
        options={{
          tabBarLabel: "Messages",
          tabBarIcon: workspaceIcons.MessagesTab,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: workspaceIcons.ProfileTab,
        }}
      />
    </Tab.Navigator>
  );
}
