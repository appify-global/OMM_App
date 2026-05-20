import { NextResponse } from "next/server";

import {
  createListingForAgent,
  getPublishedListingsForMobileAgent,
  type MobileCreateListingInput,
} from "@/db/queries";
import { ensureClerkUserInDatabase } from "@/lib/ensure-clerk-user-db";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";
import type { OmmListingMobileMeta } from "@/lib/mobile-published-listings";
import { featuresWithOmmMeta } from "@/lib/mobile-published-listings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PublishBody = {
  details: {
    address: string;
    propertyType: string;
    bedrooms: string;
    bathrooms: string;
    carSpaces: string;
    landAreaSize: string;
  };
  listingPriceFromAud: number | null;
  listingPriceToAud: number | null;
  addressDisclosure: "disclose" | "not_disclose";
  sellerInspectionAvailability?: string;
  sellerInspectionAvailabilityTags?: OmmListingMobileMeta["sellerInspectionAvailabilityTags"];
  sellerInspectionAvailabilityNotes?: string;
  description?: string;
  media?: MobileCreateListingInput["media"];
  status?: "LIVE" | "DRAFT" | "PRE_MARKET";
};

function parsePublishBody(body: unknown): PublishBody | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const details = b.details;
  if (!details || typeof details !== "object") return null;
  const d = details as Record<string, unknown>;
  const address = typeof d.address === "string" ? d.address.trim() : "";
  if (!address) return null;

  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  const street = parts[0] ?? address;
  const suburb = parts.length >= 2 ? parts.slice(1).join(", ") : "Melbourne";

  const fromAud =
    typeof b.listingPriceFromAud === "number" && Number.isFinite(b.listingPriceFromAud)
      ? Math.round(b.listingPriceFromAud)
      : null;
  const toAud =
    typeof b.listingPriceToAud === "number" && Number.isFinite(b.listingPriceToAud)
      ? Math.round(b.listingPriceToAud)
      : null;

  const disc = b.addressDisclosure === "not_disclose" ? "not_disclose" : "disclose";

  const meta: OmmListingMobileMeta = {
    addressDisclosure: disc,
    propertyType: typeof d.propertyType === "string" ? d.propertyType : "House",
    sellerInspectionAvailability:
      typeof b.sellerInspectionAvailability === "string"
        ? b.sellerInspectionAvailability
        : undefined,
    sellerInspectionAvailabilityTags:
      b.sellerInspectionAvailabilityTags &&
      typeof b.sellerInspectionAvailabilityTags === "object"
        ? (b.sellerInspectionAvailabilityTags as OmmListingMobileMeta["sellerInspectionAvailabilityTags"])
        : undefined,
    sellerInspectionAvailabilityNotes:
      typeof b.sellerInspectionAvailabilityNotes === "string"
        ? b.sellerInspectionAvailabilityNotes
        : undefined,
    listingStatus: "live",
  };

  const priceDisplay =
    fromAud != null && toAud != null
      ? fromAud === toAud
        ? `$${fromAud.toLocaleString("en-AU")}`
        : `$${fromAud.toLocaleString("en-AU")} — $${toAud.toLocaleString("en-AU")}`
      : undefined;

  return {
    details: {
      address,
      propertyType: typeof d.propertyType === "string" ? d.propertyType : "House",
      bedrooms: typeof d.bedrooms === "string" ? d.bedrooms : "0",
      bathrooms: typeof d.bathrooms === "string" ? d.bathrooms : "0",
      carSpaces: typeof d.carSpaces === "string" ? d.carSpaces : "0",
      landAreaSize: typeof d.landAreaSize === "string" ? d.landAreaSize : "",
    },
    listingPriceFromAud: fromAud,
    listingPriceToAud: toAud,
    addressDisclosure: disc,
    sellerInspectionAvailability: meta.sellerInspectionAvailability,
    sellerInspectionAvailabilityTags: meta.sellerInspectionAvailabilityTags,
    sellerInspectionAvailabilityNotes: meta.sellerInspectionAvailabilityNotes,
    description: typeof b.description === "string" ? b.description : undefined,
    media: Array.isArray(b.media) ? (b.media as MobileCreateListingInput["media"]) : undefined,
    status: b.status === "DRAFT" || b.status === "PRE_MARKET" ? b.status : "LIVE",
  };
}

export async function GET(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const listings = await getPublishedListingsForMobileAgent(userId);
    return NextResponse.json({ listings });
  } catch (e) {
    console.error("[api/mobile/published-listings GET]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = parsePublishBody(body);
  if (!parsed) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const hydrated = await ensureClerkUserInDatabase(userId);
  if (!hydrated.ok) {
    return NextResponse.json({ error: "user_not_ready", reason: hydrated.reason }, { status: 424 });
  }

  const address = parsed.details.address.trim();
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  const street = parts[0] ?? address;
  const suburb = parts.length >= 2 ? parts.slice(1).join(", ") : "Melbourne";

  const landDigits = parsed.details.landAreaSize.replace(/\D/g, "");
  const landSqm = landDigits ? Number.parseInt(landDigits, 10) : undefined;

  const meta: OmmListingMobileMeta = {
    addressDisclosure: parsed.addressDisclosure,
    propertyType: parsed.details.propertyType,
    sellerInspectionAvailability: parsed.sellerInspectionAvailability,
    sellerInspectionAvailabilityTags: parsed.sellerInspectionAvailabilityTags,
    sellerInspectionAvailabilityNotes: parsed.sellerInspectionAvailabilityNotes,
    listingStatus: "live",
  };

  const priceDisplay =
    parsed.listingPriceFromAud != null && parsed.listingPriceToAud != null
      ? parsed.listingPriceFromAud === parsed.listingPriceToAud
        ? `$${parsed.listingPriceFromAud.toLocaleString("en-AU")}`
        : `$${parsed.listingPriceFromAud.toLocaleString("en-AU")} — $${parsed.listingPriceToAud.toLocaleString("en-AU")}`
      : undefined;

  try {
    const id = await createListingForAgent(userId, {
      title: `${street} · ${suburb}`,
      address: street,
      suburb,
      state: "VIC",
      bedrooms: Number.parseInt(/^\d+/.exec(parsed.details.bedrooms)?.[0] ?? "0", 10),
      bathrooms: Number.parseInt(/^\d+/.exec(parsed.details.bathrooms)?.[0] ?? "0", 10),
      carSpaces: Number.parseInt(/^\d+/.exec(parsed.details.carSpaces)?.[0] ?? "0", 10),
      landSizeSqm: Number.isFinite(landSqm) ? landSqm : undefined,
      priceFromAud: parsed.listingPriceFromAud ?? undefined,
      priceToAud: parsed.listingPriceToAud ?? undefined,
      priceDisplay: priceDisplay ?? undefined,
      description: parsed.description,
      status: parsed.status ?? "LIVE",
      media: parsed.media,
      features: featuresWithOmmMeta([], meta),
    });

    if (!id) {
      return NextResponse.json({ error: "create_failed" }, { status: 500 });
    }

    const listings = await getPublishedListingsForMobileAgent(userId);
    const row = listings.find((l) => l.id === id);
    return NextResponse.json({ ok: true, listingId: id, listing: row ?? null });
  } catch (e) {
    console.error("[api/mobile/published-listings POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
