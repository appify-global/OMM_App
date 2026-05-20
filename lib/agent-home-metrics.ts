import { apiFetch } from '@/lib/api';

/**
 * When false, the home KPI row hides the pipeline commission estimate (even if data exists).
 * Default: **shown** in dev/builds where the env var is unset. Set
 * `EXPO_PUBLIC_AGENT_HOME_PIPELINE_KPI_LEGALLY_APPROVED=false` to hide after Legal/product asks to turn it off.
 */
export const PIPELINE_KPI_LEGALLY_APPROVED =
  process.env.EXPO_PUBLIC_AGENT_HOME_PIPELINE_KPI_LEGALLY_APPROVED !== 'false';

/** Label for the pipeline commission KPI (legal-gated). */
export const LEGAL_COPY_PIPELINE_COMMISSION_LABEL = 'Est. pipeline commission';

/**
 * Footnote under the pipeline commission KPI (legal-gated).
 * Do not change without Legal sign-off.
 */
export const LEGAL_COPY_PIPELINE_COMMISSION_DISCLAIMER =
  'Illustrative gross commission on your active pipeline only. Not tax, GST, or financial advice. Not a guarantee of remuneration—final numbers follow your authority and settlement.';

export type RecentlySoldItem = {
  id: string;
  addressLine: string;
  suburb: string;
  soldPriceDisplay: string;
  soldAtDisplay: string;
  /** Index into `propertyImageAtIndex` on the client. */
  imageIndex: number;
  /** Device-local listing cover URI; overrides catalog thumbnail when present. */
  coverImageUri?: string;
};

export type AgentHomeMetricsPayload = {
  recentlySold: RecentlySoldItem[];
  /** Live / published listings attributed to the agent (MVP: integer from API). */
  activeListingsCount: number;
  pendingListingsCount: number;
  /** Settled / sold listings attributed to the agent (non-archived when from device store). */
  soldListingsCount: number;
  /** Scheduled inspections in the agreed window (e.g. next 7d) — MVP count only. */
  inspectionsBookedCount: number;
  /** When null, no range to show (even if legal flag is on). */
  pipelineCommissionEstimateAud: { lowAud: number; highAud: number } | null;
};

export const FALLBACK_AGENT_HOME_METRICS: AgentHomeMetricsPayload = {
  recentlySold: [
    {
      id: 'demo-1',
      addressLine: '12 Hartington St',
      suburb: 'Elsternwick',
      soldPriceDisplay: '$1.85M',
      soldAtDisplay: 'Sold 3d ago',
      imageIndex: 0,
    },
    {
      id: 'demo-2',
      addressLine: '9 Pasley St',
      suburb: 'St Kilda',
      soldPriceDisplay: '$1.42M',
      soldAtDisplay: 'Sold 1w ago',
      imageIndex: 1,
    },
    {
      id: 'demo-3',
      addressLine: '44 Orrong Rd',
      suburb: 'Armadale',
      soldPriceDisplay: '$2.10M',
      soldAtDisplay: 'Sold 2w ago',
      imageIndex: 2,
    },
  ],
  activeListingsCount: 4,
  pendingListingsCount: 2,
  soldListingsCount: 3,
  inspectionsBookedCount: 3,
  pipelineCommissionEstimateAud: { lowAud: 41250, highAud: 51500 },
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function parseRecentlySold(raw: unknown): RecentlySoldItem[] {
  if (!Array.isArray(raw)) return FALLBACK_AGENT_HOME_METRICS.recentlySold;
  const out: RecentlySoldItem[] = [];
  for (const row of raw) {
    if (!isRecord(row)) continue;
    const id = typeof row.id === 'string' ? row.id : '';
    const addressLine = typeof row.addressLine === 'string' ? row.addressLine : '';
    const suburb = typeof row.suburb === 'string' ? row.suburb : '';
    const soldPriceDisplay = typeof row.soldPriceDisplay === 'string' ? row.soldPriceDisplay : '';
    const soldAtDisplay = typeof row.soldAtDisplay === 'string' ? row.soldAtDisplay : '';
    const imageIndex = typeof row.imageIndex === 'number' && Number.isFinite(row.imageIndex) ? row.imageIndex : 0;
    const coverImageUri =
      typeof row.coverImageUri === 'string' && row.coverImageUri.trim().length > 0
        ? row.coverImageUri.trim()
        : undefined;
    if (!id || !addressLine) continue;
    out.push({
      id,
      addressLine,
      suburb,
      soldPriceDisplay,
      soldAtDisplay,
      imageIndex,
      ...(coverImageUri ? { coverImageUri } : {}),
    });
  }
  return out.length > 0 ? out : FALLBACK_AGENT_HOME_METRICS.recentlySold;
}

function parsePipeline(raw: unknown): { lowAud: number; highAud: number } | null {
  if (raw == null) return null;
  if (!isRecord(raw)) return null;
  const lowAud = typeof raw.lowAud === 'number' && Number.isFinite(raw.lowAud) ? raw.lowAud : null;
  const highAud = typeof raw.highAud === 'number' && Number.isFinite(raw.highAud) ? raw.highAud : null;
  if (lowAud == null || highAud == null) return null;
  return { lowAud: Math.max(0, lowAud), highAud: Math.max(0, highAud) };
}

function parseNonNegativeInt(raw: unknown, fallback: number): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return fallback;
  return Math.max(0, Math.floor(raw));
}

