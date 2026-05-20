import { headers } from "next/headers";
import { fetchSuburbs } from "./api";

export type VisitorGeo = {
  /** Heading: "Properties near Hawthorn" */
  suburbLabel: string;
  /** Filter key for mock listings */
  suburbFilter: string;
  city: string | null;
  region: string | null;
  country: string | null;
};

const DEFAULT_SUBURB = "Hawthorn";

/** Metro / city names → nearest suburb we have stock for */
const METRO_TO_SUBURB: Record<string, string> = {
  melbourne: "Hawthorn",
  richmond: "Hawthorn",
  collingwood: "Hawthorn",
  fitzroy: "Hawthorn",
  carlton: "Hawthorn",
  brunswick: "Hawthorn",
  footscray: "Hawthorn",
  docklands: "Hawthorn",
  "south melbourne": "South Yarra",
  "st kilda": "St Kilda",
  "st kilda east": "St Kilda",
  caulfield: "Malvern",
  "caulfield north": "Malvern",
  "glen iris": "Malvern",
  prahran: "South Yarra",
  windsor: "South Yarra",
  paddington: "Brighton",
  bondi: "Brighton",
  "surry hills": "Hawthorn",
  sydney: "Hawthorn",
  brisbane: "Hawthorn",
  perth: "Hawthorn",
  adelaide: "Hawthorn",
  hobart: "Hawthorn",
  canberra: "Hawthorn",
};

type IpGeoPayload = {
  city?: string;
  region?: string;
  country?: string;
};

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function isPrivateIp(ip: string | null): boolean {
  if (!ip) return true;
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  return false;
}

async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") ?? h.get("cf-connecting-ip") ?? null;
}

async function fetchIpGeo(ip: string | null): Promise<IpGeoPayload | null> {
  const token = process.env.IPINFO_TOKEN;
  const devOverride = process.env.GEO_DEV_CITY?.trim();

  if (isPrivateIp(ip)) {
    if (devOverride) {
      return { city: devOverride, region: "Victoria", country: "AU" };
    }
    return null;
  }

  const endpoint = ip
    ? `https://ipinfo.io/${encodeURIComponent(ip)}/json`
    : "https://ipinfo.io/json";
  const url = token ? `${endpoint}?token=${token}` : endpoint;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      city?: string;
      region?: string;
      country?: string;
    };
    return {
      city: data.city?.trim() || undefined,
      region: data.region?.trim() || undefined,
      country: data.country?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

async function knownSuburbNames(): Promise<string[]> {
  const suburbs = await fetchSuburbs();
  return suburbs.map((s) => s.name);
}

export async function resolveVisitorGeo(
  geo: IpGeoPayload | null,
): Promise<VisitorGeo> {
  const names = await knownSuburbNames();
  const cityRaw = geo?.city ?? null;
  const cityKey = cityRaw ? normalizeKey(cityRaw) : "";
  const cityLabel = cityRaw ? titleCase(cityRaw) : null;

  const directMatch = names.find((n) => normalizeKey(n) === cityKey);
  if (directMatch) {
    return {
      suburbLabel: directMatch,
      suburbFilter: directMatch,
      city: cityRaw,
      region: geo?.region ?? null,
      country: geo?.country ?? null,
    };
  }

  const metroSuburb = cityKey ? METRO_TO_SUBURB[cityKey] : undefined;
  if (metroSuburb) {
    return {
      suburbLabel: cityLabel ?? metroSuburb,
      suburbFilter: metroSuburb,
      city: cityRaw,
      region: geo?.region ?? null,
      country: geo?.country ?? null,
    };
  }

  if (cityLabel) {
    return {
      suburbLabel: cityLabel,
      suburbFilter: DEFAULT_SUBURB,
      city: cityRaw,
      region: geo?.region ?? null,
      country: geo?.country ?? null,
    };
  }

  return {
    suburbLabel: DEFAULT_SUBURB,
    suburbFilter: DEFAULT_SUBURB,
    city: null,
    region: geo?.region ?? null,
    country: geo?.country ?? null,
  };
}

export async function getVisitorGeo(): Promise<VisitorGeo> {
  const ip = await getClientIp();
  const geo = await fetchIpGeo(ip);
  return resolveVisitorGeo(geo);
}
