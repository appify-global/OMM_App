export type ListingStatus = "ACTIVE" | "SOI PENDING" | "DRAFT" | "OFF-MARKET" | "PRIVATE" | "EXCLUSIVE";

export type Listing = {
  id: string;
  title: string;
  address: string;
  priceRange: string;
  status: ListingStatus;
  authorityDaysLeft: number | null;
  beds: number;
  baths: number;
  landSqm: number;
  views7d: number;
  leads: number;
  soiAttached: boolean;
};

export type Enquiry = {
  id: string;
  name: string;
  address: string;
  listingTitle: string;
  hoursAgo: number;
};

export type AuthorityExpiring = {
  id: string;
  title: string;
  address: string;
  daysLeft: number;
};

export type BuyerMatch = {
  id: string;
  suburb: string;
  criteria: string;
  newCount?: number;
};

export type SavedSearch = {
  id: string;
  title: string;
  criteria: string;
  alertsOn: boolean;
  newCount: number;
};

export type AgentReply = {
  id: string;
  agentName: string;
  agentFirm: string;
  snippet: string;
};

export type OffMarketMatch = {
  id: string;
  title: string;
  status: "OFF-MARKET" | "PRIVATE" | "EXCLUSIVE";
  matchPercent: number;
  priceRange: string;
  beds: number;
  baths: number;
  landSqm: number;
};

export const activeListings: Listing[] = [
  {
    id: "lst-hawthorn-city-center",
    title: "Hawthorn City Center",
    address: "88 Glenferrie Rd, Hawthorn",
    priceRange: "$2.0M – $2.2M",
    status: "ACTIVE",
    authorityDaysLeft: 14,
    beds: 4,
    baths: 3,
    landSqm: 650,
    views7d: 312,
    leads: 6,
    soiAttached: true,
  },
  {
    id: "lst-brighton-terrace",
    title: "Brighton Terrace",
    address: "12 Park St, Brighton",
    priceRange: "$8.0M – $8.5M",
    status: "SOI PENDING",
    authorityDaysLeft: 6,
    beds: 5,
    baths: 4,
    landSqm: 820,
    views7d: 188,
    leads: 3,
    soiAttached: true,
  },
];

export const latestEnquiries: Enquiry[] = [
  {
    id: "enq-john-doe",
    name: "John Doe",
    address: "1 Clive Rd, Hawthorn East",
    listingTitle: "Hawthorn City Center",
    hoursAgo: 2,
  },
  {
    id: "enq-anita-wong",
    name: "Anita Wong",
    address: "14 Park St, Brighton",
    listingTitle: "Brighton Terrace",
    hoursAgo: 5,
  },
];

export const authorityExpiringSoon: AuthorityExpiring[] = [
  {
    id: "auth-brighton-terrace",
    title: "Brighton Terrace",
    address: "12 Park St, Brighton",
    daysLeft: 6,
  },
  {
    id: "auth-hawthorn-city-center",
    title: "Hawthorn City Center",
    address: "88 Glenferrie Rd, Hawthorn",
    daysLeft: 14,
  },
  {
    id: "auth-south-yarra-penthouse",
    title: "South Yarra Penthouse",
    address: "5 Toorak Rd, South Yarra",
    daysLeft: 21,
  },
];

export const buyerMatches: BuyerMatch[] = [
  {
    id: "match-boroondara",
    suburb: "Boroondara",
    criteria: "4 bed family · $1.8M – $2.3M",
  },
  {
    id: "match-brighton-east",
    suburb: "Brighton East",
    criteria: "Townhouse, 3 bed · $5.0M+",
  },
  {
    id: "match-hawthorn",
    suburb: "Hawthorn",
    criteria: "House, 4+ bed · $2.2M – $2.6M",
  },
];

export const newEnquiriesCount = 3;
export const transactionsAwaitingReviewCount = 2;

export const savedSearches: SavedSearch[] = [
  {
    id: "ss-boroondara",
    title: "Boroondara, VIC",
    criteria: "4+ beds · House · $1.8M – 2.4M",
    alertsOn: true,
    newCount: 8,
  },
  {
    id: "ss-brighton-brighton-east",
    title: "Brighton & Brighton East",
    criteria: "3+ beds · Townhouse · $5M+",
    alertsOn: true,
    newCount: 5,
  },
];

export const recentAgentReplies: AgentReply[] = [
  {
    id: "rep-sarah-lin",
    agentName: "Sarah Lin",
    agentFirm: "Jellis Craig",
    snippet: "Yes, off-market in Camberwell available next month…",
  },
  {
    id: "rep-tom-reid",
    agentName: "Tom Reid",
    agentFirm: "Marshall White",
    snippet: "I have two pre-market matches for your brief…",
  },
];

