/**
 * Demo data for Payment method - replace with API / Stripe.
 */

export type PaymentCardDisplay = {
  id: string;
  last4: string;
  holder: string;
  expiry: string;
  isDefault: boolean;
  /** Card face background */
  color: string;
};

export type BillingAddressFields = {
  addressLine1: string;
  addressLine2: string;
  street: string;
  state: string;
  municipality: string;
  zipCode: string;
};

export const PAYMENT_CARDS: PaymentCardDisplay[] = [
  { id: 'c1', last4: '1840', holder: 'Aycan Doganlar', expiry: '09/26', isDefault: false, color: '#eb7777' },
  { id: 'c2', last4: '3282', holder: 'Aycan Doganlar', expiry: '12/23', isDefault: true, color: '#8688bc' },
  { id: 'c3', last4: '5512', holder: 'Aycan Doganlar', expiry: '03/27', isDefault: false, color: '#7aa0da' },
];

export const PAYMENT_BILLING_DEFAULT: BillingAddressFields = {
  addressLine1: '12/400 Bourke St',
  addressLine2: '',
  street: 'Bourke Street',
  state: 'VIC',
  municipality: 'Melbourne',
  zipCode: '3000',
};

export const PAYMENT_METHOD_OTHER = {
  billing: PAYMENT_BILLING_DEFAULT,
  /** Full email for invoice PDF delivery */
  invoiceEmail: 'john.lim@az-re.com.au',
  autoPay: 'On',
} as const;

/** Options shown in Auto-pay sheet (display strings). */
export const AUTO_PAY_OPTIONS = ['On', 'Off'] as const;
