export const TripStatus = {
  PENDING: 'PENDING',
  // BOARDING: 'BOARDING',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DELETED: 'DELETED',
} as const;

export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus];
