import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { SystemRoles } from '@repo/shared';
import { listPassengersSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { PassengerRoutes } from './routes';

const passengerHandler = new Hono<HonoEnv>()
  .get('/', ...PassengerRoutes.listPassengers, validator('query', listPassengersSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const where: Prisma.UserWhereInput = {
      role: SystemRoles.USER,
      ...(query.q && {
        OR: [
          {
            fullName: {
              contains: query.q,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query.q,
              mode: 'insensitive',
            },
          },
          {
            profile: {
              phoneNumber: {
                contains: query.q,
              },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        include: {
          profile: true,
          tickets: {
            include: {
              booking: {
                include: {
                  fromStation: true,
                  toStation: true,
                  trip: true,
                },
              },
              seat: true,
            },
          },
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take,
        where,
      }),
      prisma.user.count({ where }),
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
  .get('/:identifier', ...PassengerRoutes.getPassenger, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const user = await prisma.user.findUnique({
      include: {
        profile: true,
        tickets: {
          include: {
            booking: {
              include: {
                fromStation: true,
                toStation: true,
                trip: {
                  include: {
                    bus: true,
                  },
                },
              },
            },
            seat: true,
          },
        },
      },
      where: { id: identifier },
    });
    if (!user) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'passenger',
        message: t('passenger.api.error.not_found'),
      });
    }
    return ctx.json(user, 200);
  });

export default passengerHandler;
