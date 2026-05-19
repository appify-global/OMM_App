import { NextResponse } from "next/server";

import { loadListingsPageData } from "../../../app/_data/rsc-loaders";
import {
  createListingForAgent,
  type MobileCreateListingInput,
  type MobileListingMediaInput,
} from "@/db/queries";
import { ensureClerkUserInDatabase } from "@/lib/ensure-clerk-user-db";
import { getUserIdFromMobileRequest } from "@/lib/mobile-bearer-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CREATE_STATUSES = new Set(["DRAFT", "PRE_MARKET", "LIVE"]);

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function optionalStr(v: unknown, max: number): string | null | undefined {
  if (v == null || v === "") return undefined;
  if (typeof v !== "string") return undefined;
  return v.trim().slice(0, max) || undefined;
}

function parseNonNegativeInt(v: unknown): number | undefined {
  const n =
    typeof v === "number"
      ? v
      : typeof v === "string" && v.trim() !== ""
        ? Number(v)
        : NaN;
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n);
}

function parsePositiveAud(v: unknown): number | undefined {
  const n =
    typeof v === "number"
      ? v
      : typeof v === "string" && v.trim() !== ""
        ? Number(v)
        : NaN;
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.round(n);
}

function parseMedia(v: unknown): MobileListingMediaInput[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: MobileListingMediaInput[] = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const kind = o.kind;
    if (
      kind !== "PHOTO" &&
      kind !== "FLOOR_PLAN" &&
      kind !== "VIDEO" &&
      kind !== "SOI_PDF"
    ) {
      continue;
    }
    const url = str(o.url, 2048);
    if (!url) continue;
    out.push({
      kind,
      url,
      caption: optionalStr(o.caption, 500) ?? undefined,
      position: parseNonNegativeInt(o.position),
    });
  }
  return out.length ? out : undefined;
}

/** Parse POST JSON → create payload. */
function parseCreateBody(
  body: unknown,
): { ok: true; data: MobileCreateListingInput } | { ok: false; detail: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, detail: "invalid_body" };
  }
  const b = body as Record<string, unknown>;
  const address = str(b.address, 640);
  const suburb = str(b.suburb, 160);
  if (!address) return { ok: false, detail: "missing_address" };
  if (!suburb) return { ok: false, detail: "missing_suburb" };

  let status: MobileCreateListingInput["status"];
  const rawStatus = typeof b.status === "string" ? b.status.trim().toUpperCase() : "";
  if (!rawStatus) status = "DRAFT";
  else if (CREATE_STATUSES.has(rawStatus)) status = rawStatus as MobileCreateListingInput["status"];
  else return { ok: false, detail: "invalid_status" };

  const features = Array.isArray(b.features)
    ? (b.features as unknown[])
        .filter((x): x is string => typeof x === "string")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 120)
    : undefined;

  const inspectionTimes = Array.isArray(b.inspectionTimes)
    ? (b.inspectionTimes as unknown[])
        .filter((x): x is { at?: unknown; label?: unknown } =>
          Boolean(x && typeof x === "object"),
        )
        .map((x) => ({
          at: typeof x.at === "string" ? x.at.trim().slice(0, 240) : "",
          label:
            typeof x.label === "string" ? x.label.trim().slice(0, 240) : "",
        }))
        .filter((x) => x.at.length > 0 && x.label.length > 0)
        .slice(0, 50)
    : undefined;

  return {
    ok: true,
    data: {
      title: optionalStr(b.title, 500),
      address,
      suburb,
      state: optionalStr(b.state, 24) ?? "VIC",
      postcode: optionalStr(b.postcode, 16),
      bedrooms: parseNonNegativeInt(b.bedrooms),
      bathrooms: parseNonNegativeInt(b.bathrooms),
      carSpaces: parseNonNegativeInt(b.carSpaces),
      landSizeSqm: parseNonNegativeInt(b.landSizeSqm),
      buildingSizeSqm: parseNonNegativeInt(b.buildingSizeSqm),
      priceFromAud: parsePositiveAud(b.priceFromAud),
      priceToAud: parsePositiveAud(b.priceToAud),
      priceDisplay: optionalStr(b.priceDisplay, 240),
      description: optionalStr(b.description, 20000),
      features,
      inspectionTimes:
        inspectionTimes && inspectionTimes.length ? inspectionTimes : undefined,
      status,
      soiUrl: optionalStr(b.soiUrl, 2048),
      soiKind: optionalStr(b.soiKind, 64),
      media: parseMedia(b.media),
    },
  };
}

export async function GET(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await loadListingsPageData(userId);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[api/mobile/listings]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getUserIdFromMobileRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "database_not_configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = parseCreateBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.detail }, { status: 400 });
  }

  const hydrated = await ensureClerkUserInDatabase(userId);
  if (!hydrated.ok) {
    const status = hydrated.reason === "missing_clerk_secret" ? 503 : 424;
    return NextResponse.json(
      {
        ok: false,
        error: "user_not_ready",
        reason: hydrated.reason,
      },
      { status },
    );
  }

  try {
    const listingId = await createListingForAgent(userId, parsed.data);
    if (!listingId) {
      return NextResponse.json(
        { ok: false, error: "database_not_configured" },
        { status: 503 },
      );
    }
    return NextResponse.json({
      ok: true,
      listingId,
      status: parsed.data.status ?? "DRAFT",
    });
  } catch (e) {
    console.error("[api/mobile/listings POST]", e);
    return NextResponse.json({ ok: false, error: "create_failed" }, { status: 500 });
  }
}