export const offMarketMatches: OffMarketMatch[] = [
  {
    id: "om-camberwell-family-home",
    title: "Camberwell Family Home",
    status: "OFF-MARKET",
    matchPercent: 92,
    priceRange: "$2.1M – $2.3M",
    beds: 4,
    baths: 3,
    landSqm: 720,
  },
  {
    id: "om-hawthorn-townhouse",
    title: "Hawthorn Townhouse",
    status: "OFF-MARKET",
    matchPercent: 88,
    priceRange: "$1.95M – $2.15M",
    beds: 4,
    baths: 2,
    landSqm: 410,
  },
];

export const buyingNotifications = {
  newAgentReplies: 2,
  transactionsAwaitingReview: 1,
};

export type DraftListing = {
  id: string;
  title: string;
  address: string;
  step: number;
  totalSteps: number;
  lastEditedDays: number;
};

export const draftListings: DraftListing[] = [
  {
    id: "drf-toorak-villa",
    title: "Toorak Villa",
    address: "21 Lansell Rd, Toorak",
    step: 3,
    totalSteps: 5,
    lastEditedDays: 1,
  },
  {
    id: "drf-malvern-east-courtyard",
    title: "Malvern East Courtyard",
    address: "9 Stanhope Gr, Malvern East",
    step: 1,
    totalSteps: 5,
    lastEditedDays: 4,
  },
];

export type ArchivedListing = {
  id: string;
  title: string;
  address: string;
  closedReason: "SOLD" | "WITHDRAWN" | "EXPIRED";
  closedAt: string;
  finalPrice?: string;
};

export const archivedListings: ArchivedListing[] = [
  {
    id: "arc-armadale-edwardian",
    title: "Armadale Edwardian",
    address: "44 Kooyong Rd, Armadale",
    closedReason: "SOLD",
    closedAt: "Mar 2026",
    finalPrice: "$3.42M",
  },
  {
    id: "arc-richmond-warehouse",
    title: "Richmond Warehouse Conversion",
    address: "112 Stewart St, Richmond",
    closedReason: "SOLD",
    closedAt: "Feb 2026",
    finalPrice: "$2.18M",
  },
  {
    id: "arc-prahran-terrace",
    title: "Prahran Terrace",
    address: "7 Wattle St, Prahran",
    closedReason: "WITHDRAWN",
    closedAt: "Jan 2026",
  },
];

export type ListingEnquiryRow = {
  id: string;
  listingId: string;
  listingTitle: string;
  enquiries7d: number;
  views7d: number;
  conversionPct: number;
};

export type ListingDetail = Listing & {
  description: string;
  features: string[];
  images: { src: string; caption: string }[];
  agentName: string;
  agentFirm: string;
  campaignStartedDays: number;
  inspections: { day: string; time: string; rsvps: number }[];
  privateInspections: number;
  vendorName: string;
  vendorEmail: string;
  authoritySigned: string;
  soiAttached: boolean;
  views30d: number;
  enquiries30d: number;
  socialPosts: number;
};

export const listingDetails: Record<string, ListingDetail> = {
  "lst-hawthorn-city-center": {
    ...activeListings[0],
    description:
      "A poised Edwardian on a 650m² north-facing block, walking distance to Glenferrie Road and the Hawthorn rail line. Five reception spaces, a stone kitchen by Studio Tate, and a private rear garden by landscape designer Paul Bangay.",
    features: [
      "Five reception rooms",
      "Studio Tate stone kitchen",
      "Paul Bangay garden",
      "Off-street parking for three",
      "Hydronic underfloor heating",
      "Cellar (240 bottles)",
    ],
    images: [
      { src: "", caption: "Plate I — Façade, Glenferrie Rd" },
      { src: "", caption: "Plate II — Principal salon" },
      { src: "", caption: "Plate III — Kitchen, Studio Tate" },
      { src: "", caption: "Plate IV — Garden, P. Bangay" },
    ],
    agentName: "John Lockheart",
    agentFirm: "PreMarket — Boroondara",
    campaignStartedDays: 9,
    inspections: [
      { day: "Sat 26 Apr", time: "11:00–11:30", rsvps: 14 },
      { day: "Wed 30 Apr", time: "18:00–18:30", rsvps: 6 },
    ],
    privateInspections: 3,
    vendorName: "Mr & Mrs Whitfield",
    vendorEmail: "whitfield.estate@private.au",
    authoritySigned: "16 Apr 2026",
    views30d: 1124,
    enquiries30d: 22,
    socialPosts: 4,
  },
  "lst-brighton-terrace": {
    ...activeListings[1],
    description:
      "An exclusive Brighton terrace overlooking Park Street's chestnut avenue. Three storeys, a private garden, double parking, and the original 1924 cornicing painstakingly restored.",
    features: [
      "1924 restoration",
      "Private walled garden",
      "Cellar & lift",
      "Garaging for two",
      "Sea-facing principal suite",
      "Heated marble bathrooms",
    ],
    images: [
      { src: "", caption: "Plate I — Park Street elevation" },
      { src: "", caption: "Plate II — Principal salon, north light" },
      { src: "", caption: "Plate III — Kitchen & breakfast room" },
    ],
    agentName: "John Lockheart",
    agentFirm: "PreMarket — Bayside",
    campaignStartedDays: 21,
    inspections: [{ day: "By appointment", time: "Private", rsvps: 0 }],
    privateInspections: 8,
    vendorName: "The Hartley Family",
    vendorEmail: "hartley.estate@private.au",
    authoritySigned: "5 Apr 2026",
    views30d: 612,
    enquiries30d: 11,
    socialPosts: 0,
  },
};

