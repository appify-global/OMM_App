import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DisputeDetail, DisputeListRow } from '@/lib/disputes-mock';
import { DISPUTE_SEED_DETAILS, DISPUTE_SEED_ORDER } from '@/lib/disputes-mock';

const STORAGE_KEY = 'omm_agent_disputes_snapshots_v1';

type SnapshotsFile = {
  /** Full detail overrides / user-raised disputes keyed by id */
  snapshots: Record<string, DisputeDetail>;
};

function emptyFile(): SnapshotsFile {
  return { snapshots: {} };
}

async function readFile(): Promise<SnapshotsFile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyFile();
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || !('snapshots' in parsed)) return emptyFile();
    const snaps = (parsed as SnapshotsFile).snapshots;
    if (!snaps || typeof snaps !== 'object') return emptyFile();
    return { snapshots: snaps as Record<string, DisputeDetail> };
  } catch {
    return emptyFile();
  }
}

async function writeFile(data: SnapshotsFile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* offline / quota */
  }
}

export function formatDisputeActivityTimestamp(d: Date): string {
  return d.toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function openedListLabel(openedAtIso: string): string {
  const opened = new Date(openedAtIso);
  if (Number.isNaN(opened.getTime())) return 'Opened recently';
  const diffMs = Date.now() - opened.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return 'Opened today';
  if (days === 1) return 'Opened 1 day ago';
  if (days < 14) return `Opened ${days} days ago`;
  if (days < 60) return `Opened ${Math.floor(days / 7)} weeks ago`;
  return `Opened ${Math.floor(days / 30)} months ago`;
}

export type RaiseDisputeInput = {
  propertyAddress: string;
  category: string;
  otherParty: string;
  summary: string;
  details: string;
};

function newDisputeId(): string {
  return `DR-U-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function buildUserDisputeDetail(input: RaiseDisputeInput): DisputeDetail {
  const id = newDisputeId();
  const now = new Date();
  const iso = now.toISOString();
  const addr = input.propertyAddress.trim();
  const cat = input.category.trim();
  const titleBase = addr.length > 48 ? `${addr.slice(0, 45)}…` : addr;
  return {
    id,
    status: 'open',
    title: `${cat} · ${titleBase}`,
    timeLabel: openedListLabel(iso),
    statusHeadline:
      'Awaiting triage. OMM Trust & Safety typically responds within two business days. Try to keep correspondence factual.',
    openedAssignedLine: `${openedListLabel(iso)} · Not yet assigned`,
    deal: addr,
    category: cat,
    otherParty: input.otherParty.trim(),
    amountLine: '—',
    summary: input.summary.trim(),
    detailsBody: input.details.trim(),
    evidence: [],
    activity: [{ title: 'Opened by you', sub: formatDisputeActivityTimestamp(now) }],
    openedAtIso: iso,
  };
}

/** Effective detail: snapshot wins over seed. */
export function mergeDisputeDetail(
  id: string,
  snapshots: Record<string, DisputeDetail>,
): DisputeDetail | null {
  const snap = snapshots[id];
  if (snap) return snap;
  return DISPUTE_SEED_DETAILS[id] ?? null;
}

export function buildDisputeListRows(snapshots: Record<string, DisputeDetail>): DisputeListRow[] {
  const seen = new Set<string>();
  const rows: DisputeListRow[] = [];

  const userIds = Object.keys(snapshots).filter((id) => !DISPUTE_SEED_DETAILS[id]);
  userIds.sort((a, b) => {
    const ta = snapshots[a]?.openedAtIso ?? '';
    const tb = snapshots[b]?.openedAtIso ?? '';
    return tb.localeCompare(ta);
  });

  for (const id of userIds) {
    const d = snapshots[id];
    if (!d) continue;
    seen.add(id);
    rows.push({
      id: d.id,
      status: d.status,
      title: d.title,
      timeLabel: d.openedAtIso ? openedListLabel(d.openedAtIso) : d.timeLabel,
    });
  }

  for (const id of DISPUTE_SEED_ORDER) {
    const d = mergeDisputeDetail(id, snapshots);
    if (!d || seen.has(id)) continue;
    rows.push({
      id: d.id,
      status: d.status,
      title: d.title,
      timeLabel: d.timeLabel,
    });
  }

  return rows;
}

export async function loadDisputeSnapshots(): Promise<Record<string, DisputeDetail>> {
  const f = await readFile();
  return f.snapshots ?? {};
}

export async function saveDisputeSnapshots(snapshots: Record<string, DisputeDetail>): Promise<void> {
  await writeFile({ snapshots });
}

export async function raiseAgentDispute(input: RaiseDisputeInput): Promise<string> {
  const detail = buildUserDisputeDetail(input);
  const file = await readFile();
  const next = { ...file.snapshots, [detail.id]: detail };
  await writeFile({ snapshots: next });
  return detail.id;
}

function cloneForMutation(
  id: string,
  snapshots: Record<string, DisputeDetail>,
): DisputeDetail | null {
  const merged = mergeDisputeDetail(id, snapshots);
  if (!merged) return null;
  return {
    ...merged,
    evidence: merged.evidence.map((e) => ({ ...e })),
    activity: merged.activity.map((a) => ({ ...a })),
  };
}

export async function appendAgentDisputeResponse(id: string, message: string): Promise<boolean> {
  const trimmed = message.trim();
  if (!trimmed) return false;

  const file = await readFile();
  const base = cloneForMutation(id, file.snapshots);
  if (!base || base.status === 'resolved') return false;

  const now = new Date();
  const stamp = formatDisputeActivityTimestamp(now);
  base.detailsBody = `${base.detailsBody.trim()}\n\n— Your response (${stamp})\n${trimmed}`;
  base.activity.push({
    title: 'You added a response',
    sub: stamp,
  });

  const nextSnaps = { ...file.snapshots, [id]: base };
  await writeFile({ snapshots: nextSnaps });
  return true;
}

export async function withdrawAgentDispute(id: string): Promise<boolean> {
  const file = await readFile();
  const base = cloneForMutation(id, file.snapshots);
  if (!base || base.status === 'resolved') return false;

  base.status = 'resolved';
  base.statusHeadline =
    'You withdrew this dispute. You can raise a new dispute later if the matter is still unresolved.';
  base.timeLabel = 'Withdrawn';
  const prefix = base.openedAssignedLine.split('·')[0]?.trim() ?? base.timeLabel;
  base.openedAssignedLine = `${prefix} · Withdrawn by you`;

  const nextSnaps = { ...file.snapshots, [id]: base };
  await writeFile({ snapshots: nextSnaps });
  return true;
}
