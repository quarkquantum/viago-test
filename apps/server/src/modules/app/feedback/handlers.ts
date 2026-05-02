import { prisma } from '@repo/database';
import { BookingStatus, TripStatus } from '@repo/shared/constants';
import { createFeedbackSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextUser } from '@/lib/hono/context';
import { FeedbackRoutes } from './routes';

const feedbackHandler = new Hono<HonoEnv>().post(
  '/',
  ...FeedbackRoutes.createFeedback,
  validator('json', createFeedbackSchema),
  async (ctx) => {
    const t = await useTranslation(ctx);
    const user = getContextUser();
    const { tripId, driverId, rating, comment } = ctx.req.valid('json');

    // Verify the trip exists and is completed
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, status: true, agencyId: true, driverId: true },
    });

    if (!trip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    if (trip.status !== TripStatus.COMPLETED) {
      throw new AppError({
        code: 'http:forbidden',
        entityType: 'trip',
        message: t('feedback.api.error.trip_not_completed'),
      });
    }

    // Verify the passenger had a confirmed booking for this trip
    const booking = await prisma.booking.findFirst({
      where: {
        passengerId: user.id,
        tripId,
        status: BookingStatus.CONFIRMED,
      },
    });

    if (!booking) {
      throw new AppError({
        code: 'http:forbidden',
        entityType: 'booking',
        message: t('feedback.api.error.no_booking'),
      });
    }

    // Check for duplicate feedback
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        passengerId: user.id,
        tripId,
      },
    });

    if (existingFeedback) {
      throw new AppError({
        code: 'http:forbidden',
        entityType: 'feedback',
        message: t('feedback.api.error.already_submitted'),
      });
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        rating,
        comment,
        passenger: { connect: { id: user.id } },
        driver: { connect: { id: driverId } },
        trip: { connect: { id: tripId } },
        agency: { connect: { id: trip.agencyId } },
      },
    });

    // Update driver's running average rating
    const driverMember = await prisma.agencyMember.findUnique({
      where: { id: driverId },
      select: { userId: true },
    });

    if (driverMember) {
      const driverUser = await prisma.user.findUnique({
        where: { id: driverMember.userId },
        select: { rating: true, reviewCount: true },
      });

      if (driverUser) {
        const newCount = driverUser.reviewCount + 1;
        const newRating = (driverUser.rating * driverUser.reviewCount + rating) / newCount;

        await prisma.user.update({
          where: { id: driverMember.userId },
          data: {
            rating: newRating,
            reviewCount: newCount,
          },
        });
      }
    }

    return ctx.json(
      {
        data: feedback,
        message: t('feedback.api.success.created'),
      },
      201
    );
  }
);

export default feedbackHandler;
