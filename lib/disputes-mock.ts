/**
 * Mock disputes for list + detail (Figma 1053:2793, 1053:2893).
 */

export type DisputeStatus = 'open' | 'under_review' | 'resolved';

export type DisputeListRow = {
  id: string;
  status: DisputeStatus;
  title: string;
  timeLabel: string;
};

export type DisputeEvidenceFile = {
  name: string;
  kind: 'pdf' | 'image';
};

export type DisputeActivityItem = {
  title: string;
  sub: string;
};

export type DisputeDetail = DisputeListRow & {
  statusHeadline: string;
  openedAssignedLine: string;
  deal: string;
  category: string;
  otherParty: string;
  amountLine: string;
  summary: string;
  detailsBody: string;
  evidence: DisputeEvidenceFile[];
  activity: DisputeActivityItem[];
  /** Present on device-raised disputes — used for sorting / relative labels */
  openedAtIso?: string;
};

const DR1042: DisputeDetail = {
  id: 'DR-1042',
  status: 'under_review',
  title: 'Commission conflict · Orrong Rd',
  timeLabel: 'Opened 3d ago',
  statusHeadline: 'OMM support is reviewing. Expect an update by Wed 22 Apr.',
  openedAssignedLine: 'Opened 3d ago · Assigned to Priya M.',
  deal: 'OMM-20418 · 142 Orrong Rd, Hawthorn East VIC 3123',
  category: 'Commission',
  otherParty: 'Sarah Chen · Marshall White Boroondara',
  amountLine: '$420.00 (20% of quoted commission)',
  summary: '20% lower than agreed during countersign',
  detailsBody:
    'Initial authority (01 Apr) locked commission at 2.2%. During countersign on 14 Apr, the figure reflected 1.76%. Screenshots and signed authority attached.',
  evidence: [
    { name: 'authority.pdf', kind: 'pdf' },
    { name: 'screen_1.png', kind: 'image' },
    { name: 'screen_2.png', kind: 'image' },
  ],
  activity: [
    { title: 'Opened by John Lim', sub: '14 Apr, 10:32' },
    { title: 'Assigned to Priya M. (OMM support)', sub: '14 Apr, 11:05' },
    { title: 'Sarah Chen viewed the dispute', sub: '15 Apr, 09:42' },
    { title: 'Sarah Chen added a response', sub: '16 Apr, 14:11' },
    { title: 'You added signed_authority.pdf', sub: '16 Apr, 16:40' },
  ],
};

const DR1033: DisputeDetail = {
  id: 'DR-1033',
  status: 'open',
  title: 'Authority expiry mismatch · 12 Park Ave',
  timeLabel: 'Opened 1w ago',
  statusHeadline: 'Awaiting documents from the selling agent. You will be notified when there is an update.',
  openedAssignedLine: 'Opened 1w ago · Not yet assigned',
  deal: 'OMM-20102 · 12 Park Ave, Stonnington',
  category: 'Authority / timing',
  otherParty: 'Marcus Lee · Buxton Malvern',
  amountLine: '—',
  summary: 'Marketing authority end date differs from what was agreed in writing.',
  detailsBody:
    'Buyer was told authority ran to 30 Jun; CRM shows 15 Jun. Supporting email thread from 08 Apr attached for review.',
  evidence: [
    { name: 'authority_scan.pdf', kind: 'pdf' },
    { name: 'email_thread.png', kind: 'image' },
  ],
  activity: [
    { title: 'Opened by you', sub: '28 Mar, 09:15' },
    { title: 'Marcus Lee viewed the dispute', sub: '29 Mar, 11:20' },
  ],
};

const DR998: DisputeDetail = {
  id: 'DR-998',
  status: 'resolved',
  title: 'Listing content dispute · 8 Oak Close',
  timeLabel: 'Resolved 2mo ago',
  statusHeadline:
    'Outcome: wording updated on the live listing and an addendum was agreed between parties. No further action required.',
  openedAssignedLine: 'Resolved 2mo ago · Case closed by OMM support',
  deal: 'OMM-19877 · 8 Oak Close, Bayside',
  category: 'Listing content',
  otherParty: 'Priya N. · McGrath Brighton',
  amountLine: '—',
  summary: 'Incorrect parking count and omitting owners corp in the heading.',
  detailsBody:
    'Buyer relied on portal copy; on inspection the car space count did not match. Listing corrected on 02 Jan after agent confirmation.',
  evidence: [{ name: 'listing_capture.png', kind: 'image' }],
  activity: [
    { title: 'Opened by you', sub: '05 Dec, 08:40' },
    { title: 'Priya N. added a response', sub: '06 Dec, 16:02' },
    { title: 'Resolved by OMM support', sub: '10 Dec, 14:00' },
  ],
};

/** Seed disputes shipped with the app (demo / onboarding). */
export const DISPUTE_SEED_DETAILS: Record<string, DisputeDetail> = {
  'DR-1042': DR1042,
  'DR-1033': DR1033,
  'DR-998': DR998,
};

/** Stable seed ordering for the disputes hub list. */
export const DISPUTE_SEED_ORDER: string[] = ['DR-1042', 'DR-1033', 'DR-998'];

export const DISPUTES_LIST: DisputeListRow[] = DISPUTE_SEED_ORDER.map((id) => {
  const d = DISPUTE_SEED_DETAILS[id];
  return { id: d.id, status: d.status, title: d.title, timeLabel: d.timeLabel };
});

/** Resolve seed-only detail (no device snapshots). Screens should prefer agent disputes merge when wired. */
export function getSeedDisputeDetail(id: string | undefined): DisputeDetail | null {
  if (!id) return null;
  return DISPUTE_SEED_DETAILS[id] ?? null;
}

export function getDisputeDetail(id: string | undefined): DisputeDetail | null {
  return getSeedDisputeDetail(id);
}
