import type { Href } from 'expo-router';

import type { StoredNotification } from '@/lib/mobile-notifications-api';

function listingIdFromHref(href: string): string | undefined {
  const match = href.match(/\/listings\/(lst-[a-z0-9-]+)/i);
  return match?.[1];
}

/** Map API/web hrefs to Expo routes. */
export function notificationHrefToMobileRoute(
  row: Pick<StoredNotification, 'href' | 'listingId' | 'threadId'>,
): Href | null {
  if (row.threadId?.trim()) {
    return {
      pathname: '/contact-seller-chat',
      params: { threadId: row.threadId.trim() },
    } as Href;
  }

  const listingId = row.listingId?.trim() || listingIdFromHref(row.href);
  if (listingId) {
    return {
      pathname: '/view-live-listing',
      params: { listingId },
    } as Href;
  }

  const href = row.href.trim().toLowerCase();
  if (href.includes('message')) return '/messages' as Href;
  if (href.includes('brief')) return '/post-buyer-brief' as Href;
  if (href.includes('dispute')) return '/disputes' as Href;
  if (href.includes('billing') || href.includes('invoice')) return '/payments-billing' as Href;
  if (href.includes('review')) return '/reviews' as Href;
  if (href.includes('listing')) return '/(tabs)' as Href;

  return null;
}
