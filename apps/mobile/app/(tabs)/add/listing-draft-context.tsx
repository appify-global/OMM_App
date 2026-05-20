import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/** Whether the listing shows the full street address to buyers. */
export type AddressDisclosureChoice = 'disclose' | 'not_disclose';

export const ADDRESS_DISCLOSURE_LABELS: Record<AddressDisclosureChoice, string> = {
  disclose: 'Disclose',
  not_disclose: 'Not disclosed',
};

type Ctx = {
  addressDisclosure: AddressDisclosureChoice;
  setAddressDisclosure: (v: AddressDisclosureChoice) => void;
  /** Whole AUD dollars from step 1 price range; drives referral $ estimates. */
  listingPriceFromAud: number | null;
  listingPriceToAud: number | null;
  setListingPriceRange: (fromAud: number | null, toAud: number | null) => void;
};

const ListingDraftContext = createContext<Ctx | null>(null);

export function ListingDraftProvider({ children }: { children: ReactNode }) {
  const [addressDisclosure, setAddressDisclosure] = useState<AddressDisclosureChoice>('disclose');
  const [listingPriceFromAud, setListingPriceFromAud] = useState<number | null>(null);
  const [listingPriceToAud, setListingPriceToAud] = useState<number | null>(null);

  const setListingPriceRange = useCallback((fromAud: number | null, toAud: number | null) => {
    setListingPriceFromAud(fromAud);
    setListingPriceToAud(toAud);
  }, []);

  const value = useMemo(
    () => ({
      addressDisclosure,
      setAddressDisclosure,
      listingPriceFromAud,
      listingPriceToAud,
      setListingPriceRange,
    }),
    [addressDisclosure, listingPriceFromAud, listingPriceToAud, setListingPriceRange],
  );

  return <ListingDraftContext.Provider value={value}>{children}</ListingDraftContext.Provider>;
}

export function useListingDraft() {
  const ctx = useContext(ListingDraftContext);
  if (!ctx) {
    throw new Error('useListingDraft must be used within ListingDraftProvider');
  }
  return ctx;
}
