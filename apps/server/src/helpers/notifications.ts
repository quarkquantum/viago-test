import { type Prisma, prisma } from '@repo/database';
import { logger } from '@repo/logger';
import {
  type EntityType,
  NotificationDomain,
  type NotificationPayloadMap,
  NotificationStatus,
  NotificationType,
} from '@repo/shared';
import { NotificationPayload as NotificationPayloadSchema } from '@repo/validators';
import { firebaseAdmin } from '@/lib/firebase';
import { hashData } from '@/utils/oslo';

// Map notification types to their corresponding payload types

function getNotificationContent<T extends keyof NotificationPayloadMap>(
  type: T,
  payload: NotificationPayloadMap[T]
): { title: string; body: string } {
  switch (type) {
    case NotificationType.NEW_TRIP: {
      const p = payload as NotificationPayloadMap[typeof NotificationType.NEW_TRIP];
      return {
        title: 'New Trip Available',
        body: `Trip to ${p.trip.name} is now available`,
      };
    }
    case NotificationType.NEW_TICKET: {
      const p = payload as NotificationPayloadMap[typeof NotificationType.NEW_TICKET];
      return {
        title: 'Ticket Purchased',
        body: `Ticket ${p.ticket.key} for ${p.trip.name} purchased`,
      };
    }
    case NotificationType.NEW_BOOKING: {
      const p = payload as NotificationPayloadMap[typeof NotificationType.NEW_BOOKING];
      return {
        title: 'New Booking',
        body: `New booking for ${p.trip.name} (Total: ${p.booking.total})`,
      };
    }
    case NotificationType.NEW_AGENCY: {
      const p = payload as NotificationPayloadMap[typeof NotificationType.NEW_AGENCY];
      return {
        title: 'New Agency Joined',
        body: `${p.agency.name} has joined Viago`,
      };
    }
    case NotificationType.NEW_DRIVER: {
      const p = payload as NotificationPayloadMap[typeof NotificationType.NEW_DRIVER];
      return {
        title: 'New Driver Added',
        body: `Driver ${p.driver.name} has been added`,
      };
    }
    case NotificationType.TRIP_REMINDER: {
      const p = payload as NotificationPayloadMap[typeof NotificationType.TRIP_REMINDER];
      return {
        title: 'Trip Reminder',
        body: `Your trip to ${p.trip.name} departs at ${p.trip.departureTime}`,
      };
    }
    case NotificationType.TRIP_COMPLETED_RATE: {
      const p = payload as NotificationPayloadMap[typeof NotificationType.TRIP_COMPLETED_RATE];
      return {
        title: 'Rate Your Trip',
        body: `How was your trip ${p.trip.name} with ${p.driver.name}? Tap to rate.`,
      };
    }
    default:
      return {
        title: 'Viago',
        body: 'You have a new notification',
      };
  }
}

// Base parameters that are common to all notification types
type BaseSendNotificationParams = {
  recipientId?: string;
  recipientAgencyId?: string;
  actorId?: string | null;
  actorAgencyId?: string | null;
  domain: NotificationDomain;
  entityType: EntityType;
  entityId: string;
  dedupeKey?: string;
  status?: NotificationStatus;
};

// Discriminated union type for sendNotification parameters
// T must be a key of NotificationPayloadMap to ensure type safety
type SendNotificationParams<T extends keyof NotificationPayloadMap> = BaseSendNotificationParams & {
  type: T;
  payload: NotificationPayloadMap[T];
};

/**
 * Common function to send notifications based on type
 * This centralizes notification creation logic and ensures consistency
 * Validates payload structure using discriminated union schema before storing
 *
 * Uses discriminated union types to provide intellisense based on notification type
 */
/**
 * Sends trip completed rate notifications to all passengers on a trip
 */
