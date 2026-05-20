/** Feature flags via env (`"0"` / `"false"` / `"off"` / `"no"` disables). Omit env → defaults to visible. */

function envAllows(key: keyof typeof RAW_ENV_KEYS): boolean {
  const k = RAW_ENV_KEYS[key];
  const v = process.env[k];
  if (v == null || v === '') return true;
  const lower = v.toLowerCase();
  return !(
    lower === '0' ||
    lower === 'false' ||
    lower === 'off' ||
    lower === 'no'
  );
}

const RAW_ENV_KEYS = {
  inspections: 'EXPO_PUBLIC_AGENT_QUICK_LINK_INSPECTIONS',
  drafts: 'EXPO_PUBLIC_AGENT_QUICK_LINK_DRAFTS',
} as const;

export const AGENT_QUICK_LINK_FLAGS = {
  inspections: envAllows('inspections'),
  drafts: envAllows('drafts'),
} as const;

export type AgentQuickLinkId = 'inspections' | 'drafts';

export type AgentQuickLinkItem = {
  id: AgentQuickLinkId;
  label: string;
  /** Resolved Expo Router href. */
  href: string;
  /**
   * `true`: destination is intentionally minimal / placeholder behaviour.
   * Links use real tabs or stack routes (`stub: false`).
   */
  stub: boolean;
  /** FontAwesome 4 icon glyph name subset used by `@expo/vector-icons/FontAwesome`. */
  iconGlyph: 'calendar-o' | 'file-o';
};

const DEFINITIONS: readonly AgentQuickLinkItem[] = [
  {
    id: 'inspections',
    label: 'Inspections',
    href: '/stats?filter=inspections',
    stub: false,
    iconGlyph: 'calendar-o',
  },
  {
    id: 'drafts',
    label: 'Drafts',
    href: '/list?segment=draft',
    stub: false,
    iconGlyph: 'file-o',
  },
] as const;

const FLAG_BY_ID: Record<AgentQuickLinkId, boolean> = {
  inspections: AGENT_QUICK_LINK_FLAGS.inspections,
  drafts: AGENT_QUICK_LINK_FLAGS.drafts,
};

/** Items to render on Home (Selling), in stable order - empty if every flag is off. */
export function getAgentQuickLinksForHome(): AgentQuickLinkItem[] {
  return DEFINITIONS.filter((d) => FLAG_BY_ID[d.id]);
}