export function getListingDetail(id: string): ListingDetail | null {
  return listingDetails[id] ?? null;
}

/* ============================================
   BRIEFS
   ============================================ */

export type BriefStatus = "ACTIVE" | "DRAFT" | "PAUSED" | "MATCHED" | "ARCHIVED";

export type BriefMatch = {
  id: string;
  listingTitle: string;
  address: string;
  matchPercent: number;
  priceRange: string;
  agentName: string;
  agentFirm: string;
  source: "OFF-MARKET" | "PRE-MARKET" | "EXCLUSIVE";
};

export type BriefReply = {
  id: string;
  agentName: string;
  agentFirm: string;
  hoursAgo: number;
  snippet: string;
  matchId?: string;
};

export type Brief = {
  id: string;
  title: string;
  ownerSide: "BUYER" | "SELLER";
  postedDays: number;
  status: BriefStatus;
  suburbs: string;
  budget: string;
  propertyType: string;
  minBeds: string;
  briefBody: string;
  matchCount: number;
  unreadReplies: number;
  matches: BriefMatch[];
  replies: BriefReply[];
};

export const myPostedBriefs: Brief[] = [
  {
    id: "brf-hawthorn-kew",
    title: "Hawthorn / Kew",
    ownerSide: "BUYER",
    postedDays: 4,
    status: "ACTIVE",
    suburbs: "Hawthorn, Camberwell, Kew (north of Barkers Rd)",
    budget: "$1.80M – $2.60M · flexible if sole mandate",
    propertyType: "Period home or renovated townhouse · 3–4 beds",
    minBeds: "3+ (4 preferred)",
    briefBody:
      "Relocating family · need childcare & primary schools walkable · 2 car spaces · 60–90 day settlement · must-have: north-facing living · avoid main roads & apartment blocks.",
    matchCount: 12,
    unreadReplies: 4,
    matches: [
      {
        id: "bm-12-denham",
        listingTitle: "12 Denham St, Hawthorn",
        address: "12 Denham St, Hawthorn",
        matchPercent: 92,
        priceRange: "$2.1M – $2.3M",
        agentName: "Sarah Lin",
        agentFirm: "Jellis Craig",
        source: "OFF-MARKET",
      },
      {
        id: "bm-44-glenferrie",
        listingTitle: "44 Glenferrie Rd, Hawthorn",
        address: "44 Glenferrie Rd, Hawthorn",
        matchPercent: 88,
        priceRange: "$1.95M – $2.15M",
        agentName: "Tom Reid",
        agentFirm: "Marshall White",
        source: "PRE-MARKET",
      },
      {
        id: "bm-7-wattle",
        listingTitle: "7 Wattle Pde, Kew",
        address: "7 Wattle Pde, Kew",
        matchPercent: 84,
        priceRange: "$2.4M – $2.6M",
        agentName: "Priya Mehta",
        agentFirm: "Kay & Burton",
        source: "EXCLUSIVE",
      },
    ],
    replies: [
      {
        id: "rep-sarah-12-denham",
        agentName: "Sarah Lin",
        agentFirm: "Jellis Craig",
        hoursAgo: 3,
        snippet:
          "Yes — 12 Denham coming to off-market next week. Period Edwardian, north-facing rear, walking to Auburn South PS. Happy to show you privately.",
        matchId: "bm-12-denham",
      },
      {
        id: "rep-tom-44-glenferrie",
        agentName: "Tom Reid",
        agentFirm: "Marshall White",
        hoursAgo: 22,
        snippet:
          "I have two pre-market matches for your brief. Sending the floor plans through.",
        matchId: "bm-44-glenferrie",
      },
      {
        id: "rep-priya-wattle",
        agentName: "Priya Mehta",
        agentFirm: "Kay & Burton",
        hoursAgo: 30,
        snippet:
          "Off-market on Wattle Pde. Vendor is testing the water — call me.",
        matchId: "bm-7-wattle",
      },
      {
        id: "rep-priya-followup",
        agentName: "Priya Mehta",
        agentFirm: "Kay & Burton",
        hoursAgo: 50,
        snippet:
          "One more option in Kew East — slightly above your range but worth a look.",
      },
    ],
  },
  {
    id: "brf-bayside-coastal",
    title: "Bayside coastal",
    ownerSide: "BUYER",
    postedDays: 11,
    status: "ACTIVE",
    suburbs: "Brighton, Brighton East, Hampton",
    budget: "$5.0M+",
    propertyType: "Townhouse or terrace · 3+ beds",
    minBeds: "3+",
    briefBody:
      "Pied-à-terre for downsizing couple · sea-facing principal preferred · 200m max to beach · 12-month settlement window · low-maintenance garden.",
    matchCount: 4,
    unreadReplies: 1,
    matches: [
      {
        id: "bm-14-park",
        listingTitle: "14 Park St, Brighton",
        address: "14 Park St, Brighton",
        matchPercent: 86,
        priceRange: "$5.4M – $5.8M",
        agentName: "James Crowley",
        agentFirm: "Buxton",
        source: "OFF-MARKET",
      },
    ],
    replies: [
      {
        id: "rep-crowley",
        agentName: "James Crowley",
        agentFirm: "Buxton",
        hoursAgo: 9,
        snippet:
          "Park St coming exclusively to PreMarket subscribers next Tuesday. Pre-inspections from Sunday.",
        matchId: "bm-14-park",
      },
    ],
  },
];

