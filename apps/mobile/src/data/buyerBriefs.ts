import { images } from '../constants/images';

export type BuyerBriefListItem = {
  id: string;
  title: string;
  price: string;
  details: string;
  image: (typeof images)[keyof typeof images];
};

export type BuyerBriefDetailData = {
  listItem: BuyerBriefListItem;
  contactName: string;
  contactRole: string;
  contactAvatar: (typeof images)[keyof typeof images];
  areas: string;
  budget: string;
  propertyType: string;
  minBedrooms: string;
  settlement: string;
  mustHaves: string;
  avoid: string;
};

const thumb = [images.propertyHouse1, images.propertyHouse2, images.propertyHouse3, images.reviewer1, images.agentAnton] as const;

export const BUYER_BRIEFS: BuyerBriefListItem[] = [
  {
    id: '1',
    title: 'Inner east family relocation',
    price: '$1.80m – $2.60m',
    details: 'Hawthorn, Camberwell, Kew · Peri',
    image: thumb[0],
  },
  {
    id: '2',
    title: 'Low-maintenance downsizer',
    price: '$2.10m – $2.80m',
    details: 'Malvern, Armadale · Townhouse · 1',
    image: thumb[1],
  },
  {
    id: '3',
    title: 'First home + two parks',
    price: '$900k – $1.15m',
    details: 'Brunswick East · Apt or TH · walk 1',
    image: thumb[2],
  },
  {
    id: '4',
    title: 'Yield-led investor',
    price: '$650k – $850k',
    details: 'Footscray · 2 bed · prefers settled',
    image: thumb[3],
  },
  {
    id: '5',
    title: 'Single-level prestige',
    price: '$5.0m – $7.0m',
    details: 'Toorak · off-market only · north-fa',
    image: thumb[4],
  },
  {
    id: '6',
    title: 'Park-side modern family',
    price: '$1.20m – $1.50m',
    details: 'Elsternwick · 4 bed · school zone 1',
    image: images.propertyHouse2,
  },
];

const detailsById: Record<string, Omit<BuyerBriefDetailData, 'listItem'>> = {
  '1': {
    contactName: 'Jane Doe',
    contactRole: 'Buyer agent',
    contactAvatar: images.reviewer3,
    areas: 'Hawthorn, Camberwell, Kew (north of Barkers Rd)',
    budget: '$1.80m – $2.60m · flexible if sole mandate',
    propertyType: 'Period home or renovated townhouse · 3–4 beds',
    minBedrooms: '3+ (4 preferred)',
    settlement: '60–90 days',
    mustHaves: 'North-facing living · 2 car spaces · walkable schools',
    avoid: 'Main road frontage · apartment towers',
  },
  '2': {
    contactName: 'Marco Li',
    contactRole: 'Buyer agent',
    contactAvatar: images.reviewer2,
    areas: 'Malvern, Armadale',
    budget: '$2.10m – $2.80m · pre-approval in place',
    propertyType: 'Townhouse, low-lift — 2–3 beds',
    minBedrooms: '2+ (3 ideal)',
    settlement: '30–60 days',
    mustHaves: 'Garage, minimal garden, one-level living when possible',
    avoid: 'High body corp, heritage overlays',
  },
  '3': {
    contactName: 'Aisha N.',
    contactRole: 'First-home buyer',
    contactAvatar: images.reviewer1,
    areas: 'Brunswick East, Northcote, Thornbury',
    budget: '$900k – $1.15m',
    propertyType: 'Apartment or small townhouse, walk to PT',
    minBedrooms: '2+',
    settlement: '60+ days, FHOG aligned',
    mustHaves: 'Parks, café strip in walking range',
    avoid: 'Stairs-only access, busy arterials',
  },
  '4': {
    contactName: 'Ken Patel',
    contactRole: 'Investor',
    contactAvatar: images.reviewer4,
    areas: 'Inner west — Footscray, Seddon, Yarraville',
    budget: '$650k – $850k',
    propertyType: '2 bed apartment, rental-grade',
    minBedrooms: '2',
    settlement: 'Flexible, cash-ready',
    mustHaves: 'Rental demand, yield 4%+',
    avoid: 'High special levies, cladding risk',
  },
  '5': {
    contactName: 'Elena S.',
    contactRole: 'Private client',
    contactAvatar: images.reviewer3,
    areas: 'Toorak, South Yarra',
    budget: '$5.0m – $7.0m · off-market only',
    propertyType: 'Single level, 4–5 bed, block 800m+',
    minBedrooms: '4+',
    settlement: 'As vendor prefers',
    mustHaves: 'North-facing, pool, north-facing main living',
    avoid: 'Busy roads, apartments',
  },
  '6': {
    contactName: 'Chris Bloom',
    contactRole: 'Buyer agent',
    contactAvatar: images.agentAnton,
    areas: 'Elsternwick, Caulfield North, Glenhuntly',
    budget: '$1.20m – $1.50m',
    propertyType: '3–4 bed, period or renovated',
    minBedrooms: '3+',
    settlement: '45–75 days',
    mustHaves: 'In catchment, dual living potential',
    avoid: 'West-facing only, no parking',
  },
};

export function getBuyerBriefDetail(id: string): BuyerBriefDetailData | null {
  const listItem = BUYER_BRIEFS.find((b) => b.id === id);
  if (!listItem) return null;
  const d = detailsById[id];
  if (!d) return null;
  return { listItem, ...d };
}
