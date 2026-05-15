/**
 * Published agent reviews — public cards show suburb + property type only (no full street).
 */

export type PublishedAgentReview = {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  rating: string;
  quote: string;
  date: string;
  suburb: string;
  propertyType: string;
};

export const PUBLISHED_AGENT_REVIEWS: PublishedAgentReview[] = [
  {
    id: 'pub-1',
    reviewerName: 'Sarah Chen',
    reviewerRole: 'Buyers Agent • BR Realty',
    rating: '5.0',
    quote: 'Quick replies, SOI was always on hand. Settlement ran smooth.',
    date: '14 APR 2026',
    suburb: 'Brighton East',
    propertyType: 'House',
  },
  {
    id: 'pub-2',
    reviewerName: 'Tom Reid',
    reviewerRole: 'Selling agent • Marshall White',
    rating: '4.8',
    quote: 'Clear authority docs, fair commission split. Would work with again.',
    date: '02 APR 2026',
    suburb: 'Elsternwick',
    propertyType: 'Townhouse',
  },
];

export function publishedReviewContextLine(review: PublishedAgentReview): string {
  return `${review.suburb} · ${review.propertyType}`;
}
