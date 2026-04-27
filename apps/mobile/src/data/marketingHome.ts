/** Content aligned with `apps/web/app/page.tsx` for native parity. */

export const quickLinks = [
  {
    title: "Private listings",
    description: "Properties offered quietly, never advertised on portals.",
    eyebrow: "Section I",
    index: "01",
  },
  {
    title: "Buyer briefs",
    description: "Tell agents precisely the home you intend to buy.",
    eyebrow: "Section II",
    index: "02",
  },
  {
    title: "Saved searches",
    description: "A standing watch on the suburbs that matter to you.",
    eyebrow: "Section III",
    index: "03",
  },
  {
    title: "Market context",
    description: "Quiet movement, told through price and tenure data.",
    eyebrow: "Section IV",
    index: "04",
  },
];

/** Mirrors `Listing` in `apps/web/app/lib/api.ts` — production `/listings` grid. */
export type PublicListing = {
  id: string;
  folio: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  priceGuide: string;
  plan: string;
  tag:
    | "Private campaign"
    | "Matched buyers"
    | "Quiet listing"
    | "Open for inspection"
    | "Coming soon";
  image: string;
  agent: string;
  agency: string;
  land: string;
};

/** Same nine rows as https://omm-production.up.railway.app/listings */
export const publicListings: PublicListing[] = [
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
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
    agent: "Harriet Rowe",
    agency: "Rowe & Partners",
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
    image:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=85",
    agent: "Julian Park",
    agency: "Park & Morton",
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
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    agent: "Alice Maron",
    agency: "Maron & Co.",
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
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=85",
    agent: "Edward Thorn",
    agency: "Thorn Estates",
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
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85",
    agent: "Vivienne Kyne",
    agency: "Kyne Private",
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
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=85",
    agent: "Cassie Holt",
    agency: "Holt & Sons",
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
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85",
    agent: "Tom Asprey",
    agency: "Asprey & Reed",
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
    image:
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1400&q=85",
    agent: "Robin Shah",
    agency: "Shah Residential",
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
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85",
    agent: "Grace Ellison",
    agency: "Ellison & Co.",
    land: "580 sqm",
  },
];

export const portfolioListingFilters = [
  "All",
  "Private campaign",
  "Quiet listing",
  "Matched buyers",
  "Coming soon",
  "Open for inspection",
] as const;

export type PortfolioListingFilter = (typeof portfolioListingFilters)[number];

export const portfolioPageStats = [
  { value: String(publicListings.length), label: "Live campaigns" },
  { value: "4", label: "New this week" },
  { value: "4.8k", label: "Matched buyers" },
] as const;

/** Home featured strip — first three portfolio rows. */
export const featuredListings = publicListings.slice(0, 3).map((l) => ({
  tag: l.tag,
  price: l.priceGuide,
  address: l.address,
  suburb: `${l.suburb}, ${l.state}`,
  meta: l.plan,
  folio: l.folio,
  image: l.image,
}));

export const insights = [
  { suburb: "Hawthorn", median: "$2.43m", growth: "+7.8%", listings: 14 },
  { suburb: "Kew", median: "$2.71m", growth: "+5.1%", listings: 9 },
  { suburb: "Camberwell", median: "$2.58m", growth: "+6.4%", listings: 11 },
  { suburb: "Toorak", median: "$5.85m", growth: "+9.2%", listings: 6 },
];

/** Suburbs / Index tab — shape aligned with web table rows (static demo data). */
export type SuburbIndexTrend = "rising" | "flat" | "cooling";

export type SuburbIndexRow = {
  slug: string;
  name: string;
  state: string;
  median: string;
  twelveMonth: string;
  trend: SuburbIndexTrend;
  activeListings: number;
  privateCampaigns: number;
};

export const suburbIndexRows: SuburbIndexRow[] = [
  {
    slug: "hawthorn-vic",
    name: "Hawthorn",
    state: "VIC",
    median: "$2.43m",
    twelveMonth: "+7.8%",
    trend: "rising",
    activeListings: 14,
    privateCampaigns: 6,
  },
  {
    slug: "kew-vic",
    name: "Kew",
    state: "VIC",
    median: "$2.71m",
    twelveMonth: "+5.1%",
    trend: "rising",
    activeListings: 9,
    privateCampaigns: 4,
  },
  {
    slug: "camberwell-vic",
    name: "Camberwell",
    state: "VIC",
    median: "$2.58m",
    twelveMonth: "+6.4%",
    trend: "flat",
    activeListings: 11,
    privateCampaigns: 5,
  },
  {
    slug: "toorak-vic",
    name: "Toorak",
    state: "VIC",
    median: "$5.85m",
    twelveMonth: "+9.2%",
    trend: "rising",
    activeListings: 6,
    privateCampaigns: 3,
  },
];

export const heroTrust = [
  "1.2k private listings",
  "4.8k verified buyers",
  "96% matched within 14 days",
];

/** Public Briefs tab — mirrors `apps/web/app/briefs/page.tsx` masthead stats. */
export const briefPageStats = [
  { value: "4.8k", label: "Active briefs" },
  { value: "1.1k", label: "Agents searching" },
  { value: "96%", label: "Matched in 14d" },
] as const;

/** Same shape as web `fetchBriefs` mock — recent briefs rail. */
export type PublicBriefExample = {
  id: string;
  buyerAlias: string;
  type: string;
  suburbs: string[];
  budget: string;
  timing: string;
  matched: number;
  submitted: string;
};

