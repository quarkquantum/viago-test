export const TicketStatus = {
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  ISSUED: 'ISSUED',
  REFUNDED: 'REFUNDED',
  RESERVED: 'RESERVED',
  CONSUMED: 'CONSUMED',
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];
