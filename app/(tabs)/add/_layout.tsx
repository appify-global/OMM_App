import { Stack } from 'expo-router';

import { nativeStackDramatic } from '@/lib/motion';

export default function AddStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        ...nativeStackDramatic,
        contentStyle: { backgroundColor: '#fff' },
      }}
    />
  );
}
