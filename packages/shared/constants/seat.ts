export const SeatType = {
  DRIVER: 'DRIVER',
  PASSENGER: 'PASSENGER',
} as const;

export type SeatType = (typeof SeatType)[keyof typeof SeatType];
