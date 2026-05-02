export const CashierStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type CashierStatus = (typeof CashierStatus)[keyof typeof CashierStatus];
