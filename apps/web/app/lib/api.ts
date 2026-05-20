/**
 * OMM data layer
 * ---------------------
 * Every function here is async and returns typed data. Today they fall back
 * to curated mock data. Tomorrow they swap to a real API with a single edit
 * per function - the calling pages never need to change.
 */

export type Listing = {
  id: string;
  folio: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  priceGuide: string;
  plan: string;
  tag: "Private campaign" | "Matched buyers" | "Quiet listing" | "Open for inspection" | "Coming soon";
  image: string;
  agent: string;
  agency: string;
  bed: number;
  bath: number;
  car: number;
  land: string;
};

export type Suburb = {
  slug: string;
  name: string;
  state: string;
  median: string;
  twelveMonth: string;
  activeListings: number;
  privateCampaigns: number;
  trend: "rising" | "flat" | "cooling";
};

export type Brief = {
  id: string;
  buyerAlias: string;
  type: string;
  suburbs: string[];
  budget: string;
  timing: string;
  matched: number;
  submitted: string;
};

export type Post = {
  id: string;
  slug: string;
  category: string;
  title: string;
  dek: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
};

const MOCK_LISTINGS: Listing[] = [
  {
    id: "0241",
    folio: "0241",
    address: "502 Glenferrie Rd",
    suburb: "Hawthorn",
    state: "VIC",
    postcode: "3122",
    priceGuide: "$4.8m – 5.2m",
    plan: "5 bed · 3 bath · 4 car",
    tag: "Private campaign",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
    agent: "Harriet Rowe",
    agency: "Rowe & Partners",
    bed: 5,
    bath: 3,
    car: 4,
    land: "1,280 sqm",
  },
  {
    id: "0238",
    folio: "0238",
    address: "248 Auburn Rd",
    suburb: "Hawthorn",
    state: "VIC",
    postcode: "3122",
    priceGuide: "$3.6m – 3.9m",
    plan: "4 bed · 2 bath · 2 car",
    tag: "Matched buyers",
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=85",
    agent: "Julian Park",
    agency: "Park & Morton",
    bed: 4,
    bath: 2,
    car: 2,
    land: "880 sqm",
  },
  {
    id: "0233",
    folio: "0233",
    address: "15 Power St",
    suburb: "Hawthorn",
    state: "VIC",
    postcode: "3122",
    priceGuide: "On application",
    plan: "3 bed · 2 bath · 2 car",
    tag: "Quiet listing",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    agent: "Alice Maron",
    agency: "Maron & Co.",
    bed: 3,
    bath: 2,
    car: 2,
    land: "640 sqm",
  },
  {
    id: "0229",
    folio: "0229",
    address: "88 Sackville St",
    suburb: "Kew",
    state: "VIC",
    postcode: "3101",
    priceGuide: "$6.4m – 6.9m",
    plan: "6 bed · 4 bath · 3 car",
    tag: "Private campaign",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=85",
    agent: "Edward Thorn",
    agency: "Thorn Estates",
    bed: 6,
    bath: 4,
    car: 3,
    land: "1,740 sqm",
  },
  {
    id: "0224",
    folio: "0224",
    address: "12 Irving Rd",
    suburb: "Toorak",
    state: "VIC",
    postcode: "3142",
    priceGuide: "$9.5m – 10.5m",
    plan: "5 bed · 5 bath · 4 car",
    tag: "Coming soon",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85",
    agent: "Vivienne Kyne",
    agency: "Kyne Private",
    bed: 5,
    bath: 5,
    car: 4,
    land: "2,100 sqm",
  },
  {
    id: "0220",
    folio: "0220",
    address: "47 Lansell Rd",
    suburb: "Toorak",
    state: "VIC",
    postcode: "3142",
    priceGuide: "$7.2m – 7.8m",
    plan: "4 bed · 3 bath · 3 car",
    tag: "Private campaign",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=85",
    agent: "Cassie Holt",
    agency: "Holt & Sons",
    bed: 4,
    bath: 3,
    car: 3,
    land: "1,410 sqm",
  },
  {
    id: "0217",
    folio: "0217",
    address: "310 Glenferrie Rd",
    suburb: "Malvern",
    state: "VIC",
    postcode: "3144",
    priceGuide: "$4.1m – 4.4m",
    plan: "4 bed · 3 bath · 2 car",
    tag: "Matched buyers",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85",
    agent: "Tom Asprey",
    agency: "Asprey & Reed",
    bed: 4,
    bath: 3,
    car: 2,
    land: "760 sqm",
  },
  {
    id: "0214",
    folio: "0214",
    address: "9 Cotham Rd",
    suburb: "Kew",
    state: "VIC",
    postcode: "3101",
    priceGuide: "$3.9m – 4.2m",
    plan: "5 bed · 3 bath · 2 car",
    tag: "Open for inspection",
    image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1400&q=85",
    agent: "Robin Shah",
    agency: "Shah Residential",
    bed: 5,
    bath: 3,
    car: 2,
    land: "920 sqm",
  },
  {
    id: "0212",
    folio: "0212",
    address: "61 Mercer Rd",
    suburb: "Armadale",
    state: "VIC",
    postcode: "3143",
    priceGuide: "$2.8m – 3.1m",
    plan: "3 bed · 2 bath · 2 car",
    tag: "Quiet listing",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85",
    agent: "Grace Ellison",
    agency: "Ellison & Co.",
    bed: 3,
    bath: 2,
    car: 2,
    land: "580 sqm",
  },
];

