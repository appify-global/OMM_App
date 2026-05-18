import { DEMO_PRIMARY_LISTING_TITLE } from '@/lib/melbourne-demo-locations';

export const VIEW_LIVE_LISTING_ID = 'view-live-demo-west-melbourne';

export function countsFromSpecLine(specLine: string): {
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
} {
  const normalized = specLine.replace(/\s+/g, ' ').trim();
  const mFull = normalized.match(
    /(\d+)\s*bedrooms?\s*[\u00B7.]\s*(\d+)\s*bathrooms?\s*[\u00B7.]\s*(\d+)\s*car(?:\s*spaces?)?/i,
  );
  if (mFull) {
    return {
      bedrooms: Number(mFull[1]),
      bathrooms: Number(mFull[2]),
      carSpaces: Number(mFull[3]),
    };
  }
  const mLegacy = normalized.match(/(\d+)\s*BED[^0-9]*(\d+)\s*BATH[^0-9]*(\d+)\s*CAR/i);
  if (mLegacy) {
    return {
      bedrooms: Number(mLegacy[1]),
      bathrooms: Number(mLegacy[2]),
      carSpaces: Number(mLegacy[3]),
    };
  }
  return { bedrooms: 0, bathrooms: 0, carSpaces: 0 };
}

export type SavedListingCardData = {
  id: string;
  title: string;
  /** Street line for compact list rows (see recent-listings layout). */
  street: string;
  suburb: string;
  price: string;
  /** Dense spec line under the price on large cards (e.g. bedrooms · bathrooms · car spaces). */
  specLine: string;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
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
  street: '142 Orrong Rd',
  suburb: 'Hawthorn East',
  price: '$2.45M',
  specLine: '3 bedrooms · 2 bathrooms · 2 car spaces',
  bedrooms: 3,
  bathrooms: 2,
  carSpaces: 2,
  badgeLeft: 'LIVE',
  badgeRight: 'SOI ATTACHED',
  footerLabels: ['48 VIEWS (7D)', '3 LEADS', 'SOI ATTACHED'],
  imageIndex: 0,
};
