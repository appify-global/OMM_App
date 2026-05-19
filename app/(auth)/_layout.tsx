import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';

import { nativeStackDramatic } from '@/lib/motion';

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        ...nativeStackDramatic,
        contentStyle: { backgroundColor: '#ffffff' },
      }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="contact-support" />
      <Stack.Screen name="share-feedback" />
    </Stack>
  );
}
