import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { createStationSchema, stationQuerySchema, updateStationSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { StationRoutes } from './routes';

const stationHandler = new Hono<HonoEnv>()
  .get('/', ...StationRoutes.getStations, validator('query', stationQuerySchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder, minPrice, maxPrice, exactPrice, departureFrom, departureTo } = query;

    const where: Prisma.StationWhereInput = {
      ...(minPrice && { startingPrice: { gte: minPrice } }),
      ...(maxPrice && { startingPrice: { lte: maxPrice } }),
      ...(exactPrice && { startingPrice: { equals: exactPrice } }),
      ...(departureFrom && { departureTime: { gte: departureFrom } }),
      ...(departureTo && { departureTime: { lte: departureTo } }),
    };
    const [data, total] = await Promise.all([
      prisma.station.findMany({
        include: {
          trip: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
        where,
      }),
      prisma.station.count({ where }),
    ]);

    return ctx.json(
      {
        data,
        pagination: {
          skip,
          take,
          total,
        },
      },
      200
    );
  })
  .get('/:id', ...StationRoutes.getStation, async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();

    const station = await prisma.station.findUnique({
      include: {
        bookingsFrom: {
          include: {
            toStation: {
              select: { name: true },
            },
            trip: {
              select: { name: true },
            },
          },
        },
        bookingsTo: {
          include: {
            fromStation: {
              select: { name: true },
            },
            trip: {
              select: { name: true },
            },
          },
        },
        trip: {
          select: {
            description: true,
            id: true,
            name: true,
            status: true,
          },
        },
      },
      where: { id },
    });

    if (!station) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'station',
        message: t('station.api.error.not_found'),
      });
    }

    return ctx.json(
      {
        data: station,
      },
      200
    );
  })
  .post('/', ...StationRoutes.createStation, validator('json', createStationSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const stationData = ctx.req.valid('json');
    const tripExists = await prisma.trip.findUnique({
      select: { id: true, name: true },
      where: {
        id: stationData.tripId,
      },
    });
    if (!tripExists) {
      console.log('not existing ');
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('station.api.error.trip.not_found'),
      });
    }
    const existingStation = await prisma.station.findFirst({
      where: {
        order: stationData.order,
        tripId: stationData.tripId,
      },
    });
    if (existingStation) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'station',
        message: t('station.api.error.existing_station_order'),
      });
    }
    const newStation = await prisma.station.create({
      data: stationData,
      include: {
        trip: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return ctx.json(
      {
        data: newStation,
        message: t('station.api.success.created'),
      },
      201
    );
  })

  .put('/:id', ...StationRoutes.updateStation, validator('json', updateStationSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();
    const updateData = ctx.req.valid('json');
    const existingStation = await prisma.station.findUnique({
      include: {
        trip: true,
      },
      where: { id },
    });

    if (!existingStation) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'station',
        message: t('station.api.error.not_found'),
      });
    }

    if (updateData.order !== undefined && updateData.order !== existingStation.order) {
      const stationWithSameOrder = await prisma.station.findFirst({
        where: {
          id: { not: id },
          order: updateData.order,
          tripId: existingStation.tripId,
        },
      });

      if (stationWithSameOrder) {
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'station',
          message: t('station.api.error.stations_not_ordered'),
        });
      }
    }

    const updatedStation = await prisma.station.update({
      data: updateData,
      include: {
        trip: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: { id },
    });

    return ctx.json(
      {
        data: updatedStation,
        message: t('station.api.success.updated'),
      },
      200
    );
  })
  .delete('/:id', ...StationRoutes.deleteStation, async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();
    const existingStation = await prisma.station.findUnique({
      include: {
        bookingsFrom: {
          select: { id: true },
        },
        bookingsTo: {
          select: { id: true },
        },
        trip: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: { id },
    });

    if (!existingStation) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'station',
        message: t('station.api.error.not_found'),
      });
    }
    const totalBookings = existingStation.bookingsFrom.length + existingStation.bookingsTo.length;
    if (totalBookings > 0) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'station',
        message: t('station.api.error.station_used_in_bookings'),
      });
    }

    await prisma.station.delete({
      where: { id },
    });

    return ctx.json(
      {
        message: t('station.api.success.deleted'),
      },
      200
    );
  });

export default stationHandler;
