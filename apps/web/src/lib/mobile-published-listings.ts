import "server-only";

export type InspectionAvailabilityTags = {
  byAppointment: boolean;
  openHome: boolean;
  flexibleHours: boolean;
};

/** Serialized on `listings.features` so mobile + web share one DB row. */
export const OMM_META_PREFIX = "omm:meta:";

export type OmmListingMobileMeta = {
  addressDisclosure?: "disclose" | "not_disclose";
  propertyType?: string;
  sellerInspectionAvailability?: string;
  sellerInspectionAvailabilityTags?: InspectionAvailabilityTags;
  sellerInspectionAvailabilityNotes?: string;
  listingAnalytics?: {
    viewsByDay: Record<string, number>;
    savesByDay: Record<string, number>;
    enquiriesByDay: Record<string, number>;
  };
  localInspectionBookings?: {
    id: string;
    bookedAtIso: string;
    aprilDay2026: number;
    slotId: string;
    slotLabel: string;
  }[];
  listingStatus?: "live" | "pending" | "sold";
  soldMarkedAt?: string;
  archivedAt?: string;
};

export function encodeOmmListingMeta(meta: OmmListingMobileMeta): string {
  return `${OMM_META_PREFIX}${JSON.stringify(meta)}`;
}

export function parseOmmListingMeta(features: string[] | null | undefined): OmmListingMobileMeta {
  if (!features?.length) return {};
  const raw = features.find((f) => f.startsWith(OMM_META_PREFIX));
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw.slice(OMM_META_PREFIX.length)) as OmmListingMobileMeta;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function featuresWithOmmMeta(
  existing: string[] | null | undefined,
  meta: OmmListingMobileMeta,
): string[] {
  const base = (existing ?? []).filter((f) => !f.startsWith(OMM_META_PREFIX));
  return [...base, encodeOmmListingMeta(meta)];
}

export function mapDbStatusToMobile(
  status: string,
): "live" | "pending" | "sold" | undefined {
  if (status === "LIVE" || status === "UNDER_OFFER") return "live";
  if (status === "PRE_MARKET" || status === "DRAFT") return "pending";
  if (status === "SOLD" || status === "ARCHIVED" || status === "WITHDRAWN") return "sold";
  return undefined;
}
