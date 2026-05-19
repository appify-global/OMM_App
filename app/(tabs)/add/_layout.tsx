import { Stack } from 'expo-router';

import { ListingDraftProvider } from '@/components/list-add/listing-draft-context';

export default function AddStackLayout() {
  return (
    <ListingDraftProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#fff' },
        }}
      />
    </ListingDraftProvider>
  );
}