export async function sendTripCompletedRateNotifications(tripId: string) {
  try {
    // Get trip details
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        driver: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        stations: {
          include: {
            bookingsFrom: {
              include: {
                passenger: {
                  select: {
                    id: true,
                  },
                },
              },
            },
            bookingsTo: {
              include: {
                passenger: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!trip) {
      logger.error({ tripId }, 'Trip not found for sending rate notifications');
      return;
    }

    // Collect all unique passengers on the trip
    const passengerIds = new Set<string>();
    for (const station of trip.stations) {
      for (const booking of station.bookingsFrom) {
        if (booking.passenger?.id) {
          passengerIds.add(booking.passenger.id);
        }
      }
      for (const booking of station.bookingsTo) {
        if (booking.passenger?.id) {
          passengerIds.add(booking.passenger.id);
        }
      }
    }

    // Send rate notification to each passenger
    const notifications = Array.from(passengerIds).map((passengerId) => {
      return sendNotification({
        recipientId: passengerId,
        domain: NotificationDomain.TRIP,
        entityType: 'trip',
        entityId: tripId,
        type: NotificationType.TRIP_COMPLETED_RATE,
        payload: {
          type: NotificationType.TRIP_COMPLETED_RATE,
          trip: {
            id: trip.id,
            name: trip.name,
          },
          driver: {
            id: trip.driver?.id || '',
            name: trip.driver?.user?.fullName || 'Unknown Driver',
          },
        },
      });
    });

    await Promise.all(notifications);
    logger.info({ tripId, passengerCount: passengerIds.size }, 'Trip completed rate notifications sent');
  } catch (error) {
    logger.error({ tripId, error }, 'Failed to send trip completed rate notifications');
  }
}

export async function sendNotification<T extends keyof NotificationPayloadMap>({
  recipientId,
  recipientAgencyId,
  actorId,
  actorAgencyId,
  domain,
  type,
  entityType,
  entityId,
  payload,
  status = NotificationStatus.UNREAD,
}: SendNotificationParams<T>) {
  try {
    // Validate payload structure using discriminated union schema
    const validationResult = NotificationPayloadSchema.safeParse(payload);

    if (!validationResult.success) {
      const errorMessage = `Invalid notification payload: ${validationResult.error.message}`;
      logger.error(
        {
          error: validationResult.error,
          type,
          payload,
        },
        errorMessage
      );
      throw new Error(errorMessage);
    }

    // Ensure payload type matches the notification type parameter
    if (validationResult.data.type !== type) {
      const errorMessage = `Payload type mismatch: expected ${type}, got ${validationResult.data.type}`;
      logger.error(
        {
          expectedType: type,
          actualType: validationResult.data.type,
          payload,
        },
        errorMessage
      );
      throw new Error(errorMessage);
    }

    // Store validated payload as Json in Prisma
    // The payload is validated and matches the discriminated union schema
    // Convert to Prisma-compatible Json type (InputJsonValue)
    const jsonPayload: Prisma.InputJsonValue = JSON.parse(JSON.stringify(validationResult.data));
    const dedupeKey = hashData(jsonPayload);

    const check = await prisma.notification.findUnique({
      where: {
        dedupeKey,
      },
    });

    if (check) {
      // Notification already exists
      return;
    }

    const notification = await prisma.notification.create({
      data: {
        recipientId,
        recipientAgencyId,
        actorId: actorId ?? null,
        actorAgencyId: actorAgencyId ?? null,
        domain,
        type,
        status,
        dedupeKey,
        entityType,
        entityId,
        payload: jsonPayload,
      },
    });

    logger.info(
      {
        notificationId: notification.id,
        recipientId,
        type,
        entityType,
        entityId,
      },
      'Notification sent successfully'
    );

    // Send FCM notification if recipient has a token
    try {
      if (recipientId) {
        const recipient = await prisma.user.findUnique({
          where: { id: recipientId },
          select: { fcmToken: true },
        });

        if (recipient?.fcmToken && firebaseAdmin.apps.length) {
          const { title, body } = getNotificationContent(type, payload);
          await firebaseAdmin.messaging().send({
            token: recipient.fcmToken,
            data: {
              notificationId: notification.id,
              type,
              entityType,
              entityId,
            },
            notification: {
              title,
              body,
            },
          });

          logger.info(
            {
              recipientId,
              type,
            },
            'FCM notification sent successfully'
          );
        }
      }
    } catch (error) {
      // Log error but don't fail the request since the app notification was created
      logger.error(
        {
          error,
          recipientId,
          type,
        },
        'Failed to send FCM notification'
      );
    }

    return notification;
  } catch (error) {
    logger.error(
      {
        error,
        recipientId,
        type,
        entityType,
        entityId,
      },
      'Failed to send notification'
    );
    throw error;
  }
}
