export const BookingStatus = {
  COMPLETED: 'COMPLETED',
  CONFIRMED: 'CONFIRMED',
  DELETED: 'DELETED',
  PENDING: 'PENDING',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
