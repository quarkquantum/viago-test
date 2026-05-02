export const TransactionStatus = {
  CANCELED: 'CANCELED',
  COMPLETE: 'COMPLETE',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
} as const;

export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];
