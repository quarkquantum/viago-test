import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { BusSeatType, TripStatus } from '@repo/shared/constants';
import { baseBusQuerySchema, baseQuerySchema, createBusSchema, updateBusSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency } from '@/lib/hono/context';
import { BusesRoutes } from './routes';

const busHandler = new Hono<HonoEnv>()
  .get('/', ...BusesRoutes.getListBuses, validator('query', baseBusQuerySchema), async (ctx) => {
    const agencyUser = getContextAgency();

    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder } = query;

    const where: Prisma.BusWhereInput = {
      agencyId: agencyUser.id,
      ...(query.agencyId && { agencyId: query.agencyId }),
      ...(query.minPlaces && { maxPlaces: { gte: query.minPlaces } }),
      ...(query.maxPlaces && { maxPlaces: { lte: query.maxPlaces } }),
      ...(query.seatReservationType && {
        seatReservationType: query.seatReservationType,
      }),
      ...(query.status ? { status: query.status } : { status: { not: 'DELETED' } }),

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
  })
  .get('/:identifier', ...BusesRoutes.getBus, validator('query', baseQuerySchema), async (ctx) => {
    const agency = getContextAgency();

    const { identifier } = ctx.req.param();
    const query = ctx.req.valid('query');
    const { page, limit } = query;
    const { skip, take } = getPagination(query);

    console.log(identifier);
    const [bus, currentBusTrip, totalTrips] = await Promise.all([
      prisma.bus.findUnique({
        include: {
          agency: {
            select: {
              id: true,
              name: true,
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

    if (!bus || bus.agencyId !== agency.id) {
      const t = await useTranslation(ctx);
      throw new AppError({
        code: 'database:not_found',
        entityType: 'bus',
        message: t('bus.api.error.not_found'),
      });
    }

    return ctx.json(
      {
        data: {
          bus,
          currentTrip: currentBusTrip,
        },
        pagination: getPaginationMeta({
          limit,
          page,
          total: totalTrips,
        }),
      },
      200
    );
  })
  .post('/', ...BusesRoutes.createBus, validator('json', createBusSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();

    const busData = ctx.req.valid('json');

    const result = await prisma.$transaction(async (tx) => {
      const bus = await tx.bus.create({
        data: {
          agencyId: agency.id,
          licensePlate: busData.licensePlate,
          maxPlaces: busData.maxPlaces,
          title: busData.title,
        },
      });

      const busSeatsData: Prisma.SeatCreateManyInput[] = [];

      busSeatsData.push(
        {
          busId: bus.id,
          number: 0,
          type: BusSeatType.RIDER,
        },
        {
          busId: bus.id,
          number: 1,
          type: BusSeatType.RIDER,
        }
      );

      // Fill database with initially empty bus seats
      for (let i = 2; i < busData.maxPlaces; i++) {
        busSeatsData.push({
          busId: bus.id,
          number: i,
          type: BusSeatType.PASSENGER,
        });
      }

      await tx.seat.createMany({
        data: busSeatsData,
      });

      return await tx.bus.findUnique({
        include: {
          agency: {
            select: {
              id: true,
              name: true,
            },
          },
          seats: true,
        },
        where: { id: bus.id },
      });
    });

    return ctx.json(
      {
        data: result,
        message: t('bus.api.success.created'),
      },
      201
    );
  })

  .put('/:identifier', ...BusesRoutes.getListBuses, validator('json', updateBusSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();

    const { identifier } = ctx.req.param();
    const updateData = ctx.req.valid('json');

    const existingBus = await prisma.bus.findUnique({
      include: {
        trips: {
          select: { id: true },
          where: {
            status: TripStatus.PENDING,
          },
        },
      },
      where: { licensePlate: identifier },
    });

    if (!existingBus || existingBus.agencyId !== agency.id) {
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
  })

  .delete('/:identifier', ...BusesRoutes.deleteBus, async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();
    const { identifier } = ctx.req.param();
    const existingBus = await prisma.bus.findUnique({
      include: {
        trips: {
          select: {
            id: true,
            name: true,
          },
          where: {
            status: TripStatus.ONGOING,
          },
        },
      },
      where: { agencyId: agency.id, id: identifier },
    });

    if (!existingBus || existingBus.agencyId !== agency.id) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'bus',
        message: t('bus.api.error.not_found'),
      });
    }

    if (existingBus.trips.length > 0) {
      throw new AppError({
        code: 'database:query_error',
        entityType: 'bus',
        message: t('bus.api.error.assigned_to_active_trips'),
      });
    }

    const softDeleteBus = await prisma.bus.update({
      data: {
        status: 'DELETED',
      },
      where: { licensePlate: identifier },
    });

    return ctx.json(
      {
        data: softDeleteBus,
        message: t('bus.api.success.deleted'),
      },
      200
    );
  });

export default busHandler;
