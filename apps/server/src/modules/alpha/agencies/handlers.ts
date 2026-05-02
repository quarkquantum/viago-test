import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { listAgenciesSchema, updateAgencyStatusSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { AgencyRoutes } from '@/modules/alpha/agencies/routes';
import { AgencyStatus } from '@repo/shared/constants/agency';

const agencyHandler = new Hono<HonoEnv>()
  .get('/', ...AgencyRoutes.listAgencies, validator('query', listAgenciesSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const where: Prisma.AgencyWhereInput = {
      ...(query.q && {
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { slug: { contains: query.q, mode: 'insensitive' } },
        ],
      }),
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      prisma.agency.findMany({
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take,
        where,
      }),
      prisma.agency.count({ where }),
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
  .get('/:identifier', ...AgencyRoutes.getAgency, async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');

    const agency = await prisma.agency.findUnique({
      include: {
        _count: {
          select: {
            buses: true,
            trips: true,
            members: true,
            locations: true,
          },
        },
      },
      where: { slug: identifier },
    });

    if (!agency) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'agency',
        message: t('agency.api.error.not_found'),
      });
    }

    const revenue = await prisma.booking.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['COMPLETED', 'CONFIRMED'] },
        trip: { agencyId: agency.id },
      },
    });

    return ctx.json(
      {
        ...agency,
        stats: {
          buses: agency._count.buses,
          cashiers: agency._count.cashiers,
          drivers: agency._count.drivers,
          revenue: revenue._sum.total || 0,
          trips: agency._count.trips,
        },
      },
      200
    );
  })
  .patch('/:identifier/toggle-status', ...AgencyRoutes.toggleStatus, validator('json', updateAgencyStatusSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const { status } = ctx.req.valid('json');

    const agency = await prisma.agency.findUnique({
      where: { slug: identifier },
    });

    if (!agency) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'agency',
        message: t('agency.api.error.not_found'),
      });
    }

    const updated = await prisma.agency.update({
      where: { id: agency.id },
      data: { status },
    });

    return ctx.json({ data: updated }, 200);
  });

export default agencyHandler;
