export const StationStatus = {
  PENDING: 'PENDING',
  BOARDING: 'BOARDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
} as const;
export type StationStatus = (typeof StationStatus)[keyof typeof StationStatus];
