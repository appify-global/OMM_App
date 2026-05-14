import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { DEMO_AGENT_AGENCY, DEMO_PRIMARY_LISTING_TITLE } from '@/lib/melbourne-demo-locations';

const STORAGE_KEY = 'omm_deal_ack_v1';

/** Internal OMM property / transaction reference (not a street address). */
export type PropertyRef = string;

export type PartyAckStatus = 'pending' | 'acknowledged';

export type DealLifecycleStatus =
  | 'awaiting_acknowledgement'
  | 'mutually_acknowledged'
  | 'review_hold';

export type DealAcknowledgementRecord = {
  propertyRef: PropertyRef;
  listingTitle: string;
  suburb: string;
  propertyType: string;
  counterpartyName: string;
  counterpartyAgency: string;
  lifecycle: DealLifecycleStatus;
  viewerAck: PartyAckStatus;
  counterpartyAck: PartyAckStatus;
  fraudHold: boolean;
};

export const DEMO_CHAT_PROPERTY_REF: PropertyRef = 'OMM-20418';

const DEFAULT_DEALS: Record<PropertyRef, DealAcknowledgementRecord> = {
  [DEMO_CHAT_PROPERTY_REF]: {
    propertyRef: DEMO_CHAT_PROPERTY_REF,
    listingTitle: DEMO_PRIMARY_LISTING_TITLE,
    suburb: 'Brighton East',
    propertyType: 'House',
    counterpartyName: 'Anton Zhouk',
    counterpartyAgency: DEMO_AGENT_AGENCY,
    lifecycle: 'awaiting_acknowledgement',
    viewerAck: 'pending',
    counterpartyAck: 'acknowledged',
    fraudHold: false,
  },
};

function webGet(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function webSet(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* private mode */
  }
}

async function readStore(): Promise<Record<PropertyRef, DealAcknowledgementRecord>> {
  let raw: string | null;
  if (Platform.OS === 'web') {
    raw = webGet(STORAGE_KEY);
  } else {
    try {
      raw = await SecureStore.getItemAsync(STORAGE_KEY);
    } catch {
      raw = null;
    }
  }
  if (!raw) return { ...DEFAULT_DEALS };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { ...DEFAULT_DEALS };
    }
    const merged = { ...DEFAULT_DEALS };
    for (const [key, value] of Object.entries(parsed)) {
      const row = parseDealRow(value);
      if (row) merged[key] = row;
    }
    return merged;
  } catch {
    return { ...DEFAULT_DEALS };
  }
}

async function writeStore(deals: Record<PropertyRef, DealAcknowledgementRecord>): Promise<void> {
  const payload = JSON.stringify(deals);
  if (Platform.OS === 'web') {
    webSet(STORAGE_KEY, payload);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, payload);
}

function parsePartyAck(raw: unknown): PartyAckStatus | null {
  return raw === 'pending' || raw === 'acknowledged' ? raw : null;
}

function parseLifecycle(raw: unknown): DealLifecycleStatus | null {
  if (raw === 'awaiting_acknowledgement' || raw === 'mutually_acknowledged' || raw === 'review_hold') {
    return raw;
  }
  return null;
}

function parseDealRow(raw: unknown): DealAcknowledgementRecord | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const propertyRef = typeof o.propertyRef === 'string' ? o.propertyRef : '';
  if (!propertyRef) return null;
  const viewerAck = parsePartyAck(o.viewerAck);
  const counterpartyAck = parsePartyAck(o.counterpartyAck);
  const lifecycle = parseLifecycle(o.lifecycle);
  if (!viewerAck || !counterpartyAck || !lifecycle) return null;
  return {
    propertyRef,
    listingTitle: typeof o.listingTitle === 'string' ? o.listingTitle : '',
    suburb: typeof o.suburb === 'string' ? o.suburb : '',
    propertyType: typeof o.propertyType === 'string' ? o.propertyType : '',
    counterpartyName: typeof o.counterpartyName === 'string' ? o.counterpartyName : '',
    counterpartyAgency: typeof o.counterpartyAgency === 'string' ? o.counterpartyAgency : '',
    lifecycle,
    viewerAck,
    counterpartyAck,
    fraudHold: o.fraudHold === true,
  };
}

function withLifecycle(row: DealAcknowledgementRecord): DealAcknowledgementRecord {
  if (row.fraudHold) {
    return { ...row, lifecycle: 'review_hold' };
  }
  if (row.viewerAck === 'acknowledged' && row.counterpartyAck === 'acknowledged') {
    return { ...row, lifecycle: 'mutually_acknowledged' };
  }
  return { ...row, lifecycle: 'awaiting_acknowledgement' };
}

export async function listDealAcknowledgements(): Promise<DealAcknowledgementRecord[]> {
  const deals = await readStore();
  return Object.values(deals).map(withLifecycle);
}

export async function getDealAcknowledgement(
  propertyRef: PropertyRef,
): Promise<DealAcknowledgementRecord | null> {
  const deals = await readStore();
  const row = deals[propertyRef];
  return row ? withLifecycle(row) : null;
}

export function canViewerAcknowledgeDeal(deal: DealAcknowledgementRecord): boolean {
  return (
    !deal.fraudHold &&
    deal.viewerAck === 'pending' &&
    deal.lifecycle !== 'review_hold'
  );
}

export function canWriteReviewForDeal(deal: DealAcknowledgementRecord): boolean {
  return !deal.fraudHold && deal.lifecycle === 'mutually_acknowledged';
}

export async function listDealsEligibleToWriteReview(): Promise<DealAcknowledgementRecord[]> {
  const deals = await listDealAcknowledgements();
  return deals.filter(canWriteReviewForDeal);
}

export async function countDealsAwaitingViewerAcknowledgement(): Promise<number> {
  const deals = await listDealAcknowledgements();
  return deals.filter(canViewerAcknowledgeDeal).length;
}

export function dealAcknowledgementStatusLabel(deal: DealAcknowledgementRecord): string {
  if (deal.fraudHold) return 'Under review';
  if (deal.lifecycle === 'mutually_acknowledged') return 'Both parties acknowledged';
  if (deal.viewerAck === 'acknowledged') return 'Waiting on other party';
  if (deal.counterpartyAck === 'acknowledged') return 'Your acknowledgement needed';
  return 'Acknowledgement pending';
}

export async function acknowledgeDealForViewer(propertyRef: PropertyRef): Promise<DealAcknowledgementRecord> {
  const deals = await readStore();
  const existing = deals[propertyRef] ?? DEFAULT_DEALS[propertyRef];
  if (!existing) {
    throw new Error('Unknown property reference');
  }
  if (!canViewerAcknowledgeDeal(withLifecycle(existing))) {
    return withLifecycle(existing);
  }
  const next = withLifecycle({ ...existing, viewerAck: 'acknowledged' });
  deals[propertyRef] = next;
  await writeStore(deals);
  return next;
}
