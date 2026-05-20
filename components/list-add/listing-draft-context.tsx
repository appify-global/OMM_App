import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

import type { ListingDetailsSnapshot } from '@/lib/agent-published-listings';
import {
  DEFAULT_INSPECTION_AVAILABILITY_TAGS,
  type InspectionAvailabilityTags,
} from '@/lib/listing-inspection-availability';
import type {
  ListingDraftFloorPlan,
  ListingDraftPhoto,
  ListingDraftVideo,
} from '@/lib/listing-media-pickers';
import { ILLUSTRATIVE_COMMISSION_OF_SALE_PCT } from '@/lib/referral-pricing';

/** Whether the listing shows the full street address to buyers. */
export type AddressDisclosureChoice = 'disclose' | 'not_disclose';

export const ADDRESS_DISCLOSURE_LABELS: Record<AddressDisclosureChoice, string> = {
  disclose: 'Disclose',
  not_disclose: 'Not disclosed',
};

/** Last SOI path chosen before referral/review (upload attachment vs auto-generate flow). */
export type PublishFlowSoiChoice = 'auto' | 'upload' | null;

type Ctx = {
  addressDisclosure: AddressDisclosureChoice;
  setAddressDisclosure: (v: AddressDisclosureChoice) => void;
  /** Whole AUD dollars from step 1 price range; drives referral $ estimates. */
  listingPriceFromAud: number | null;
  listingPriceToAud: number | null;
  setListingPriceRange: (fromAud: number | null, toAud: number | null) => void;
  /** Saved when leaving Step 1; used on publish/review */
  listingDetails: ListingDetailsSnapshot | null;
  setListingDetails: (snapshot: ListingDetailsSnapshot | null) => void;

  draftPhotos: ListingDraftPhoto[];
  setDraftPhotos: Dispatch<SetStateAction<ListingDraftPhoto[]>>;
  draftVideos: ListingDraftVideo[];
  setDraftVideos: Dispatch<SetStateAction<ListingDraftVideo[]>>;
  draftFloorPlan: ListingDraftFloorPlan | null;
  setDraftFloorPlan: Dispatch<SetStateAction<ListingDraftFloorPlan | null>>;

  referralSharePct: number;
  setReferralSharePct: Dispatch<SetStateAction<number>>;
  referralAssumedCommissionPct: number;
  setReferralAssumedCommissionPct: Dispatch<SetStateAction<number>>;

  publishFlowSoiChoice: PublishFlowSoiChoice;
  setPublishFlowSoiChoice: Dispatch<SetStateAction<PublishFlowSoiChoice>>;

  inspectionAvailabilityTags: InspectionAvailabilityTags;
  setInspectionAvailabilityTags: Dispatch<SetStateAction<InspectionAvailabilityTags>>;
  inspectionAvailabilityNotes: string;
  setInspectionAvailabilityNotes: Dispatch<SetStateAction<string>>;

  /** ISO time when user last tapped Save draft on any publish step; drives review footer. */
  draftLastSavedAtIso: string | null;
  touchDraftSaved: () => void;
};

const ListingDraftContext = createContext<Ctx | null>(null);

export function ListingDraftProvider({ children }: { children: ReactNode }) {
  const [addressDisclosure, setAddressDisclosure] = useState<AddressDisclosureChoice>('disclose');
  const [listingPriceFromAud, setListingPriceFromAud] = useState<number | null>(null);
  const [listingPriceToAud, setListingPriceToAud] = useState<number | null>(null);
  const [listingDetails, setListingDetails] = useState<ListingDetailsSnapshot | null>(null);

  const [draftPhotos, setDraftPhotos] = useState<ListingDraftPhoto[]>([]);
  const [draftVideos, setDraftVideos] = useState<ListingDraftVideo[]>([]);
  const [draftFloorPlan, setDraftFloorPlan] = useState<ListingDraftFloorPlan | null>(null);

  const [referralSharePct, setReferralSharePct] = useState(25);
  const [referralAssumedCommissionPct, setReferralAssumedCommissionPct] = useState(
    ILLUSTRATIVE_COMMISSION_OF_SALE_PCT,
  );

  const [publishFlowSoiChoice, setPublishFlowSoiChoice] = useState<PublishFlowSoiChoice>(null);
  const [inspectionAvailabilityTags, setInspectionAvailabilityTags] =
    useState<InspectionAvailabilityTags>(() => ({ ...DEFAULT_INSPECTION_AVAILABILITY_TAGS }));
  const [inspectionAvailabilityNotes, setInspectionAvailabilityNotes] = useState('');
  const [draftLastSavedAtIso, setDraftLastSavedAtIso] = useState<string | null>(null);

  const setListingPriceRange = useCallback((fromAud: number | null, toAud: number | null) => {
    setListingPriceFromAud(fromAud);
    setListingPriceToAud(toAud);
  }, []);

  const touchDraftSaved = useCallback(() => {
    setDraftLastSavedAtIso(new Date().toISOString());
  }, []);

  const value = useMemo(
    () => ({
      addressDisclosure,
      setAddressDisclosure,
      listingPriceFromAud,
      listingPriceToAud,
      setListingPriceRange,
      listingDetails,
      setListingDetails,
      draftPhotos,
      setDraftPhotos,
      draftVideos,
      setDraftVideos,
      draftFloorPlan,
      setDraftFloorPlan,
      referralSharePct,
      setReferralSharePct,
      referralAssumedCommissionPct,
      setReferralAssumedCommissionPct,
      publishFlowSoiChoice,
      setPublishFlowSoiChoice,
      inspectionAvailabilityTags,
      setInspectionAvailabilityTags,
      inspectionAvailabilityNotes,
      setInspectionAvailabilityNotes,
      draftLastSavedAtIso,
      touchDraftSaved,
    }),
    [
      addressDisclosure,
      listingPriceFromAud,
      listingPriceToAud,
      setListingPriceRange,
      listingDetails,
      draftPhotos,
      draftVideos,
      draftFloorPlan,
      referralSharePct,
      referralAssumedCommissionPct,
      publishFlowSoiChoice,
      inspectionAvailabilityTags,
      inspectionAvailabilityNotes,
      draftLastSavedAtIso,
      touchDraftSaved,
    ],
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