export const incomingBriefs: Brief[] = [
  {
    id: "ibf-relocating-family-boroondara",
    title: "Relocating family · Boroondara",
    ownerSide: "BUYER",
    postedDays: 2,
    status: "ACTIVE",
    suburbs: "Hawthorn, Kew, Camberwell",
    budget: "$1.8M – $2.4M",
    propertyType: "Period home · 3–4 beds",
    minBeds: "3+",
    briefBody:
      "Returning expats · school catchment important · north-facing living · 60–90 day settlement.",
    matchCount: 6,
    unreadReplies: 0,
    matches: [],
    replies: [],
  },
  {
    id: "ibf-bayside-downsize",
    title: "Bayside downsize",
    ownerSide: "BUYER",
    postedDays: 5,
    status: "ACTIVE",
    suburbs: "Brighton, Brighton East",
    budget: "$5M+",
    propertyType: "Townhouse, 3 bed",
    minBeds: "3",
    briefBody:
      "Sea-facing preferred · low-maintenance · 12-month settlement.",
    matchCount: 3,
    unreadReplies: 0,
    matches: [],
    replies: [],
  },
  {
    id: "ibf-boroondara-investor",
    title: "Boroondara investor",
    ownerSide: "BUYER",
    postedDays: 7,
    status: "ACTIVE",
    suburbs: "Hawthorn, Hawthorn East",
    budget: "$1.5M – $1.9M",
    propertyType: "Townhouse or unit · 2–3 beds",
    minBeds: "2",
    briefBody:
      "Rental yield priority · close to public transport · turnkey condition.",
    matchCount: 4,
    unreadReplies: 0,
    matches: [],
    replies: [],
  },
];

export function getBriefById(id: string): Brief | null {
  return (
    myPostedBriefs.find((b) => b.id === id) ??
    incomingBriefs.find((b) => b.id === id) ??
    null
  );
}

/* ============================================
   MESSAGES
   ============================================ */

export type MessageCategory = "BUYER" | "LISTING" | "BRIEF" | "VENDOR" | "PLATFORM";

export type ThreadParticipant = {
  name: string;
  initials: string;
  firm?: string;
  isOnline?: boolean;
};

export type MessageAttachment = {
  id: string;
  filename: string;
  kind: "PDF" | "IMAGE" | "PLAN" | "CONTRACT";
  caption?: string;
};

export type Message = {
  id: string;
  direction: "IN" | "OUT";
  body: string;
  time: string;
  attachments?: MessageAttachment[];
  dateGroup?: string;
};

export type MessageThread = {
  id: string;
  participant: ThreadParticipant;
  context: string;
  category: MessageCategory;
  unread: boolean;
  preview: string;
  lastTime: string;
  messages: Message[];
  pinned?: boolean;
};

