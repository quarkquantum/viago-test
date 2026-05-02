export const BusSeatType = {
  PASSENGER: 'PASSENGER',
  RIDER: 'RIDER',
} as const;
export type BusSeatType = (typeof BusSeatType)[keyof typeof BusSeatType];

export const BusSeatStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
} as const;
export type BusSeatStatus = (typeof BusSeatStatus)[keyof typeof BusSeatStatus];

export const BusSeatPolicy = {
  UNNUMBERED: 'UNNUMBERED',
  NUMBERED: 'NUMBERED',
} as const;
export type BusSeatPolicy = (typeof BusSeatPolicy)[keyof typeof BusSeatPolicy];

export const BusStatus = {
  ACTIVE: 'ACTIVE',
  BREAKDOWN: 'BREAKDOWN',
  DELETED: 'DELETED',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
  TO_REPLACE: 'TO_REPLACE',
} as const;
export type BusStatus = (typeof BusStatus)[keyof typeof BusStatus];

export const BusSeatNumberOptions = [25, 30, 36, 45, 55, 60, 69] as const;
