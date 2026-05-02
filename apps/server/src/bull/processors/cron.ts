import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { BookingStatus, EntityType, NotificationDomain, TripStatus } from '@repo/shared';
import type { Job } from 'bullmq';
import { CronJobTypes } from '../cron';
import { handleTripReminderNotification } from '../jobs/notifications/trip';

export type CronJobData = {
  type: CronJobTypes;
  data?: Record<string, unknown>;
};

export async function handleCronJobs(job: Job<CronJobData>) {
  const { type } = job.data;
  const startTime = Date.now();

  try {
    switch (type) {
      case CronJobTypes.SEND_TRIP_REMINDER:
        await sendTripReminders();
        break;

      default:
        throw new Error(`Unknown job type: ${type}`);
    }

    // Log successful execution

    logger.info(
      {
        type,
        executionTime: Date.now() - startTime,
        jobId: job.id,
      },
      `Job ${type} completed successfully`
    );
  } catch (err) {
    if (err instanceof Error) {
      logger.error(
        {
          type,
          executionTime: Date.now() - startTime,
          jobId: job.id,
          err,
        },
        `Job ${type} failed: ${err.message}`
      );
    } else {
      logger.error(
        {
          type,
          executionTime: Date.now() - startTime,
          jobId: job.id,
          err,
        },
        `Job ${type} failed with an unknown error`
      );
    }
    throw err;
  }
}

async function sendTripReminders() {
  const now = new Date();
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

  // Find trips that will start in <= 15 minutes
  const upcomingTrips = await prisma.trip.findMany({
    where: {
      departureTime: {
        gt: now,
        lte: fifteenMinutesFromNow,
      },
      status: {
        in: [TripStatus.PENDING, TripStatus.ONGOING],
      },
    },
    include: {
      agency: true,
      driver: {
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      },
      bookings: {
        where: {
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
          },
        },
        include: {
          passenger: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profile: {
                select: {
                  phoneNumber: true,
                },
              },
            },
          },
        },
      },
    },
  });

  logger.info(
    {
      tripCount: upcomingTrips.length,
    },
    `Found ${upcomingTrips.length} trips starting in the next 15 minutes`
  );

  let notificationCount = 0;

  // Send notifications for each trip
  for (const trip of upcomingTrips) {
    // Collect all recipients (passengers and driver)
    const uniqueRecipientIds = new Set(
      trip.bookings
        .map((booking) => booking.passenger?.id)
        .filter(Boolean)
    );
    if (trip.driver?.user) {
      uniqueRecipientIds.add(trip.driver.user.id);
    }

    for (const recipientId of uniqueRecipientIds) {
      // Check if notification was already sent recently (within the last 15 minutes) to avoid duplicates
      const existingNotification = await prisma.notification.findFirst({
        where: {
          recipientId,
          entityType: EntityType.TRIP,
          entityId: trip.id,
          domain: NotificationDomain.TRIP,
          createdAt: {
            gte: new Date(now.getTime() - 15 * 60 * 1000), // Check last 15 minutes
          },
        },
      });

      // Skip if notification was already sent recently
      if (existingNotification) {
        continue;
      }

      // Create notification for the recipient
      try {
        await handleTripReminderNotification({
          actorAgencyId: trip.agencyId,
          recipientId,
          tripId: trip.id,
        });
        notificationCount++;
      } catch (error) {
        logger.error(
          {
            error,
            tripId: trip.id,
            recipientId,
          },
          'Failed to create trip reminder notification'
        );
      }
    }
  }

  logger.info(
    {
      notificationCount,
    },
    `Sent ${notificationCount} trip reminder notifications`
  );
}
