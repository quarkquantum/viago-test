export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  TRIAL: 'TRIAL',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const InvoiceStatus = {
  CANCELLED: 'CANCELLED',
  OVERDUE: 'OVERDUE',
  PAID: 'PAID',
  PENDING: 'PENDING',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const TRIAL_DURATION_MONTHS = 6;
