import { NotificationType } from '@repo/shared/constants';
import { z } from 'zod';

export const NewTripPayload = z.object({
  type: z.literal(NotificationType.NEW_TRIP),
  trip: z.object({
    id: z.string(),
    name: z.string(),
    departureTime: z.string(),
  }),
});
export type NewTripPayloadType = z.infer<typeof NewTripPayload>;

export const NewTicketPayload = z.object({
  type: z.literal(NotificationType.NEW_TICKET),
  ticket: z.object({
    id: z.string(),
    key: z.string(),
  }),
  trip: z.object({
    id: z.string(),
    name: z.string(),
  }),
});
export type NewTicketPayloadType = z.infer<typeof NewTicketPayload>;

export const NewBookingPayload = z.object({
  type: z.literal(NotificationType.NEW_BOOKING),
  booking: z.object({
    id: z.string(),
    total: z.number(),
  }),
  trip: z.object({
    id: z.string(),
    name: z.string(),
  }),
});
export type NewBookingPayloadType = z.infer<typeof NewBookingPayload>;

export const NewAgencyPayload = z.object({
  type: z.literal(NotificationType.NEW_AGENCY),
  agency: z.object({
    id: z.string(),
    name: z.string(),
  }),
});
export type NewAgencyPayloadType = z.infer<typeof NewAgencyPayload>;

export const NewDriverPayload = z.object({
  type: z.literal(NotificationType.NEW_DRIVER),
  driver: z.object({
    id: z.string(),
    name: z.string(),
  }),
});
export type NewDriverPayloadType = z.infer<typeof NewDriverPayload>;

export const TripReminderPayload = z.object({
  type: z.literal(NotificationType.TRIP_REMINDER),
  trip: z.object({
    id: z.string(),
    name: z.string(),
    departureTime: z.string(),
  }),
});
export type TripReminderPayloadType = z.infer<typeof TripReminderPayload>;

export const TripCompletedRatePayload = z.object({
  type: z.literal(NotificationType.TRIP_COMPLETED_RATE),
  trip: z.object({
    id: z.string(),
    name: z.string(),
  }),
  driver: z.object({
    id: z.string(),
    name: z.string(),
  }),
});
export type TripCompletedRatePayloadType = z.infer<typeof TripCompletedRatePayload>;

export const NotificationPayload = z.discriminatedUnion('type', [
  NewTripPayload,
  NewTicketPayload,
  NewBookingPayload,
  NewAgencyPayload,
  NewDriverPayload,
  TripReminderPayload,
  TripCompletedRatePayload,
]);

export type NotificationPayload = z.infer<typeof NotificationPayload>;
