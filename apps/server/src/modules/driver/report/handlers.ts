import { prisma } from '@repo/database';
import { ReportStatus } from '@repo/shared/constants';
import { createDriverReportSchema, listDriverReportsSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextUser } from '@/lib/hono/context';
import { ReportRoutes } from './routes';

const reportHandler = new Hono<HonoEnv>()
  .get('/', ...ReportRoutes.listReports, validator('query', listDriverReportsSchema), async (ctx) => {
    const user = getContextUser();
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const where = {
      reporterId: user.id,
      ...(query.tripId ? { tripId: query.tripId } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.report.findMany({
        include: {
          trip: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        where,
      }),
      prisma.report.count({ where }),
    ]);

    return ctx.json(
      {
        data,
        pagination: getPaginationMeta({
          limit: query.limit,
          page: query.page,
          total,
        }),
      },
      200
    );
  })
  .post('/', ...ReportRoutes.createReport, validator('json', createDriverReportSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const user = getContextUser();
    const { tripId, type, content } = ctx.req.valid('json');

    // Verify the trip exists
    const trip = await prisma.trip.findUnique({
      select: {
        agencyId: true,
        id: true,
        driver: {
          select: {
            userId: true,
          },
        },
      },
      where: { id: tripId },
    });

    if (!trip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    // Verify the driver is assigned to this trip
    if (trip.driver?.userId !== user.id) {
      throw new AppError({
        code: 'http:forbidden',
        entityType: 'trip',
        message: t('report.api.error.not_assigned'),
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
  });

export default reportHandler;
