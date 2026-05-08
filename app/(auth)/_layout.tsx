import { Stack } from 'expo-router';

import { nativeStackDramatic } from '@/lib/motion';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        ...nativeStackDramatic,
        contentStyle: { backgroundColor: '#ffffff' },
      }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="contact-support" />
      <Stack.Screen name="share-feedback" />
    </Stack>
  );
}