export function parseAgentHomeMetrics(data: unknown): AgentHomeMetricsPayload {
  if (!isRecord(data)) return FALLBACK_AGENT_HOME_METRICS;
  const pending = parseNonNegativeInt(
    data.pendingListingsCount,
    FALLBACK_AGENT_HOME_METRICS.pendingListingsCount,
  );
  const active = parseNonNegativeInt(
    data.activeListingsCount,
    FALLBACK_AGENT_HOME_METRICS.activeListingsCount,
  );
  const inspections = parseNonNegativeInt(
    data.inspectionsBookedCount,
    FALLBACK_AGENT_HOME_METRICS.inspectionsBookedCount,
  );
  const sold = parseNonNegativeInt(
    data.soldListingsCount,
    FALLBACK_AGENT_HOME_METRICS.soldListingsCount,
  );
  return {
    recentlySold: parseRecentlySold(data.recentlySold),
    activeListingsCount: active,
    pendingListingsCount: pending,
    soldListingsCount: sold,
    inspectionsBookedCount: inspections,
    pipelineCommissionEstimateAud: parsePipeline(data.pipelineCommissionEstimateAud),
  };
}

export function formatPipelineCommissionRangeDisplay(
  range: { lowAud: number; highAud: number },
): string {
  const f = (n: number) =>
    n.toLocaleString('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    });
  return `${f(range.lowAud)}–${f(range.highAud)}`;
}

export type FetchAgentHomeMetricsResult = {
  metrics: AgentHomeMetricsPayload;
  /** True when `EXPO_PUBLIC_API_URL` is set and home metrics API returned 200. */
  ok: boolean;
};

/**
 * Loads agent home metrics from the API when configured and a Clerk JWT is available;
 * otherwise returns the same-shaped fallback payload with `ok: false`.
 */
export async function fetchAgentHomeMetrics(
  getToken: () => Promise<string | null>,
): Promise<FetchAgentHomeMetricsResult> {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base) {
    return { metrics: FALLBACK_AGENT_HOME_METRICS, ok: false };
  }
  try {
    let res = await apiFetch('/api/mobile/agent-home-metrics', getToken, { method: 'GET' });
    if (!res.ok) {
      res = await apiFetch('/api/agent-home-metrics', getToken, { method: 'GET' });
    }
    if (!res.ok) {
      return { metrics: FALLBACK_AGENT_HOME_METRICS, ok: false };
    }
    const json: unknown = await res.json();
    return { metrics: parseAgentHomeMetrics(json), ok: true };
  } catch {
    return { metrics: FALLBACK_AGENT_HOME_METRICS, ok: false };
  }
}
