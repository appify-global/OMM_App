import { apiFetch } from '@/lib/api';
import { isMobileApiConfigured } from '@/lib/mobile-api-config';

/**
 * Persist a buyer inspection slot on Railway Postgres (listing agent notified).
 */
export async function postInspectionBookingForListing(
  getToken: () => Promise<string | null>,
  listingId: string,
  slotLabel: string,
): Promise<boolean> {
  if (!isMobileApiConfigured() || !listingId.startsWith('lst-')) return false;
  const label = slotLabel.trim();
  if (!label) return false;
  try {
    const res = await apiFetch(
      `/api/mobile/listings/${encodeURIComponent(listingId)}/inspection-bookings`,
      getToken,
      { method: 'POST', body: JSON.stringify({ slotLabel: label }) },
    );
    return res.ok;
  } catch {
    return false;
  }
}
