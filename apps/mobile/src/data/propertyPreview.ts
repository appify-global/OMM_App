import { images } from '../constants/images';

export type PropertyPreviewData = {
  id: string;
  /** Hero carousel - local image keys */
  gallery: (typeof images)[keyof typeof images][];
  addressLine: string;
  listPrice: string;
  soi: {
    priceGuide: string;
    issued: string;
    expires: string;
    /** SOI bottom sheet (screenshot 3) - fall back to `addressLine` if omitted. */
    sheetAddress?: string;
    priceRangeDisplay?: string;
    validityOneLine?: string;
  };
  beds: number;
  baths: number;
  cars: number;
  description: string;
  locationExterior: (typeof images)[keyof typeof images];
  amenities: { school: string; mall: string; supermarket: string };
  agent: {
    name: string;
    agency: string;
    rating: string;
    reviewCount: string;
    listingCount: string;
    image: (typeof images)[keyof typeof images];
  };
  videoLabel: string;
};

const HAWTHORN: PropertyPreviewData = {
  id: 'listing-hawthorn',
  gallery: [images.propertyHouse1, images.propertyHouse2, images.propertyHouse3],
  addressLine: 'Hawthorn City Center, Victoria',
  listPrice: '$2,450,000',
  soi: {
    priceGuide: 'Price guide $2.35M - $2.55M',
    issued: 'Issued 12 Apr 2024',
    expires: 'Expires 12 Jul 2024',
    sheetAddress: '42 Hawthorn City Center · Victoria',
    priceRangeDisplay: '$2,350,000 - $2,550,000',
    validityOneLine: 'Issued 12 Apr 2026 · Expires 12 Jul 2026',
  },
  beds: 3,
  baths: 2,
  cars: 2,
  description:
    'Contemporary family home with north-facing living, stone kitchen, and private courtyard. Walk to Auburn Village, trams, and leading schools. Statement of information and contract available on request.',
  locationExterior: images.propertyHouse2,
  amenities: {
    school: '3 km',
    mall: '4 km',
    supermarket: '1.5 km',
  },
  agent: {
    name: 'Anton Zhouk',
    agency: 'Ray White Hawthorn',
    rating: '4.9',
    reviewCount: '42',
    listingCount: '12',
    image: images.agentAnton,
  },
  videoLabel: '0:42',
};

