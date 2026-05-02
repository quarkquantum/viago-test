import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { BusSeatPolicy, BookingStatus, TripStatus } from '@repo/shared/constants';
import { createBookingSchema, listBookingsSchema, updateBookingSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextUser } from '@/lib/hono/context';
import { redis } from '@/lib/redis';
import { SeatAvailabilityService } from '../trip/services';
import { BookingRoutes } from './routes';

const bookingHandler = new Hono<HonoEnv>()
  .get('/', ...BookingRoutes.getBookings, validator('query', listBookingsSchema), async (ctx) => {
    const user = getContextUser();
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { q, status } = query;

    const where: Prisma.BookingWhereInput = {
      passengerId: user.id,
      ...(status && {
        status,
      }),
      status: { not: BookingStatus.DELETED },
      ...(q && {
        OR: [
          {
            fromStation: {
              name: { contains: q, mode: 'insensitive' },
            },
          },
          {
            toStation: {
              name: { contains: q, mode: 'insensitive' },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        include: {
          fromStation: {
            select: {
              id: true,
              name: true,
              order: true,
            },
          },
          toStation: {
            select: {
              id: true,
              name: true,
              order: true,
            },
          },
          trip: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        where,
      }),
      prisma.booking.count({ where }),
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
  .get('/:id', ...BookingRoutes.getBooking, async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();

    const booking = await prisma.booking.findUnique({
      include: {
        fromStation: {
          select: {
            id: true,
            name: true,
            order: true,
            startingPrice: true,
          },
        },
        toStation: {
          select: {
            id: true,
            name: true,
            order: true,
            startingPrice: true,
          },
        },
        trip: {
          select: {
            description: true,
            id: true,
            name: true,
          },
        },
      },
      where: { id },
    });

    if (!booking) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'booking',
        message: t('booking.api.error.not_found'),
        params: { resource: id },
      });
    }

    return ctx.json({ data: booking }, 200);
  })
  .post('/', ...BookingRoutes.createBooking, validator('json', createBookingSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const user = getContextUser();
    const { fromStationId, toStationId, tripId, seatId } = ctx.req.valid('json');
    let selectedSeat: { id: string } | undefined;

    const trip = await prisma.trip.findUnique({
      include: {
        bus: {
          select: { seatReservationType: true },
        },
        stations: {
          orderBy: { order: 'asc' },
        },
      },
      where: { id: tripId, status: TripStatus.PENDING },
    });

    if (!trip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('booking.api.error.not_found'),
        params: { resource: tripId },
      });
    }

    const [fromStation, toStation] = await Promise.all([
      prisma.station.findUnique({
        where: { id: fromStationId },
      }),
      prisma.station.findUnique({
        where: { id: toStationId },
      }),
    ]);

    if (!(fromStation && toStation)) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'station',
        message: t('booking.api.error.station_not_found'),
        params: { resource: tripId },
      });
    }

    if (fromStation.tripId !== tripId || toStation.tripId !== tripId) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'station',
        message: t('booking.api.error.station_not_belong_to_trip'),
        params: { resource: tripId },
      });
    }

    if (fromStation.order >= toStation.order) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'station',
        message: t('booking.api.error.stations_not_ordered'),
        params: { resource: tripId },
      });
    }
    const isNumbered = trip.bus.seatReservationType === BusSeatPolicy.NUMBERED;
    const availableSeats = await SeatAvailabilityService.getAvailableSeats(tripId, fromStation.order, toStation.order);

    if (isNumbered && seatId) {
      // NUMBERED: validate the requested seat
      selectedSeat = availableSeats.find((s) => s.id === seatId);

      if (!selectedSeat) {
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'seat',
          message: t('booking.api.error.seat_not_available_for_stations'),
        });
      }
    } else if (isNumbered && !seatId) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'seat',
        message: t('booking.api.error.seat_required_for_numbered_bus'),
      });
    } else {
      // UNNUMBERED: auto-assign first available seat
      selectedSeat = availableSeats[0];

      if (!selectedSeat) {
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'seat',
          message: t('booking.api.error.no_available_seats'),
        });
      }
    }
    const stationsInPath = trip.stations.filter((s) => s.order >= fromStation.order && s.order < toStation.order);

    // Calculate total
    const total = stationsInPath.reduce((sum, s) => sum + s.startingPrice, 0);

    const data = await prisma.booking.create({
      data: {
        agency: {
          connect: { id: trip.agencyId },
        },
        fromStation: {
          connect: { id: fromStationId },
        },
        passenger: {
          connect: { id: user.id },
        },
        seat: { connect: { id: selectedSeat.id } },
        status: BookingStatus.PENDING,
        toStation: {
          connect: { id: toStationId },
        },
        total,
        trip: {
          connect: { id: tripId },
        },
      },
      include: {
        fromStation: true,
        toStation: true,
        trip: true,
      },
    });

    // Invalidate trip cache
    await redis.del(`trip:${tripId}`);

    return ctx.json(
      {
        data,
        message: t('booking.api.success.created'),
      },
      201
    );
  })
  .patch('/:id', ...BookingRoutes.updateBooking, validator('json', updateBookingSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    // Const user = getContextUser();
    const { id } = ctx.req.param();
    const updateData = ctx.req.valid('json');

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'booking',
        message: t('booking.api.error.not_found'),
        params: { resource: id },
      });
    }

    const updatedBooking = await prisma.booking.update({
      data: updateData,
      include: {
        fromStation: {
          select: {
            id: true,
            name: true,
          },
        },
        toStation: {
          select: {
            id: true,
            name: true,
          },
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

    // Invalidate trip cache
    await redis.del(`trip:${updatedBooking.tripId}`);

    return ctx.json(
      {
        data: updatedBooking,
        message: t('booking.api.success.updated'),
      },
      200
    );
  })
  .delete('/:id', ...BookingRoutes.deleteBooking, async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'booking',
        message: t('booking.api.error.not_found'),
        params: { resource: id },
      });
    }
    await prisma.booking.update({
      data: {
        status: BookingStatus.DELETED,
      },
      where: { id },
    });

    // Invalidate trip cache
    await redis.del(`trip:${existingBooking.tripId}`);

    return ctx.json(
      {
        message: t('booking.api.success.deleted'),
      },
      200
    );
  });

export default bookingHandler;
