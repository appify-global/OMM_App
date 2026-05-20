/**
 * Seller-set inspection availability during publish flow (step 3 — SOI).
 * Drives slot options on Schedule inspection (live listing + Activities reschedule).
 */

export type InspectionAvailabilityTags = {
  byAppointment: boolean;
  openHome: boolean;
  flexibleHours: boolean;
};

export const DEFAULT_INSPECTION_AVAILABILITY_TAGS: InspectionAvailabilityTags = {
  byAppointment: false,
  openHome: false,
  flexibleHours: false,
};

export type InspectionSlotId = 'a' | 'b' | 'c' | 'd' | 'e';

export type InspectionSlotOption = {
  id: InspectionSlotId;
  label: string;
  sub: boolean;
};

/** Demo / legacy schedule when no seller prefs on the listing. */
export const DEFAULT_INSPECTION_SCHEDULE_SLOTS: InspectionSlotOption[] = [
  { id: 'a', label: '09:00–09:45 • 2 groups ahead', sub: false },
  { id: 'b', label: '10:30–11:15 • Buyer tour', sub: true },
  { id: 'c', label: '13:00–13:45 • Afternoon window', sub: false },
];

type SlotTemplate = InspectionSlotOption & {
  forTags: (keyof InspectionAvailabilityTags)[];
};

const SLOT_CATALOG: SlotTemplate[] = [
  {
    id: 'a',
    label: '09:00–09:45 • By appointment',
    sub: false,
    forTags: ['byAppointment'],
  },
  {
    id: 'b',
    label: '10:30–11:15 • Open home / buyer tour',
    sub: true,
    forTags: ['openHome'],
  },
  {
    id: 'c',
    label: '13:00–13:45 • Afternoon window',
    sub: false,
    forTags: ['byAppointment', 'openHome'],
  },
  {
    id: 'd',
    label: '17:30–18:15 • Evening window',
    sub: false,
    forTags: ['flexibleHours'],
  },
  {
    id: 'e',
    label: '18:30–19:15 • By appointment (evening)',
    sub: false,
    forTags: ['flexibleHours', 'byAppointment'],
  },
];

export function inspectionAvailabilityIsComplete(
  tags: InspectionAvailabilityTags,
  notes: string,
): boolean {
  if (notes.trim().length > 0) return true;
  return tags.byAppointment || tags.openHome || tags.flexibleHours;
}

/** Single line stored on `PublishedAgentListing` for buyers. */
export function formatSellerInspectionAvailability(
  tags: InspectionAvailabilityTags,
  notes: string,
): string {
  const parts: string[] = [];
  if (tags.byAppointment) parts.push('By appointment');
  if (tags.openHome) parts.push('Open home / scheduled opens');
  if (tags.flexibleHours) parts.push('Flexible hours (including evenings)');
  const n = notes.trim();
  if (n) parts.push(n);
  return parts.join(' · ');
}

function tagsFromDisplayLine(display: string): InspectionAvailabilityTags {
  const s = display.toLowerCase();
  return {
    byAppointment: s.includes('by appointment') || s.includes('appointment'),
    openHome: s.includes('open home') || s.includes('scheduled open'),
    flexibleHours: s.includes('flexible') || s.includes('evening'),
  };
}

export type SellerInspectionSchedulePrefs = {
  tags: InspectionAvailabilityTags;
  notes: string;
};

/** Minimal listing fields for schedule alignment (avoids import cycle with agent-published-listings). */
export type ListingInspectionPrefsSource = {
  sellerInspectionAvailability?: string;
  sellerInspectionAvailabilityTags?: InspectionAvailabilityTags;
  sellerInspectionAvailabilityNotes?: string;
};