export const publicBriefExamples: PublicBriefExample[] = [
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

/** Timing options aligned with web brief form `<select>`. */
export const briefTimingOptions = [
  "Settling in 30 days",
  "Settling in 60 days",
  "Settling in 90 days",
  "Settling in 120+ days",
  "Flexible",
] as const;

/** Mirrors `Post` in `apps/web/app/lib/api.ts` (`MOCK_POSTS`). */
export type BlogPost = {
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

/** Same six posts as production blog feed — https://omm-production.up.railway.app/blog */
export const blogPosts: BlogPost[] = [
  {
    id: "p-1",
    slug: "approach-private-campaign",
    category: "Field Notes",
    title: "How to approach a private property campaign",
    dek:
      "The opening move matters more than the offer. Eight agents on the etiquette of approaching a quiet listing — what lands, what doesn't, and the phrases that close the door before you've walked through it.",
    author: "Harriet Rowe",
    date: "19 April 2026",
    readTime: "4 min",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
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
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85",
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
    image:
      "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "p-4",
    slug: "the-private-market-explained",
    category: "Primer",
    title: "The private market, explained in under 1,000 words",
    dek:
      "Off-market, pre-market, quiet listing — the vocabulary is deliberately opaque. Here's a plain-English primer.",
    author: "Tom Asprey",
    date: "29 March 2026",
    readTime: "5 min",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "p-5",
    slug: "melbourne-east-median-shifts",
    category: "Data",
    title: "Melbourne East: six suburbs where medians moved quietly",
    dek:
      "The numbers that didn't make the property pages. Suburb-by-suburb analysis of the year's quiet shifts.",
    author: "Cassie Holt",
    date: "22 March 2026",
    readTime: "7 min",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=85",
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
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85",
  },
];

/** Home horizontal rail — first five posts (matches web prominence). */
export const propertyNews = blogPosts.slice(0, 5);

/** Blog masthead stats — aligned with `apps/web/app/blog/page.tsx` `page-stats`. */
export const blogPageStats = [
  { value: String(blogPosts.length), label: "Published" },
  { value: "12.4k", label: "Subscribers" },
] as const;

export const portfolioSection = {
  kicker: "The Portfolio",
  title: "Private listings, near Hawthorn.",
  deadline:
    "Three properties under quiet campaign — selected this week.",
  cta: "View the portfolio",
};

export const indexSection = {
  kicker: "The Index",
  title: "Suburbs, by median.",
  cta: "Read the full research",
};

export const briefPanel = {
  kicker: "The Brief",
  titleLead: "Tell the market ",
  titleEm: "precisely",
  titleTrail: "\nwhat you want.",
  body:
    "A confidential brief reaches agents before a campaign begins. You name the streets, the budget, the timing. They reply when the right home appears.",
  cta: "Create a brief",
};

export const appBand = {
  kicker: "The App",
  title: "Carry the private market\nin your pocket.",
  body:
    "Save properties, compare campaigns and reach agents from a single, quiet workspace.",
  cta: "Get the app",
};

export const blogSection = {
  kicker: "The Blog",
  title: "From the editors.",
  cta: "All entries",
};

export const heroCaption = {
  folio: "0241",
  tag: "Private campaign",
};

/** About tab — copy from `apps/web/app/about/page.tsx` / production about. */
export const ABOUT_CONTACT_EMAIL = "hello@premarket.com.au";

export const aboutNarrativeParagraphs = [
  "Somewhere between the first property portal and the last bidding war, Australian real estate became a performance. Premium homes are photographed, drone-flown and broadcast to strangers in search of a faster auction. But the best sales, the ones everyone points to years later, almost never happen that way. They happen quietly — a vendor mentions a move, an agent remembers a buyer, and two people meet over coffee before a single photograph is taken.",
  "PreMarket rebuilds that quiet path as a product. Vendors list privately; agents search verified buyer briefs; introductions happen before the campaign ever goes public. The homes that want to be shouted about still get shouted about, elsewhere. We're interested in the ones that don't.",
  "We are Australian-owned, Melbourne-founded and funded to operate for the long hold. We take no portal fees, sell no buyer data, and carry no ads. The business is simple: members pay a subscription, agents pay a small referral, and the network keeps improving as it grows.",
] as const;

export const aboutPrinciples = [
  {
    title: "Quiet first.",
    body:
      "Not every home wants a portal, a sign and a queue. We run campaigns privately, so vendors control the story and buyers meet the home, not the marketing.",
  },
  {
    title: "Buyers write briefs.",
    body:
      "A buyer brief is a plain-English record of what you actually want. Agents search briefs before they build shortlists, so intent travels before listings do.",
  },
  {
    title: "Agents keep the relationship.",
    body:
      "PreMarket introduces; we don't replace. Every conversation you have is with a vetted agent, not with us, and the relationship is yours to keep.",
  },
  {
    title: "Data stays private.",
    body:
      "Your brief is visible only to verified agents. Your name, email and phone are never exposed without you choosing to.",
  },
  {
    title: "Built for the long hold.",
    body:
      "We optimise for the right match over time, not the fastest match this week. A home is bought, on average, once every thirteen years — we build for that cadence.",
  },
  {
    title: "Australian, private, permanent.",
    body:
      "Independently owned, Melbourne-founded, and funded to outlast a market cycle. No ad revenue, no data sales, no portal games.",
  },
] as const;
