import { NextResponse } from "next/server";

import {
  activeListings,
  offMarketMatches,
  savedSearches,
} from "../../../app/_data/fixtures";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PROPERTY_TYPES = ["House", "Townhouse", "Apartment", "Land", "Other"];
const SUBURBS = [
  "Brighton",
  "Hampton",
  "Hawthorn",
  "Kew",
  "Toorak",
  "South Yarra",
  "Camberwell",
  "Malvern",
];
const FEATURES = [
  "Period features",
  "Backyard",
  "Garage",
  "Pool",
  "Study",
  "City views",
  "Heritage",
];

export async function GET(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    propertyTypes: PROPERTY_TYPES,
    suburbs: SUBURBS,
    features: FEATURES,
    activeListings,
    offMarketMatches,
    savedSearches,
  });
}
