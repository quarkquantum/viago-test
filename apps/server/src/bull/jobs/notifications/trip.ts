import { prisma } from '@repo/database';
import { EntityType, NotificationDomain, NotificationType } from '@repo/shared';
import { sendNotification } from '@/helpers/notifications';

export type NewTripNotificationPayload = {
  recipientId: string;
  actorId?: string;
  actorAgencyId?: string;
  tripId: string;
};

export async function handleNewTripNotification({
  recipientId,
  actorId,
  actorAgencyId,
  tripId,
}: NewTripNotificationPayload) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      name: true,
      departureTime: true,
    },
  });

  if (!trip) {
    throw new Error(`Trip with id ${tripId} not found`);
  }

  return sendNotification({
    recipientId,
    actorId,
    actorAgencyId,
    domain: NotificationDomain.TRIP,
    type: NotificationType.NEW_TRIP,
    entityType: EntityType.TRIP,
    entityId: tripId,
    payload: {
      type: NotificationType.NEW_TRIP,
      trip: {
        id: trip.id,
        name: trip.name,
        departureTime: trip.departureTime.toISOString(),
      },
    },
  });
}

export async function handleTripReminderNotification({
  recipientId,
  actorId,
  actorAgencyId,
  tripId,
}: NewTripNotificationPayload) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      name: true,
      departureTime: true,
    },
  });

  if (!trip) {
    throw new Error(`Trip with id ${tripId} not found`);
  }

  return sendNotification({
    recipientId,
    actorId,
    actorAgencyId,
    domain: NotificationDomain.TRIP,
    type: NotificationType.TRIP_REMINDER,
    entityType: EntityType.TRIP,
    entityId: tripId,
    payload: {
      type: NotificationType.TRIP_REMINDER,
      trip: {
        id: trip.id,
        name: trip.name,
        departureTime: trip.departureTime.toISOString(),
      },
    },
  });
}