export function sellerSchedulePrefsFromListing(
  listing: ListingInspectionPrefsSource,
): SellerInspectionSchedulePrefs | null {
  const storedTags = listing.sellerInspectionAvailabilityTags;
  if (storedTags && typeof storedTags === 'object') {
    return {
      tags: {
        byAppointment: !!storedTags.byAppointment,
        openHome: !!storedTags.openHome,
        flexibleHours: !!storedTags.flexibleHours,
      },
      notes: listing.sellerInspectionAvailabilityNotes?.trim() ?? '',
    };
  }
  const display = listing.sellerInspectionAvailability?.trim();
  if (display) {
    return { tags: tagsFromDisplayLine(display), notes: '' };
  }
  return null;
}

/** Slots shown in Schedule inspection — filtered to match seller step-3 choices. */
export function inspectionSlotsForSeller(
  tags: InspectionAvailabilityTags,
  notes: string,
): InspectionSlotOption[] {
  const hasTag = tags.byAppointment || tags.openHome || tags.flexibleHours;
  if (!hasTag) {
    if (notes.trim().length > 0) {
      return DEFAULT_INSPECTION_SCHEDULE_SLOTS.map((s) => ({
        ...s,
        label: s.id === 'b' ? '10:30–11:15 • Matches seller notes' : s.label,
      }));
    }
    return [...DEFAULT_INSPECTION_SCHEDULE_SLOTS];
  }
  const seen = new Set<InspectionSlotId>();
  const out: InspectionSlotOption[] = [];
  for (const t of SLOT_CATALOG) {
    if (!t.forTags.some((key) => tags[key])) continue;
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    out.push({ id: t.id, label: t.label, sub: t.sub });
  }
  return out.length > 0 ? out : [...DEFAULT_INSPECTION_SCHEDULE_SLOTS];
}

export function defaultInspectionSlotId(
  slots: InspectionSlotOption[],
  tags: InspectionAvailabilityTags,
): InspectionSlotId {
  if (tags.openHome) {
    const b = slots.find((s) => s.id === 'b');
    if (b) return 'b';
  }
  if (tags.flexibleHours) {
    const d = slots.find((s) => s.id === 'd');
    if (d) return 'd';
  }
  if (tags.byAppointment) {
    const a = slots.find((s) => s.id === 'a');
    if (a) return 'a';
  }
  return slots[0]?.id ?? 'b';
}

export function inspectionScheduleSellerLine(
  tags: InspectionAvailabilityTags,
  notes: string,
): string | null {
  const line = formatSellerInspectionAvailability(tags, notes).trim();
  return line.length > 0 ? `Seller availability · ${line}` : null;
}

export function inspectionScheduleFootnote(
  tags: InspectionAvailabilityTags,
  notes: string,
): string {
  const extra = notes.trim();
  if (tags.byAppointment && !tags.openHome && !tags.flexibleHours) {
    return extra.length > 0
      ? `By appointment only — ${extra} · Confirm with the agent before you arrive.`
      : 'By appointment only — confirm your visit with the listing agent before you arrive.';
  }
  if (tags.openHome && !tags.byAppointment && !tags.flexibleHours) {
    return extra.length > 0
      ? `Open home — ${extra} · Arrive at the start of your slot; photo ID may be required.`
      : 'Open home — arrive at the start of your slot; photo ID may be required at the door.';
  }
  if (tags.flexibleHours && !tags.byAppointment && !tags.openHome) {
    return extra.length > 0
      ? `Flexible hours — ${extra} · Evening slots match what the seller listed.`
      : 'Flexible hours — evening slots match what the seller listed; arrive on time for check-in.';
  }
  if (extra.length > 0) {
    return `${extra} · Arrive 10:20 for check-in · Photo ID required at door`;
  }
  return 'Arrive 10:20 for check-in · Photo ID required at door';
}

export function normalizeInspectionSlotId(
  slots: InspectionSlotOption[],
  slotId: InspectionSlotId | string | undefined,
): InspectionSlotId {
  if (slotId && slots.some((s) => s.id === slotId)) {
    return slotId as InspectionSlotId;
  }
  return slots[0]?.id ?? 'b';
}
