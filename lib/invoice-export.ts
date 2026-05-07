/**
 * Plain-text invoice export for save / share / email until a real PDF pipeline exists.
 */

import * as FileSystem from 'expo-file-system/legacy';

import type { InvoiceDetailModel } from '@/lib/invoices-mock';

export function buildInvoiceDocumentBody(d: InvoiceDetailModel): string {
  const lines = [
    d.invoiceId,
    d.issuedLabel,
    '',
    `Total: ${d.totalFormatted}`,
    d.gstSubtext,
    '',
    'PROPERTY',
    d.propertyLine,
    'CONTACT',
    d.contactLine,
    d.paymentFieldLabel,
    d.paidViaLine,
    '',
    ...d.lineItems.map((l) => `${l.description}\t${l.amountFormatted}`),
    '',
    `TOTAL\t${d.footerTotalFormatted}`,
  ];
  return lines.join('\n');
}

export function invoiceExportFilename(invoiceId: string): string {
  const safe = invoiceId.replace(/[^\w-]/g, '');
  return `${safe || 'invoice'}-invoice.txt`;
}

/** Writes UTF-8 text to app documents (Files / On My iPhone). */
export async function saveInvoiceToDocumentDirectory(d: InvoiceDetailModel): Promise<{ uri: string }> {
  const dir = FileSystem.documentDirectory;
  if (dir == null) {
    throw new Error('documentDirectory unavailable');
  }
  const target = `${dir}${invoiceExportFilename(d.invoiceId)}`;
  await FileSystem.writeAsStringAsync(target, buildInvoiceDocumentBody(d), {
    encoding: 'utf8',
  });
  return { uri: target };
}
