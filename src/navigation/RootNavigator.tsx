import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SignUpStep1Screen } from '../screens/SignUpStep1Screen';
import { SignUpStep2Screen } from '../screens/SignUpStep2Screen';
import { SignUpStep3Screen } from '../screens/SignUpStep3Screen';
import { SignUpStep4Screen } from '../screens/SignUpStep4Screen';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { MessageThreadScreen } from '../screens/MessageThreadScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AgentProfileScreen } from '../screens/AgentProfileScreen';
import { AgentReviewsScreen } from '../screens/AgentReviewsScreen';
import { AgentListingsScreen } from '../screens/AgentListingsScreen';
import { BuyerBriefsScreen } from '../screens/BuyerBriefsScreen';
import { BuyerBriefDetailScreen } from '../screens/BuyerBriefDetailScreen';
import { PostBuyerBriefScreen } from '../screens/PostBuyerBriefScreen';
import { BuyingSearchScreen } from '../screens/BuyingSearchScreen';
import { SavedSearchesScreen } from '../screens/SavedSearchesScreen';
import { AuthorityExpiringScreen } from '../screens/AuthorityExpiringScreen';
import { ListingSeeAllScreen } from '../screens/ListingSeeAllScreen';
import { ContactSupportScreen } from '../screens/ContactSupportScreen';
import { ForgotPasswordEmailScreen } from '../screens/forgot/ForgotPasswordEmailScreen';
import { ForgotPasswordPhoneScreen } from '../screens/forgot/ForgotPasswordPhoneScreen';
import { ForgotPasswordEmailOtpScreen } from '../screens/forgot/ForgotPasswordEmailOtpScreen';
import { ForgotPasswordSmsOtpScreen } from '../screens/forgot/ForgotPasswordSmsOtpScreen';
import { ForgotPasswordNewPasswordScreen } from '../screens/forgot/ForgotPasswordNewPasswordScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp1" component={SignUpStep1Screen} />
      <Stack.Screen name="SignUp2" component={SignUpStep2Screen} />
      <Stack.Screen name="SignUp3" component={SignUpStep3Screen} />
      <Stack.Screen name="SignUp4" component={SignUpStep4Screen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="MessageThread" component={MessageThreadScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="AgentProfile" component={AgentProfileScreen} />
      <Stack.Screen name="AgentReviews" component={AgentReviewsScreen} />
      <Stack.Screen name="AgentListings" component={AgentListingsScreen} />
      <Stack.Screen name="BuyerBriefs" component={BuyerBriefsScreen} />
      <Stack.Screen name="PostBuyerBrief" component={PostBuyerBriefScreen} />
      <Stack.Screen name="BuyerBriefDetail" component={BuyerBriefDetailScreen} />
      <Stack.Screen name="BuyingSearch" component={BuyingSearchScreen} />
      <Stack.Screen name="SavedSearches" component={SavedSearchesScreen} />
      <Stack.Screen name="AuthorityExpiring" component={AuthorityExpiringScreen} />
      <Stack.Screen name="ListingSeeAll" component={ListingSeeAllScreen} />
      <Stack.Screen name="ForgotPasswordEmail" component={ForgotPasswordEmailScreen} />
      <Stack.Screen name="ForgotPasswordPhone" component={ForgotPasswordPhoneScreen} />
      <Stack.Screen name="ForgotPasswordEmailOtp" component={ForgotPasswordEmailOtpScreen} />
      <Stack.Screen name="ForgotPasswordSmsOtp" component={ForgotPasswordSmsOtpScreen} />
      <Stack.Screen name="ForgotPasswordNewPassword" component={ForgotPasswordNewPasswordScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
    </Stack.Navigator>
  );
}
