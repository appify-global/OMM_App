import type { StoredThread } from '@/lib/omm-messages';

export type HomeEnquiryRow = {
  id: string;
  name: string;
  address: string;
  listingTitle: string;
  hoursAgo: number;
};

export function formatEnquiryTimeLabel(hoursAgo: number): string {
  if (hoursAgo < 1) return 'Just now';
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  const days = Math.floor(hoursAgo / 24);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export function enquiryTagFromTitle(listingTitle: string): string {
  const t = listingTitle.trim();
  if (!t) return 'BUYER ENQUIRY';
  return `RE: ${t.toUpperCase()}`;
}

function hoursAgoFromIso(iso: string): number {
  const at = new Date(iso);
  if (Number.isNaN(+at)) return 0;
  return Math.max(0, Math.floor((Date.now() - +at) / 3_600_000));
}

export function parseHomeEnquiry(v: unknown): HomeEnquiryRow | null {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return null;
  const row = v as Record<string, unknown>;
  const id = typeof row.id === 'string' ? row.id : '';
  const name = typeof row.name === 'string' ? row.name : '';
  if (!id || !name) return null;
  const hoursAgo =
    typeof row.hoursAgo === 'number' && Number.isFinite(row.hoursAgo)
      ? Math.max(0, Math.floor(row.hoursAgo))
      : 0;
  return {
    id,
    name,
    address: typeof row.address === 'string' ? row.address : '—',
    listingTitle: typeof row.listingTitle === 'string' ? row.listingTitle : '—',
    hoursAgo,
  };
}

/** Map message inbox threads to home “Latest enquiries” cards (agent selling tab). */
export function homeEnquiriesFromThreads(threads: StoredThread[]): HomeEnquiryRow[] {
  return threads
    .slice()
    .sort(
      (a, b) =>
        new Date(b.lastMessageAtIso).getTime() - new Date(a.lastMessageAtIso).getTime(),
    )
    .slice(0, 8)
    .map((t) => ({
      id: t.id,
      name: t.participantName,
      address: t.preview.trim() || t.contextLine,
      listingTitle: t.contextLine,
      hoursAgo: hoursAgoFromIso(t.lastMessageAtIso),
    }));
}

export function unreadEnquiryCountFromThreads(threads: StoredThread[]): number {
  return threads.filter((t) => t.unread).length;
}

export function buyerEnquiriesHeadline(
  unreadCount: number,
  totalCount: number,
): string {
  if (unreadCount === 1) {
    return 'You have 1 new buyer enquiry!';
  }
  if (unreadCount > 1) {
    return `You have ${unreadCount} new buyer enquiries!`;
  }
  if (totalCount === 0) {
    return 'No buyer enquiries yet';
  }
  return 'You’re up to date with all of your buyer enquiries!';
}

export function buyerEnquiriesSubcopy(
  unreadCount: number,
  totalCount: number,
): string {
  if (totalCount === 0) {
    return 'When buyers contact you about a listing, they’ll appear here and in Messages.';
  }
  if (unreadCount > 0) {
    return 'Reply in Messages to keep every enquiry in one place.';
  }
  return 'Stay on top of every enquiry — see them in one place anytime.';
}
