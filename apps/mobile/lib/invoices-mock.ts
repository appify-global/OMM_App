/**
 * Invoice list types and mock data.
 * Replace INVOICES with API results in production.
 */

export type InvoiceFilterKey = 'all' | 'paid' | 'outstanding' | 'refunded';

export type InvoiceStatus = 'sent' | 'outstanding' | 'refunded';

export type InvoiceRow = {
  id: string;
  amountFormatted: string;
  dealRef: string;
  addressLine: string;
  dateLine: string;
  status: InvoiceStatus;
  /** ISO 8601 (e.g. 2026-04-14) - used for the “This month” summary. If omitted, row counts toward this month. */
  issuedAtIso?: string;
};

/** Demo rows matching the invoices UI; replace with API (summary = sum of these rows this month). */
export const INVOICES: InvoiceRow[] = [
  {
    id: 'INV-20418',
    amountFormatted: '$4,230.00',
    dealRef: 'OMM-20418',
    addressLine: '142 Orrong Rd',
    dateLine: '14 Apr 2026',
    status: 'sent',
  },
  {
    id: 'INV-20418',
    amountFormatted: '$4,230.00',
    dealRef: 'OMM-20418',
    addressLine: '142 Orrong Rd',
    dateLine: '14 Apr 2026',
    status: 'outstanding',
  },
];

export function filterInvoices(list: InvoiceRow[], filter: InvoiceFilterKey): InvoiceRow[] {
  if (filter === 'all') return list;
  if (filter === 'paid') return list.filter((i) => i.status === 'sent');
  if (filter === 'outstanding') return list.filter((i) => i.status === 'outstanding');
  return list.filter((i) => i.status === 'refunded');
}

/** Rows to include in the summary card for the current calendar month. */
export function invoicesThisMonth(list: InvoiceRow[]): InvoiceRow[] {
  const now = new Date();
  return list.filter((r) => {
    if (!r.issuedAtIso) return true;
    const d = new Date(r.issuedAtIso);
    if (Number.isNaN(d.getTime())) return true;
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
}

export function thisMonthSummary(list: InvoiceRow[]): { totalFormatted: string; countLabel: string } {
  if (list.length === 0) {
    return { totalFormatted: '$0.00', countLabel: '0 invoices' };
  }
  let cents = 0;
  for (const row of list) {
    const n = Number.parseFloat(row.amountFormatted.replace(/[^0-9.-]/g, ''));
    if (!Number.isNaN(n)) cents += Math.round(n * 100);
  }
  const total = cents / 100;
  const totalFormatted = `$${total.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const countLabel = `${list.length} invoice${list.length === 1 ? '' : 's'}`;
  return { totalFormatted, countLabel };
}

/** Line item on invoice PDF-style breakdown. */
export type InvoiceLineItem = {
  description: string;
  amountFormatted: string;
};

/** Full detail for `/invoice-detail` - populated from API; index aligns with `INVOICES`. */
export type InvoiceDetailModel = {
  invoiceId: string;
  /** Chip label in header (e.g. PAID, OUTSTANDING). */
  statusChip: 'PAID' | 'SENT' | 'OUTSTANDING' | 'REFUNDED';
  issuedLabel: string;
  totalFormatted: string;
  gstSubtext: string;
  propertyLine: string;
  contactLine: string;
  /** Label above payment line (e.g. PAID VIA vs PAYMENT). */
  paymentFieldLabel: string;
  paidViaLine: string;
  lineItems: InvoiceLineItem[];
  footerTotalFormatted: string;
};

/** Parallel to `INVOICES` - same order as list rows. Replace with API fetch by id. */
export const INVOICE_DETAILS: InvoiceDetailModel[] = [
  {
    invoiceId: 'INV-20418',
    statusChip: 'PAID',
    issuedLabel: 'Issued 14 Apr 2026',
    totalFormatted: '$4,230.00',
    gstSubtext: 'inc. $384.55 GST',
    propertyLine: '142 Orrong Rd • Hawthorn East',
    contactLine: 'John Lim • Vendor',
    paymentFieldLabel: 'PAID VIA',
    paidViaLine: 'Visa •••• 1234 on 14 Apr',
    lineItems: [
      { description: 'Listing fee • OMM-20418', amountFormatted: '$2,000.00' },
      { description: 'Professional photography', amountFormatted: '$1,500.00' },
      { description: 'Featured listing boost (7d)', amountFormatted: '$345.45' },
      { description: 'GST (10%)', amountFormatted: '$384.55' },
    ],
    footerTotalFormatted: '$4,230.00',
  },
  {
    invoiceId: 'INV-20418',
    statusChip: 'OUTSTANDING',
    issuedLabel: 'Issued 14 Apr 2026',
    totalFormatted: '$4,230.00',
    gstSubtext: 'inc. $384.55 GST',
    propertyLine: '142 Orrong Rd • Hawthorn East',
    contactLine: 'John Lim • Vendor',
    paymentFieldLabel: 'PAYMENT',
    paidViaLine: 'Payment due - not charged',
    lineItems: [
      { description: 'Listing fee • OMM-20418', amountFormatted: '$2,000.00' },
      { description: 'Professional photography', amountFormatted: '$1,500.00' },
      { description: 'Featured listing boost (7d)', amountFormatted: '$345.45' },
      { description: 'GST (10%)', amountFormatted: '$384.55' },
    ],
    footerTotalFormatted: '$4,230.00',
  },
];

export function getInvoiceDetailAtIndex(index: number): InvoiceDetailModel | undefined {
  if (!Number.isFinite(index) || index < 0 || index >= INVOICE_DETAILS.length) return undefined;
  return INVOICE_DETAILS[index];
}
