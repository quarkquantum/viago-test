import type {
  NewAgencyPayloadType,
  NewBookingPayloadType,
  NewDriverPayloadType,
  NewTicketPayloadType,
  NewTripPayloadType,
  TripCompletedRatePayloadType,
  TripReminderPayloadType,
} from '@repo/validators';

export const NotificationStatus = {
  READ: 'READ',
  UNREAD: 'UNREAD',
  DELETED: 'DELETED',
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const NotificationDomain = {
  BOOKING: 'BOOKING',
  TICKET: 'TICKET',
  SYSTEM: 'SYSTEM',
  TRIP: 'TRIP',
  USER: 'USER',
} as const;
export type NotificationDomain = (typeof NotificationDomain)[keyof typeof NotificationDomain];

export const NotificationType = {
  NEW_TRIP: 'NEW_TRIP',
  NEW_TICKET: 'NEW_TICKET',
  NEW_BOOKING: 'NEW_BOOKING',
  NEW_AGENCY: 'NEW_AGENCY',
  NEW_DRIVER: 'NEW_DRIVER',
  NEW_CASHIER: 'NEW_CASHIER',
  TRIP_REMINDER: 'TRIP_REMINDER',
  TRIP_COMPLETED_RATE: 'TRIP_COMPLETED_RATE',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const EntityType = {
  TRIP: 'trip',
  BOOKING: 'booking',
  TICKET: 'ticket',
  AGENCY: 'agency',
  DRIVER: 'driver',
  CASHIER: 'cashier',
  USER: 'user',
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];

export type NotificationPayloadMap = {
  [NotificationType.NEW_TRIP]: NewTripPayloadType;
  [NotificationType.NEW_TICKET]: NewTicketPayloadType;
  [NotificationType.NEW_BOOKING]: NewBookingPayloadType;
  [NotificationType.NEW_AGENCY]: NewAgencyPayloadType;
  [NotificationType.NEW_DRIVER]: NewDriverPayloadType;
  [NotificationType.TRIP_REMINDER]: TripReminderPayloadType;
  [NotificationType.TRIP_COMPLETED_RATE]: TripCompletedRatePayloadType;
};
