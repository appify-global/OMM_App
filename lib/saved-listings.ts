import { DEMO_PRIMARY_LISTING_TITLE } from '@/lib/melbourne-demo-locations';

export const VIEW_LIVE_LISTING_ID = 'view-live-demo-west-melbourne';

/** Serializable fields for home “Saved properties” cards (dense horizontal layout). */
export type SavedListingCardData = {
  id: string;
  title: string;
  price: string;
  beds: string;
  badgeLeft: string;
  badgeRight: string;
  footerLabels: [string, string, string];
  /** Passed to `propertyImageAtIndex` in UI */
  imageIndex: number;
};

/** Payload for the demo `/view-live-listing` screen — keep in sync with that screen’s mock data. */
export const VIEW_LIVE_LISTING_CARD: SavedListingCardData = {
  id: VIEW_LIVE_LISTING_ID,
  title: DEMO_PRIMARY_LISTING_TITLE,
  price: '$2.45M',
  beds: '3 BED  2 BATH  2 CAR',
  badgeLeft: 'LIVE',
  badgeRight: 'SOI ATTACHED',
  footerLabels: ['48 VIEWS (7D)', '3 LEADS', 'Attached SOI'],
  imageIndex: 0,
};
