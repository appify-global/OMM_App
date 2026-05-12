import { apiFetch } from '@/lib/api';

export type RecentSoldDemoItem = {
  id: string;
  headline: string;
  meta: string;
  priceDisplay: string;
};

/** Shown on agent home · replace via GET /agent/home-metrics when Legal approves copy + backend exists. */
export type AgentHomeMetrics = {
  pendingListingsCount: number;
  /** Human-readable indicative pipeline figure (GST position set in label). */
  pipelineEstimateDisplay: string;
  recentlySold: RecentSoldDemoItem[];
};

export const DEMO_AGENT_HOME_METRICS: AgentHomeMetrics = {
  pendingListingsCount: 6,
  pipelineEstimateDisplay: '$48.5k',
  recentlySold: [
    {
      id: '1',
      headline: '14 Bowen St',
      meta: 'Hawthorn East · Sold',
      priceDisplay: '$2.35M',
    },
    {
      id: '2',
      headline: 'Unit 2 / 112 Victoria Pde',
      meta: 'Collingwood · Sold',
      priceDisplay: '$965k',
    },
    {
      id: '3',
      headline: '45 Marine Parade',
      meta: 'Elwood · Sold',
      priceDisplay: '$3.05M',
    },
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coerceAgentHomeMetrics(raw: unknown): AgentHomeMetrics | null {
  if (!isRecord(raw)) return null;
  const pending =
    typeof raw.pendingListingsCount === 'number'
      ? raw.pendingListingsCount
      : typeof raw.pendingListingCount === 'number'
        ? raw.pendingListingCount
        : null;
  const pipelineRaw =
    typeof raw.pipelineCommissionEstimateDisplay === 'string'
      ? raw.pipelineCommissionEstimateDisplay
      : typeof raw.pipelineEstimateDisplay === 'string'
        ? raw.pipelineEstimateDisplay
        : typeof raw.estimatedPipelineFeesDisplay === 'string'
          ? raw.estimatedPipelineFeesDisplay
          : null;

  let recentlySold: RecentSoldDemoItem[] = [];
  if (Array.isArray(raw.recentlySold)) {
    recentlySold = raw.recentlySold
      .map((item, idx): RecentSoldDemoItem | null => {
        if (!isRecord(item)) return null;
        const id = typeof item.id === 'string' ? item.id : `sold-${idx}`;
        const headline =
          typeof item.headline === 'string'
            ? item.headline
            : typeof item.addressLine === 'string'
              ? item.addressLine
              : null;
        const meta =
          typeof item.meta === 'string'
            ? item.meta
            : typeof item.subtitle === 'string'
              ? item.subtitle
              : typeof item.suburb === 'string'
                ? item.suburb
                : '';
        const priceDisplay =
          typeof item.priceDisplay === 'string'
            ? item.priceDisplay
            : typeof item.soldPriceDisplay === 'string'
              ? item.soldPriceDisplay
              : null;
        if (!headline || !priceDisplay) return null;
        return { id, headline, meta, priceDisplay };
      })
      .filter((x): x is RecentSoldDemoItem => x !== null);
  }

  if (pending === null || pipelineRaw === null) return null;

  return {
    pendingListingsCount: pending,
    pipelineEstimateDisplay: pipelineRaw,
    recentlySold: recentlySold.length > 0 ? recentlySold : DEMO_AGENT_HOME_METRICS.recentlySold,
  };
}

/**
 * Loads home KPI / recently-sold preview.
 * Calls `GET /agent/home-metrics` when `EXPO_PUBLIC_API_URL` is set (falls back silently to demo on error).
 */
export async function loadAgentHomeMetrics(
  getToken?: () => Promise<string | null>,
): Promise<AgentHomeMetrics> {
  const base = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!base) {
    return DEMO_AGENT_HOME_METRICS;
  }

  try {
    const res = await apiFetch('/agent/home-metrics', getToken ?? (async () => null), { method: 'GET' });
    if (!res.ok) {
      return DEMO_AGENT_HOME_METRICS;
    }
    const json: unknown = await res.json().catch(() => null);
    return coerceAgentHomeMetrics(json) ?? DEMO_AGENT_HOME_METRICS;
  } catch {
    return DEMO_AGENT_HOME_METRICS;
  }
}
