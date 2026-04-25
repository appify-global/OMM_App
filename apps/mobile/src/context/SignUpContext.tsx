import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type RoleOption = 'LISTING_AGENT' | 'BUYERS_AGENT' | 'BUYER';

export type SignUpState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  agreedTerms: boolean;
  agreedReferral: boolean;
  role: RoleOption | '';
  state: string;
  municipality: string;
  agencyName: string;
  govIdType: string;
  dateOfBirth: string;
  driverLicenceNumber: string;
  expiryDate: string;
  idDocumentName: string;
  licenceDocumentName: string;
};

const initial: SignUpState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  agreedTerms: false,
  agreedReferral: false,
  role: 'LISTING_AGENT',
  state: 'VICTORIA',
  municipality: 'BOROONDARA',
  agencyName: 'A-Z Real Estate',
  govIdType: 'Driver licence',
  dateOfBirth: '',
  driverLicenceNumber: '',
  expiryDate: '',
  idDocumentName: '',
  licenceDocumentName: '',
};

type SignUpContextValue = {
  data: SignUpState;
  setField: <K extends keyof SignUpState>(key: K, value: SignUpState[K]) => void;
  reset: () => void;
};

const SignUpContext = createContext<SignUpContextValue | undefined>(undefined);

export function SignUpProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SignUpState>(initial);

  const setField = useCallback(<K extends keyof SignUpState>(key: K, value: SignUpState[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setData(initial), []);

  const value = useMemo(
    () => ({ data, setField, reset }),
    [data, setField, reset],
  );

  return <SignUpContext.Provider value={value}>{children}</SignUpContext.Provider>;
}

export function useSignUp() {
  const ctx = useContext(SignUpContext);
  if (!ctx) throw new Error('useSignUp must be used within SignUpProvider');
  return ctx;
}
