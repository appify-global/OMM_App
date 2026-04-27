import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AboutScreen } from "../screens/marketing/AboutScreen";
import { BlogScreen } from "../screens/marketing/BlogScreen";
import { MarketingHomeScreen } from "../screens/marketing/MarketingHomeScreen";
import { PublicBriefsScreen } from "../screens/marketing/PublicBriefsScreen";
import { PublicListingsScreen } from "../screens/marketing/PublicListingsScreen";
import { SuburbsScreen } from "../screens/marketing/SuburbsScreen";
import { AuthSplashScreen } from "../screens/auth/AuthSplashScreen";
import { ForgotPasswordScreen } from "../screens/auth/ForgotPasswordScreen";
import { SignInScreen } from "../screens/auth/SignInScreen";
import { SignUpScreen } from "../screens/auth/SignUpScreen";
import { SignUpStep2Screen } from "../screens/auth/SignUpStep2Screen";
import { SignUpStep3Screen } from "../screens/auth/SignUpStep3Screen";
import { SignUpStep4Screen } from "../screens/auth/SignUpStep4Screen";
import { WelcomeScreen } from "../screens/auth/WelcomeScreen";
import { marketingTabBarOptions } from "../theme/navigationTheme";
import { marketingIcons } from "./tabBarIcons";

export type MarketingStackParamList = {
  MarketingTabs: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Welcome: undefined;
  AuthSplash: undefined;
  SignUpStep2: undefined;
  SignUpStep3: undefined;
  SignUpStep4: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<MarketingStackParamList>();

function MarketingTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        ...marketingTabBarOptions,
      }}
    >
      <Tab.Screen
        name="Home"
        component={MarketingHomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: marketingIcons.Home,
        }}
      />
      <Tab.Screen
        name="Listings"
        component={PublicListingsScreen}
        options={{
          tabBarLabel: "Listings",
          tabBarIcon: marketingIcons.Listings,
        }}
      />
      <Tab.Screen
        name="Suburbs"
        component={SuburbsScreen}
        options={{
          tabBarLabel: "Suburbs",
          tabBarIcon: marketingIcons.Suburbs,
        }}
      />
      <Tab.Screen
        name="Briefs"
        component={PublicBriefsScreen}
        options={{
          tabBarLabel: "Briefs",
          tabBarIcon: marketingIcons.Briefs,
        }}
      />
      <Tab.Screen
        name="Blog"
        component={BlogScreen}
        options={{
          tabBarLabel: "Blog",
          tabBarIcon: marketingIcons.Blog,
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          tabBarLabel: "About",
          tabBarIcon: marketingIcons.About,
        }}
      />
    </Tab.Navigator>
  );
}

export function MarketingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketingTabs" component={MarketingTabs} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="AuthSplash" component={AuthSplashScreen} />
      <Stack.Screen name="SignUpStep2" component={SignUpStep2Screen} />
      <Stack.Screen name="SignUpStep3" component={SignUpStep3Screen} />
      <Stack.Screen name="SignUpStep4" component={SignUpStep4Screen} />
    </Stack.Navigator>
  );
}