const BY_ID: Record<string, PropertyPreviewData> = {
  'listing-hawthorn': HAWTHORN,
  'listing-auburn': {
    ...HAWTHORN,
    id: 'listing-auburn',
    gallery: [images.propertyHouse2, images.propertyHouse3, images.propertyHouse1],
    addressLine: 'Auburn Residence, Hawthorn, Victoria',
    listPrice: '$1,450,000',
    soi: {
      priceGuide: 'Price guide $1.38M - $1.52M',
      issued: 'Issued 2 Mar 2024',
      expires: 'Expires 2 Jun 2024',
    },
    beds: 3,
    baths: 2,
    cars: 1,
    description:
      'Renovated period front with open-plan rear extension. Close to Swinburne, cafes, and station.',
    locationExterior: images.propertyHouse1,
  },
  'off-camberwell': {
    ...HAWTHORN,
    id: 'off-camberwell',
    gallery: [images.propertyHouse1, images.propertyHouse2, images.propertyHouse1],
    addressLine: 'Camberwell Family Home, Victoria',
    listPrice: '$2,100,000',
    soi: {
      priceGuide: 'Price guide $1.95M - $2.2M',
      issued: 'Issued 1 Apr 2024',
      expires: 'Expires 1 Jul 2024',
    },
    beds: 4,
    baths: 3,
    cars: 2,
    description: 'Off-market family home with pool and north rear. Private inspections by appointment.',
    locationExterior: images.propertyHouse3,
  },
  'off-hawthorn-vic': {
    ...HAWTHORN,
    id: 'off-hawthorn-vic',
    gallery: [images.propertyHouse2, images.propertyHouse1, images.propertyHouse3],
    addressLine: 'Hawthorn Victorian, Victoria',
    listPrice: '$1,600,000',
    soi: {
      priceGuide: 'Price guide $1.5M - $1.7M',
      issued: 'Issued 20 Mar 2024',
      expires: 'Expires 20 Jun 2024',
    },
    beds: 3,
    baths: 2,
    cars: 1,
    description: 'Elegant double-fronted Victorian with modern rear studio. Off-market; qualified buyers only.',
    locationExterior: images.propertyHouse2,
  },
  'sell-1': {
    ...HAWTHORN,
    id: 'sell-1',
    addressLine: '47 Hawthorn St, City Center, Victoria',
    listPrice: '$1,850,000',
    soi: {
      priceGuide: 'Price guide $1.75M - $1.9M',
      issued: 'Issued 5 Apr 2024',
      expires: 'Expires 5 Jul 2024',
    },
    beds: 4,
    baths: 3,
    cars: 2,
  },
  'sell-2': {
    ...HAWTHORN,
    id: 'sell-2',
    gallery: [images.propertyHouse2, images.propertyHouse1, images.propertyHouse3],
    addressLine: '12 Park St, Brighton, Victoria',
    listPrice: '$2,200,000',
    beds: 3,
    baths: 2,
    cars: 1,
  },
  'sell-3': {
    ...HAWTHORN,
    id: 'sell-3',
    gallery: [images.propertyHouse3, images.propertyHouse1, images.propertyHouse2],
    addressLine: '88 Auburn Rd, Hawthorn, Victoria',
    listPrice: '$1,450,000',
    beds: 3,
    baths: 2,
    cars: 1,
  },
  'sell-4': {
    ...HAWTHORN,
    id: 'sell-4',
    addressLine: '2 Esplanade, Brighton, Victoria',
    listPrice: '$3,100,000',
    beds: 5,
    baths: 4,
    cars: 3,
  },
  'off-1': {
    ...HAWTHORN,
    id: 'off-1',
    addressLine: '8 Riverside Ave, Camberwell, Victoria',
    listPrice: '$2,100,000',
    beds: 4,
    baths: 3,
    cars: 2,
  },
  'off-2': {
    ...HAWTHORN,
    id: 'off-2',
    addressLine: '16 Lynch St, Hawthorn, Victoria',
    listPrice: '$1,550,000',
    beds: 3,
    baths: 2,
    cars: 1,
  },
  'off-3': {
    ...HAWTHORN,
    id: 'off-3',
    addressLine: '44 Canterbury Rd, Surrey Hills, Victoria',
    listPrice: '$3,200,000',
    beds: 4,
    baths: 3,
    cars: 2,
  },
  'off-4': {
    ...HAWTHORN,
    id: 'off-4',
    addressLine: '3 Kooyong Rd, South Yarra, Victoria',
    listPrice: '$1,900,000',
    beds: 2,
    baths: 2,
    cars: 1,
  },
  'search-1': {
    ...HAWTHORN,
    id: 'search-1',
    addressLine: '8 Riverside Ave, Camberwell, Victoria',
    listPrice: '$2,100,000',
    beds: 4,
    baths: 3,
    cars: 2,
  },
  'search-2': {
    ...HAWTHORN,
    id: 'search-2',
    addressLine: '16 Lynch St, Hawthorn, Victoria',
    listPrice: '$1,500,000',
    beds: 3,
    baths: 2,
    cars: 1,
  },
  'search-3': {
    ...HAWTHORN,
    id: 'search-3',
    addressLine: '2 Edge Ave, Kew East, Victoria',
    listPrice: '$1,200,000',
    beds: 3,
    baths: 1,
    cars: 1,
  },
  'search-4': {
    ...HAWTHORN,
    id: 'search-4',
    addressLine: '44 Canterbury Rd, Surrey Hills, Victoria',
    listPrice: '$3,000,000',
    beds: 4,
    baths: 3,
    cars: 2,
  },
};

export function getPropertyPreview(listingId: string): PropertyPreviewData {
  return BY_ID[listingId] ?? HAWTHORN;
}