const MOCK_SUBURBS: Suburb[] = [
  { slug: "hawthorn-vic", name: "Hawthorn", state: "VIC", median: "$2.43m", twelveMonth: "+7.8%", activeListings: 14, privateCampaigns: 6, trend: "rising" },
  { slug: "kew-vic", name: "Kew", state: "VIC", median: "$2.71m", twelveMonth: "+5.1%", activeListings: 9, privateCampaigns: 4, trend: "rising" },
  { slug: "camberwell-vic", name: "Camberwell", state: "VIC", median: "$2.58m", twelveMonth: "+6.4%", activeListings: 11, privateCampaigns: 3, trend: "rising" },
  { slug: "toorak-vic", name: "Toorak", state: "VIC", median: "$5.85m", twelveMonth: "+9.2%", activeListings: 6, privateCampaigns: 5, trend: "rising" },
  { slug: "south-yarra-vic", name: "South Yarra", state: "VIC", median: "$2.14m", twelveMonth: "+3.7%", activeListings: 18, privateCampaigns: 4, trend: "flat" },
  { slug: "malvern-vic", name: "Malvern", state: "VIC", median: "$3.12m", twelveMonth: "+4.2%", activeListings: 12, privateCampaigns: 4, trend: "flat" },
  { slug: "armadale-vic", name: "Armadale", state: "VIC", median: "$2.76m", twelveMonth: "+5.8%", activeListings: 10, privateCampaigns: 3, trend: "rising" },
  { slug: "brighton-vic", name: "Brighton", state: "VIC", median: "$3.48m", twelveMonth: "+6.1%", activeListings: 13, privateCampaigns: 5, trend: "rising" },
  { slug: "st-kilda-vic", name: "St Kilda", state: "VIC", median: "$1.62m", twelveMonth: "+2.4%", activeListings: 22, privateCampaigns: 2, trend: "flat" },
  { slug: "mosman-nsw", name: "Mosman", state: "NSW", median: "$5.32m", twelveMonth: "+7.1%", activeListings: 9, privateCampaigns: 6, trend: "rising" },
  { slug: "double-bay-nsw", name: "Double Bay", state: "NSW", median: "$8.95m", twelveMonth: "+8.6%", activeListings: 5, privateCampaigns: 4, trend: "rising" },
  { slug: "vaucluse-nsw", name: "Vaucluse", state: "NSW", median: "$9.82m", twelveMonth: "+5.9%", activeListings: 4, privateCampaigns: 3, trend: "rising" },
];

