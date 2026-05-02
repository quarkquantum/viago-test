import { prisma } from '@repo/database';
import { BookingStatus, ReportStatus } from '@repo/shared/constants';
import { createReportSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextUser } from '@/lib/hono/context';
import { ReportRoutes } from './routes';

const reportHandler = new Hono<HonoEnv>().post(
  '/',
  ...ReportRoutes.createReport,
  validator('json', createReportSchema),
  async (ctx) => {
    const t = await useTranslation(ctx);
    const user = getContextUser();
    const { tripId, type, content } = ctx.req.valid('json');

    // Verify the trip exists and get its agencyId
    const trip = await prisma.trip.findUnique({
      select: { agencyId: true, id: true },
      where: { id: tripId },
    });

    if (!trip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    // Verify the passenger has an active booking for this trip
    const booking = await prisma.booking.findFirst({
      where: {
        passengerId: user.id,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
        },
        tripId,
      },
    });

    if (!booking) {
      throw new AppError({
        code: 'http:forbidden',
        entityType: 'booking',
        message: t('report.api.error.no_active_booking'),
      });
    }

    const report = await prisma.report.create({
      data: {
        agency: { connect: { id: trip.agencyId } },
        content,
        reporter: { connect: { id: user.id } },
        status: ReportStatus.PENDING,
        trip: { connect: { id: tripId } },
        type,
      },
    });

    return ctx.json(
      {
        data: report,
        message: t('report.api.success.created'),
      },
      201
    );
  }
);

export default reportHandler;
