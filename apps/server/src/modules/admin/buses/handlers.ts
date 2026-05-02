import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { TripStatus } from '@repo/shared/constants';
import { baseBusQuerySchema, baseQuerySchema, createBusSchema, updateBusSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { BusesRoutes } from './routes';

const busHandler = new Hono<HonoEnv>()
  .get('/', ...BusesRoutes.getListBuses, validator('query', baseBusQuerySchema), async (ctx) => {
    try {
      const query = ctx.req.valid('query');
      const { skip, take } = getPagination(query);
      const { sortBy, sortOrder } = query;

      const where: Prisma.BusWhereInput = {
        ...(query.agencyId && { agencyId: query.agencyId }),
        ...(query.minPlaces && { maxPlaces: { gte: query.minPlaces } }),
        ...(query.maxPlaces && { maxPlaces: { lte: query.maxPlaces } }),
        ...(query.seatReservationType && {
          seatReservationType: query.seatReservationType,
        }),
        ...(query.status && {
          status: query.status,
        }),

        ...(query.q && {
          OR: [
            {
              licensePlate: {
                contains: query.q,
                mode: 'insensitive',
              },
            },
            {
              title: {
                contains: query.q,
                mode: 'insensitive',
              },
            },
            {
              agency: {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
            },
            {
              trips: {
                some: {
                  status: TripStatus.ONGOING,
                  name: {
                    contains: query.q,
                    mode: 'insensitive',
                  },
                },
              },
            },
          ],
        }),
      };

      const [data, total] = await Promise.all([
        prisma.bus.findMany({
          include: {
            _count: {
              select: {
                seats: true,
                trips: true,
              },
            },
            agency: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            seats: {
              select: {
                id: true,
                type: true,
              },
            },
            trips: {
              select: {
                arrivalTime: true,
                departureTime: true,
                id: true,
                name: true,
              },
              take: 1,
              where: {
                status: TripStatus.ONGOING,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take,
          where,
        }),
        prisma.bus.count({ where }),
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
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const t = await useTranslation(ctx);
      throw new AppError({
        cause: error,
        code: 'http:internal_server_error',
        context: {
          method: ctx.req.method,
          path: ctx.req.path,
        },
        entityType: 'bus',
        message: t('bus.api.error.retrieve_failed'),
      });
    }
  })
  .post('/', ...BusesRoutes.createBus, validator('json', createBusSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const body = ctx.req.valid('json');

    const newBus = await prisma.bus.create({
      data: {
        ...body,
      },
    });

    return ctx.json(
      {
        data: newBus,
        message: t('bus.api.success.created'),
      },
      201
    );
  })
  .get('/:identifier', ...BusesRoutes.getBus, validator('query', baseQuerySchema), async (ctx) => {
    const { identifier } = ctx.req.param();
    const query = ctx.req.valid('query');
    const { page, limit } = query;
    const { skip, take } = getPagination(query);

    const [bus, currentBusTrip, totalTrips] = await Promise.all([
      prisma.bus.findUnique({
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          trips: {
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            where: {
              ...(query.q && {
                OR: [
                  {
                    name: {
                      contains: query.q,
                      mode: 'insensitive',
                    },
                  },
                  {
                    description: {
                      contains: query.q,
                      mode: 'insensitive',
                    },
                  },
                  {
                    departureTime: {
                      gte: new Date(),
                    },
                  },
                  {
                    arrivalTime: {
                      lte: new Date(),
                    },
                  },
                ],
              }),
            },
          },
        },
        where: { licensePlate: identifier },
      }),
      prisma.trip.findFirst({
        where: {
          bus: {
            licensePlate: identifier,
          },
          status: TripStatus.ONGOING,
        },
      }),
      prisma.trip.count({
        where: {
          bus: {
            licensePlate: identifier,
          },
          ...(query.q && {
            OR: [
              {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
              {
                departureTime: {
                  gte: new Date(),
                },
              },
              {
                arrivalTime: {
                  lte: new Date(),
                },
              },
            ],
          }),
        },
      }),
    ]);

    if (!bus) {
      const t = await useTranslation(ctx);
      throw new AppError({
        code: 'database:not_found',
        entityType: 'bus',
        message: t('bus.api.error.not_found'),
      });
    }

    return ctx.json({
      data: {
        bus,
        currentTrip: currentBusTrip,
      },
      pagination: getPaginationMeta({
        limit,
        page,
        total: totalTrips,
      }),
    });
  })
  .put('/:identifier', ...BusesRoutes.getListBuses, validator('json', updateBusSchema), async (ctx) => {
    try {
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.param();
      const updateData = ctx.req.valid('json');

      const existingBus = await prisma.bus.findUnique({
        include: {
          trips: {
            select: { id: true },
            where: {
              status: TripStatus.ONGOING,
            },
          },
        },
        where: { id: identifier },
      });

      if (!existingBus) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'bus',
          message: t('bus.api.error.not_found'),
        });
      }

      if (
        updateData.maxPlaces !== undefined &&
        updateData.maxPlaces !== existingBus.maxPlaces &&
        existingBus.trips.length > 0
      ) {
        throw new AppError({
          code: 'database:query_error',
          entityType: 'bus',
          message: t('bus.api.error.update_seat_active_trips'), //Cannot update seat capacity while bus has active trips
        });
      }

      const updatedBus = await prisma.bus.update({
        data: updateData,
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seats: true,
        },
        where: { licensePlate: identifier },
      });

      return ctx.json(
        {
          data: updatedBus,
          message: t('bus.api.success.updated'),
        },
        200
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const t2 = await useTranslation(ctx);
      throw new AppError({
        cause: error,
        code: 'http:internal_server_error',
        context: {
          method: ctx.req.method,
          path: ctx.req.path,
        },
        entityType: 'bus',
        message: t2('bus.api.error.update_failed'),
      });
    }
  })

  .delete('/:identifier', ...BusesRoutes.getListBuses, async (ctx) => {
    try {
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.param();

      // Check if bus is assigned to any active trips
      const activeTrip = await prisma.trip.findFirst({
        where: {
          bus: { licensePlate: identifier },
          status: TripStatus.ONGOING,
        },
      });

      if (activeTrip) {
        throw new AppError({
          code: 'database:query_error',
          entityType: 'bus',
          message: t('bus.api.error.assigned_to_active_trips'),
        });
      }

      const existingBus = await prisma.bus.findUnique({
        where: { licensePlate: identifier },
      });

      if (!existingBus) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'bus',
          message: t('bus.api.error.not_found'),
        });
      }

      const softDeleteBus = await prisma.bus.delete({
        where: { licensePlate: identifier },
      });

      return ctx.json(
        {
          data: softDeleteBus,
          message: t('bus.api.success.deleted'),
        },
        200
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const t2 = await useTranslation(ctx);
      throw new AppError({
        cause: error,
        code: 'http:internal_server_error',
        context: {
          method: ctx.req.method,
          path: ctx.req.path,
        },
        entityType: 'bus',
        message: t2('bus.api.error.delete_failed'),
      });
    }
  });

export default busHandler;