export const threads: MessageThread[] = [
  {
    id: "thr-sarah-jenkins",
    participant: {
      name: "Sarah Jenkins",
      initials: "SJ",
      firm: "Buyer",
      isOnline: true,
    },
    context: "1240 Park Ave",
    category: "BUYER",
    unread: true,
    preview: "Floorplan v2 received — loading into data room now.",
    lastTime: "2M",
    messages: [
      {
        id: "m-1",
        direction: "IN",
        body: "Floorplan v2 received — loading into data room now.",
        time: "10:42 AM",
        dateGroup: "TODAY",
      },
      {
        id: "m-2",
        direction: "OUT",
        body: "Legend — thanks, pinging vendor for sign-off.",
        time: "10:45 AM",
      },
      {
        id: "m-3",
        direction: "IN",
        body: "",
        time: "10:46 AM",
        attachments: [
          {
            id: "att-floorplan",
            filename: "FLOOR_PLAN_V2.PDF",
            kind: "PLAN",
            caption: "Hawthorn City Center — North wing, level 1",
          },
        ],
      },
      {
        id: "m-4",
        direction: "OUT",
        body: "Will share with the vendor this afternoon and revert by 5pm.",
        time: "10:48 AM",
      },
    ],
  },
  {
    id: "thr-anton-zhouk",
    participant: {
      name: "Anton Zhouk",
      initials: "AZ",
      firm: "RT Edgar",
      isOnline: true,
    },
    context: "12 Park St, Brighton",
    category: "LISTING",
    unread: true,
    preview: "SOI + floorplan sent — review by 5pm?",
    lastTime: "2M",
    messages: [
      {
        id: "az-1",
        direction: "IN",
        body: "SOI + floorplan sent — review by 5pm?",
        time: "9:24 AM",
        dateGroup: "TODAY",
      },
      {
        id: "az-2",
        direction: "OUT",
        body: "Reviewing now. Will counter-sign and send back this afternoon.",
        time: "9:31 AM",
      },
    ],
  },
  {
    id: "thr-sarah-lin",
    participant: {
      name: "Sarah Lin",
      initials: "SL",
      firm: "Jellis Craig",
      isOnline: false,
    },
    context: "12 Denham St — re. Hawthorn / Kew brief",
    category: "BRIEF",
    unread: true,
    preview:
      "Yes — 12 Denham coming to off-market next week. Period Edwardian, north-facing rear…",
    lastTime: "3H",
    messages: [
      {
        id: "sl-1",
        direction: "IN",
        body:
          "Yes — 12 Denham coming to off-market next week. Period Edwardian, north-facing rear, walking to Auburn South PS. Happy to show you privately.",
        time: "11:42 AM",
        dateGroup: "TODAY",
      },
      {
        id: "sl-2",
        direction: "IN",
        body: "Indicative range $2.1–2.3M.",
        time: "11:43 AM",
      },
    ],
  },
  {
    id: "thr-tom-reid",
    participant: {
      name: "Tom Reid",
      initials: "TR",
      firm: "Marshall White",
      isOnline: false,
    },
    context: "Hawthorn / Kew brief — pre-market matches",
    category: "BRIEF",
    unread: false,
    preview: "I have two pre-market matches for your brief…",
    lastTime: "1D",
    messages: [
      {
        id: "tr-1",
        direction: "IN",
        body: "I have two pre-market matches for your brief. Sending the floor plans through.",
        time: "Yesterday",
        dateGroup: "YESTERDAY",
      },
      {
        id: "tr-2",
        direction: "OUT",
        body: "Send them through — keen to see both.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "thr-john-doe",
    participant: {
      name: "John Doe",
      initials: "JD",
      firm: "Buyer",
      isOnline: false,
    },
    context: "Re. Hawthorn City Center inspection",
    category: "BUYER",
    unread: false,
    preview: "Are you holding a private viewing on Thursday?",
    lastTime: "2D",
    messages: [
      {
        id: "jd-1",
        direction: "IN",
        body: "Are you holding a private viewing on Thursday?",
        time: "Wed 23 Apr",
        dateGroup: "WED 23 APR",
      },
      {
        id: "jd-2",
        direction: "OUT",
        body: "Yes — 4pm or 5pm both available. Which suits?",
        time: "Wed 23 Apr",
      },
    ],
  },
  {
    id: "thr-priya-mehta",
    participant: {
      name: "Priya Mehta",
      initials: "PM",
      firm: "Kay & Burton",
      isOnline: false,
    },
    context: "Wattle Pde, Kew — re. Hawthorn / Kew brief",
    category: "BRIEF",
    unread: false,
    preview: "Off-market on Wattle Pde. Vendor is testing the water — call me.",
    lastTime: "3D",
    messages: [
      {
        id: "pm-1",
        direction: "IN",
        body:
          "Off-market on Wattle Pde. Vendor is testing the water — call me.",
        time: "Tue 22 Apr",
        dateGroup: "TUE 22 APR",
      },
    ],
  },
  {
    id: "thr-james-crowley",
    participant: {
      name: "James Crowley",
      initials: "JC",
      firm: "Buxton",
      isOnline: false,
    },
    context: "Park St, Brighton — re. Bayside coastal brief",
    category: "BRIEF",
    unread: false,
    preview:
      "Park St coming exclusively to PreMarket subscribers next Tuesday.",
    lastTime: "5D",
    messages: [
      {
        id: "jc-1",
        direction: "IN",
        body:
          "Park St coming exclusively to PreMarket subscribers next Tuesday. Pre-inspections from Sunday.",
        time: "Sun 20 Apr",
        dateGroup: "SUN 20 APR",
      },
    ],
  },
  {
    id: "thr-anita-wong",
    participant: {
      name: "Anita Wong",
      initials: "AW",
      firm: "Buyer",
      isOnline: false,
    },
    context: "Re. Brighton Terrace · 14 Park St",
    category: "LISTING",
    unread: false,
    preview: "Following up on the Saturday inspection — could we book a private?",
    lastTime: "5D",
    messages: [
      {
        id: "aw-1",
        direction: "IN",
        body:
          "Following up on the Saturday inspection — could we book a private?",
        time: "Sun 20 Apr",
        dateGroup: "SUN 20 APR",
      },
    ],
  },
];

export function getThreadById(id: string): MessageThread | null {
  return threads.find((t) => t.id === id) ?? null;
}

export const messagesShortcuts = {
  newEnquiries: 3,
  pendingReviews: 2,
};

/* ============================================
   PROFILE
   ============================================ */

export type AgentReview = {
  id: string;
  reviewer: string;
  reviewerRole: string;
  rating: number;
  posted: string;
  body: string;
  listing?: string;
};

export type Dispute = {
  id: string;
  reference: string;
  counterparty: string;
  status: "OPEN" | "UNDER REVIEW" | "RESOLVED" | "ESCALATED";
  raised: string;
  summary: string;
};

export type Invoice = {
  id: string;
  reference: string;
  date: string;
  amount: string;
  description: string;
  status: "PAID" | "OUTSTANDING" | "DRAFT" | "VOID";
};

export type PayoutEvent = {
  id: string;
  date: string;
  amount: string;
  destination: string;
  status: "SETTLED" | "IN TRANSIT" | "SCHEDULED";
};

export const agentProfile = {
  name: "John Lim",
  title: "Director · Sales advisory",
  firm: "AZ Real Estate",
  email: "john.lim@azrealestate.com.au",
  phone: "+61 436 815 589",
  licence: "VIC 084 921",
  abn: "62 145 778 002",
  joinedYear: 2019,
  rating: 4.8,
  reviewsCount: 24,
  bio:
    "Twelve years steering off-market and pre-market campaigns across Bayside, Stonnington and the inner-east. Specialist in period homes, vendor advocacy and discreet vendor introductions.",
  suburbs: ["Brighton", "Hawthorn", "Kew", "Toorak", "Malvern"],
  verifiedAt: "Verified · 24 Apr 2026",
};

export const agentReviews: AgentReview[] = [
  {
    id: "rev-01",
    reviewer: "Sarah Jenkins",
    reviewerRole: "Buyer · 1240 Park Ave",
    rating: 5,
    posted: "2 weeks ago",
    body:
      "John ran a quiet, considered campaign — he protected the vendor's privacy from day one and brought us three pre-market matches before the listing went live.",
    listing: "1240 Park Ave, Brighton",
  },
  {
    id: "rev-02",
    reviewer: "Tom Reid",
    reviewerRole: "Agent · Marshall White",
    rating: 5,
    posted: "1 month ago",
    body:
      "Straight communicator, always reachable and quick on contracts. Best counterparty I've dealt with this quarter.",
    listing: "8 Wattle Pde, Kew",
  },
  {
    id: "rev-03",
    reviewer: "Anita Wong",
    reviewerRole: "Buyer · 14 Park St",
    rating: 4,
    posted: "2 months ago",
    body:
      "Knowledgeable about the suburb and patient with all of our questions. Negotiation was tough but always respectful.",
  },
  {
    id: "rev-04",
    reviewer: "Priya Mehta",
    reviewerRole: "Agent · Kay & Burton",
    rating: 5,
    posted: "3 months ago",
    body:
      "John consistently brings genuine buyers to the table. A pleasure to work alongside on any campaign.",
  },
];

export const disputes: Dispute[] = [
  {
    id: "dis-01",
    reference: "DR-1042",
    counterparty: "Anton Zhouk · RT Edgar",
    status: "UNDER REVIEW",
    raised: "Raised 5 days ago",
    summary:
      "Disagreement over the introduction date for 1240 Park Ave — co-agency fee allocation pending resolution.",
  },
  {
    id: "dis-02",
    reference: "DR-1018",
    counterparty: "Sarah Lin · Jellis Craig",
    status: "RESOLVED",
    raised: "Resolved 3 weeks ago",
    summary:
      "Vendor introduction overlap on 12 Denham St — resolved by mutual agreement, fees split 60/40.",
  },
];

export const invoices: Invoice[] = [
  {
    id: "inv-1",
    reference: "INV-20418",
    date: "12 Apr 2026",
    amount: "$2,450.00",
    description: "PreMarket campaign · 1240 Park Ave",
    status: "PAID",
  },
  {
    id: "inv-2",
    reference: "INV-20402",
    date: "01 Apr 2026",
    amount: "$1,200.00",
    description: "Subscription · Pro tier · April",
    status: "PAID",
  },
  {
    id: "inv-3",
    reference: "INV-20445",
    date: "22 Apr 2026",
    amount: "$890.00",
    description: "SOI generation · 8 Wattle Pde",
    status: "OUTSTANDING",
  },
];

export const payouts: PayoutEvent[] = [
  {
    id: "pay-1",
    date: "15 Apr 2026",
    amount: "$8,420.00",
    destination: "AZ Real Estate · NAB ••• 4218",
    status: "SETTLED",
  },
  {
    id: "pay-2",
    date: "29 Apr 2026",
    amount: "$3,210.00",
    destination: "AZ Real Estate · NAB ••• 4218",
    status: "SCHEDULED",
  },
];

export const accountHealth = {
  identityVerified: true,
  paymentsConnected: true,
  twoFactorEnabled: false,
  notificationsEnabled: true,
  reviewsResponded: 22,
  reviewsTotal: 24,
};

export const listingPerformance: ListingEnquiryRow[] = [
  {
    id: "perf-hawthorn",
    listingId: "lst-hawthorn-city-center",
    listingTitle: "Hawthorn City Center",
    enquiries7d: 6,
    views7d: 312,
    conversionPct: 1.9,
  },
  {
    id: "perf-brighton",
    listingId: "lst-brighton-terrace",
    listingTitle: "Brighton Terrace",
    enquiries7d: 3,
    views7d: 188,
    conversionPct: 1.6,
  },
];

/* ============================================
   PROFILE — extended fixtures
   ============================================ */

export type DisputeMessage = {
  id: string;
  author: "YOU" | "COUNTERPARTY" | "MEDIATOR";
  authorName: string;
  posted: string;
  body: string;
};

export type DisputeDetail = Dispute & {
  listing?: string;
  amountAtStake?: string;
  openedOn: string;
  timeline: DisputeMessage[];
};

export const disputeDetails: Record<string, DisputeDetail> = {
  "dis-01": {
    id: "dis-01",
    reference: "DR-1042",
    counterparty: "Anton Zhouk · RT Edgar",
    status: "UNDER REVIEW",
    raised: "Raised 5 days ago",
    summary:
      "Disagreement over the introduction date for 1240 Park Ave — co-agency fee allocation pending resolution.",
    listing: "1240 Park Ave, Brighton",
    amountAtStake: "$18,400.00",
    openedOn: "20 Apr 2026",
    timeline: [
      {
        id: "dm-01",
        author: "YOU",
        authorName: "John Lim",
        posted: "20 Apr 2026 · 9:14am",
        body:
          "Raising this formally. Buyer Sarah Jenkins was first introduced via my pre-market preview on 14 Mar — we have email and SMS records. Anton's listing went live on 18 Mar.",
      },
      {
        id: "dm-02",
        author: "COUNTERPARTY",
        authorName: "Anton Zhouk",
        posted: "21 Apr 2026 · 2:40pm",
        body:
          "Acknowledged. We have an inspection booking on 19 Mar in our CRM. Happy to share both records for mediation.",
      },
      {
        id: "dm-03",
        author: "MEDIATOR",
        authorName: "PreMarket Trust & Safety",
        posted: "23 Apr 2026 · 10:02am",
        body:
          "Both parties — please upload supporting evidence by Fri 25 Apr. We'll review and propose a fair allocation by Mon 28 Apr.",
      },
    ],
  },
  "dis-02": {
    id: "dis-02",
    reference: "DR-1018",
    counterparty: "Sarah Lin · Jellis Craig",
    status: "RESOLVED",
    raised: "Resolved 3 weeks ago",
    summary:
      "Vendor introduction overlap on 12 Denham St — resolved by mutual agreement, fees split 60/40.",
    listing: "12 Denham St, Hawthorn",
    amountAtStake: "$12,000.00",
    openedOn: "29 Mar 2026",
    timeline: [
      {
        id: "dm-04",
        author: "YOU",
        authorName: "John Lim",
        posted: "29 Mar 2026 · 11:00am",
        body:
          "Vendor introduction overlap — both parties spoke to the vendor in the same week.",
      },
      {
        id: "dm-05",
        author: "COUNTERPARTY",
        authorName: "Sarah Lin",
        posted: "30 Mar 2026 · 4:25pm",
        body:
          "Agreed. Happy to settle 60/40 in your favour given your earlier introduction.",
      },
      {
        id: "dm-06",
        author: "MEDIATOR",
        authorName: "PreMarket Trust & Safety",
        posted: "01 Apr 2026 · 9:30am",
        body:
          "Closed by mutual agreement. Fees allocated 60% John Lim, 40% Sarah Lin.",
      },
    ],
  },
};

export function getDisputeById(id: string): DisputeDetail | null {
  return disputeDetails[id] ?? null;
}

export type LegalDoc = {
  slug: string;
  title: string;
  kicker: string;
  updated: string;
  intro: string;
  sections: { title: string; body: string[] }[];
};

export const legalDocs: Record<string, LegalDoc> = {
  terms: {
    slug: "terms",
    title: "Terms of service",
    kicker: "III · Privacy & legal",
    updated: "Last updated 12 March 2026",
    intro:
      "These terms govern your use of PreMarket. They are written in plain language because we believe a good agreement should be a readable one.",
    sections: [
      {
        title: "Your account",
        body: [
          "You agree to keep your account details accurate and your password to yourself.",
          "You are responsible for activity on your account, including content you post and offers you make.",
          "Some features require a verified licence number. We may suspend access if a licence cannot be verified.",
        ],
      },
      {
        title: "Listings & briefs",
        body: [
          "Information you publish on listings and briefs must be true and not misleading.",
          "You may withdraw a listing at any time, however buyers who have already enquired will be notified out of courtesy.",
          "Statements of Information must comply with state-by-state requirements.",
        ],
      },
      {
        title: "Fees & payouts",
        body: [
          "Subscription fees are billed monthly in advance and are non-refundable mid-cycle.",
          "Co-agency and referral fees are settled on the schedule shown in your billing centre.",
          "Disputes over fees follow the process outlined in our Community guidelines.",
        ],
      },
      {
        title: "Termination",
        body: [
          "You may close your account at any time from the Account settings page.",
          "We may suspend or terminate accounts that breach these terms or the Community guidelines.",
          "Outstanding obligations — including settled fees and dispute resolutions — survive termination.",
        ],
      },
    ],
  },
  community: {
    slug: "community",
    title: "Community guidelines",
    kicker: "III · Privacy & legal",
    updated: "Last updated 02 February 2026",
    intro:
      "PreMarket is a small community of working agents and serious buyers. These guidelines describe the conduct we expect from each other.",
    sections: [
      {
        title: "Be candid, be respectful",
        body: [
          "Speak plainly. Disagree with the work, not the person.",
          "Avoid personal attacks, slurs, or harassment of any kind.",
          "If a conversation isn't productive, step away — you can always reply tomorrow.",
        ],
      },
      {
        title: "Be honest about properties",
        body: [
          "Don't oversell. Don't undersell. Describe properties accurately.",
          "If a price guide changes, update it. Buyers can sense theatre.",
          "Photographs should reflect the property as it is today.",
        ],
      },
      {
        title: "Honour your introductions",
        body: [
          "If you introduced a buyer, log it. If a colleague introduced a buyer, acknowledge it.",
          "When two agents both believe they introduced a buyer, raise a dispute and let the record decide.",
        ],
      },
      {
        title: "Reporting & enforcement",
        body: [
          "Report concerns through Trust & Safety. We read every report.",
          "We may issue warnings, suspend accounts, or remove content that breaches these guidelines.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy policy",
    kicker: "III · Privacy & legal",
    updated: "Last updated 28 January 2026",
    intro:
      "This policy explains what data we collect, why we collect it, and the choices you have. We try to keep this short.",
    sections: [
      {
        title: "What we collect",
        body: [
          "Account information you provide — name, email, phone, licence number, ABN.",
          "Content you create — listings, briefs, messages, and reviews.",
          "Usage information — pages viewed, features used, devices and approximate location.",
        ],
      },
      {
        title: "How we use it",
        body: [
          "To run the product — sign you in, render your listings, deliver your messages.",
          "To improve the product — understand which features matter and which don't.",
          "To keep the community safe — detect fraud, abuse, and breach of our guidelines.",
        ],
      },
      {
        title: "Sharing",
        body: [
          "We don't sell your personal data. Ever.",
          "We share with service providers (e.g. payment processors) under strict contracts.",
          "We may disclose data when legally required, and we will tell you where permitted to do so.",
        ],
      },
      {
        title: "Your choices",
        body: [
          "You can export your data, correct it, or delete your account from settings at any time.",
          "You can opt out of marketing emails — operational emails (billing, security) will still send.",
        ],
      },
    ],
  },
};

export function getLegalDoc(slug: string): LegalDoc | null {
  return legalDocs[slug] ?? null;
}