const MOCK_BRIEFS: Brief[] = [
  {
    id: "b-1",
    buyerAlias: "Upsizer, Kew family",
    type: "Family home, 4+ bed",
    suburbs: ["Kew", "Hawthorn", "Balwyn"],
    budget: "$3.5m – 4.5m",
    timing: "Settling in 90 days",
    matched: 3,
    submitted: "2 days ago",
  },
  {
    id: "b-2",
    buyerAlias: "Expat returnee",
    type: "Character home, renovated",
    suburbs: ["Toorak", "South Yarra"],
    budget: "$6m – 8m",
    timing: "Flexible",
    matched: 5,
    submitted: "5 days ago",
  },
  {
    id: "b-3",
    buyerAlias: "First home, Melbourne CBD",
    type: "Apartment, 2 bed + study",
    suburbs: ["South Yarra", "Richmond", "St Kilda"],
    budget: "$900k – 1.2m",
    timing: "Next 6 months",
    matched: 2,
    submitted: "1 week ago",
  },
  {
    id: "b-4",
    buyerAlias: "Sea-change, Mornington",
    type: "Coastal home, 3+ bed",
    suburbs: ["Mount Eliza", "Mornington", "Sorrento"],
    budget: "$2m – 2.8m",
    timing: "Settling in 120 days",
    matched: 4,
    submitted: "3 days ago",
  },
];

const MOCK_POSTS: Post[] = [
  {
    id: "p-1",
    slug: "approach-private-campaign",
    category: "Field Notes",
    title: "How to approach a private property campaign",
    dek: "The opening move matters more than the offer. Eight agents on the etiquette of approaching a quiet listing - what lands, what doesn't, and the phrases that close the door before you've walked through it.",
    author: "Harriet Rowe",
    date: "19 April 2026",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    featured: true,
  },
  {
    id: "p-2",
    slug: "buyer-briefs-the-shift",
    category: "Market Letter",
    title: "Why buyer briefs are quietly reshaping who sees a listing first",
    dek: "Thirty thousand active buyer briefs are rewriting how agents qualify interest. A field report.",
    author: "Julian Park",
    date: "12 April 2026",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "p-3",
    slug: "agents-look-for-demand",
    category: "Agent Practice",
    title: "What agents look for in serious buyer demand",
    dek: "Not every enquiry is a lead. The four signals senior agents filter for before they even reply.",
    author: "Alice Maron",
    date: "5 April 2026",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "p-4",
    slug: "the-private-market-explained",
    category: "Primer",
    title: "The private market, explained in under 1,000 words",
    dek: "Off-market, pre-market, quiet listing - the vocabulary is deliberately opaque. Here's a plain-English primer.",
    author: "Tom Asprey",
    date: "29 March 2026",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "p-5",
    slug: "melbourne-east-median-shifts",
    category: "Data",
    title: "Melbourne East: six suburbs where medians moved quietly",
    dek: "The numbers that didn't make the property pages. Suburb-by-suburb analysis of the year's quiet shifts.",
    author: "Cassie Holt",
    date: "22 March 2026",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "p-6",
    slug: "a-letter-to-first-home-buyers",
    category: "Editorial",
    title: "A letter to first home buyers, from someone who was one",
    dek: "It's fine to be slow. It's fine to say no. The market will still be here.",
    author: "Grace Ellison",
    date: "15 March 2026",
    readTime: "3 min",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85",
  },
];

async function swrOrMock<T>(endpoint: string, mock: T): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) return mock;
  try {
    const res = await fetch(`${base}${endpoint}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as T;
  } catch {
    return mock;
  }
}

export async function fetchListings(): Promise<Listing[]> {
  return swrOrMock("/listings", MOCK_LISTINGS);
}

/** Home strip: prefer suburb matches, then fill from catalogue */
export async function fetchFeaturedListingsForSuburb(
  suburb: string,
  limit = 3,
): Promise<Listing[]> {
  const all = await fetchListings();
  const key = suburb.trim().toLowerCase();
  const matched = all.filter((l) => l.suburb.toLowerCase() === key);
  if (matched.length >= limit) return matched.slice(0, limit);

  const rest = all.filter((l) => l.suburb.toLowerCase() !== key);
  return [...matched, ...rest].slice(0, limit);
}

export async function fetchSuburbs(): Promise<Suburb[]> {
  return swrOrMock("/suburbs", MOCK_SUBURBS);
}

export async function fetchBriefs(): Promise<Brief[]> {
  return swrOrMock("/briefs", MOCK_BRIEFS);
}

export async function fetchPosts(): Promise<Post[]> {
  return swrOrMock("/posts", MOCK_POSTS);
}
