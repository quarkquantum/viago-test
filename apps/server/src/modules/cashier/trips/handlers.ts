import { useTranslation } from '@intlify/hono';
import { Prisma, prisma } from '@repo/database';
import { SeatType, TripStatus } from '@repo/shared';
import { listTripsSchema, tripSeatsQuerySchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency } from '@/lib/hono/context';
import {
  ACTIVE_SEAT_BLOCKING_BOOKING_STATUSES,
  getSegmentSeatOccupancy,
  SeatAvailabilityService,
} from '@/modules/app/trip/services';
import { TripRoutes } from './routes';

const tripHandler = new Hono<HonoEnv>()
  .get('/', ...TripRoutes.listTrips, validator('query', listTripsSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const agency = getContextAgency();

    const where: Prisma.TripWhereInput = {
      agencyId: agency.id,
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
            agency: {
              name: {
                contains: query.q,
                mode: 'insensitive',
              },
            },
          },
          {
            stations: {
              some: {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            bus: {
              OR: [
                { licensePlate: { contains: query.q, mode: 'insensitive' } },
                { title: { contains: query.q, mode: 'insensitive' } },
              ],
            },
          },
          {
            driver: {
              user: {
                OR: [
                  { fullName: { contains: query.q, mode: 'insensitive' } },
                  { email: { contains: query.q, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      }),
      ...(query.status ? { status: query.status } : { status: { not: TripStatus.DELETED } }),
      ...(query.agencyId && {
        agency: {
          OR: [
            {
              id: query.agencyId,
            },
            {
              slug: query.agencyId,
            },
          ],
        },
      }),
      ...(query.fromStation && {
        stations: {
          some: {
            name: { contains: query.fromStation, mode: 'insensitive' },
          },
        },
      }),
      ...(query.toStation && {
        stations: {
          some: {
            name: { contains: query.toStation, mode: 'insensitive' },
          },
        },
      }),
      ...(query.departureTime && {
        departureTime: {
          gte: query.departureTime,
          lte: query.arrivalTime,
        },
      }),
      ...(query.arrivalTime && {
        arrivalTime: {
          gte: query.departureTime,
          lte: query.arrivalTime,
        },
      }),
    };

    const tripListInclude = Prisma.validator<Prisma.TripInclude>()({
      agency: true,
      bookings: {
        select: {
          seatId: true,
          fromStation: { select: { order: true } },
          toStation: { select: { order: true } },
        },
        where: {
          status: {
            in: ACTIVE_SEAT_BLOCKING_BOOKING_STATUSES,
          },
        },
      },
      bus: {
        include: {
          seats: {
            select: {
              id: true,
              type: true,
            },
          },
        },
      },
      stations: { select: { id: true, name: true, order: true, departureTime: true }, orderBy: { order: 'asc' } },
    });

    const [data, total] = await Promise.all([
      prisma.trip.findMany({
        include: tripListInclude,
        skip,
        take,
        where,
      }),
      prisma.trip.count({ where }),
    ]);

    const tripsWithSeatSummary = data.map((trip: Prisma.TripGetPayload<{ include: typeof tripListInclude }>) => {
      const firstStation = trip.stations[0];
      const lastStation = trip.stations.at(-1);

      if (!(firstStation && lastStation)) {
        return {
          ...trip,
          seatsSummary: { available: 0, reserved: 0, total: 0 },
        };
      }

      const summary = getSegmentSeatOccupancy({
        bookings: trip.bookings,
        fromOrder: firstStation.order,
        seats: trip.bus.seats,
        toOrder: lastStation.order,
      });

      return {
        ...trip,
        seatsSummary: {
          available: summary.available,
          reserved: summary.reserved,
          total: summary.total,
        },
      };
    });

    return ctx.json({
      data: tripsWithSeatSummary,
      pagination: getPaginationMeta({
        limit: query.limit,
        page: query.page,
        total,
      }),
    });
  })
  .get('/:identifier', ...TripRoutes.getTrip, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const agency = getContextAgency();
    const trip = await prisma.trip.findFirst({
      include: {
        agency: true,
        bookings: {
          include: {
            fromStation: true,
            passenger: true,
            seat: true,
            ticket: true,
            toStation: true,
          },
        },
        bus: {
          include: {
            seats: true,
          },
        },
        driver: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        stations: true,
      },
      where: {
        agencyId: agency.id,
        OR: [
          {
            id: identifier,
          },
          {
            slug: identifier,
          },
        ],
      },
    });
    if (!trip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    const orderedStations = [...trip.stations].sort((a, b) => a.order - b.order);
    const passengerSeats = trip.bus?.seats?.filter((seat) => seat.type === SeatType.PASSENGER) ?? [];
    const activeBookings = trip.bookings.filter((booking) =>
      ACTIVE_SEAT_BLOCKING_BOOKING_STATUSES.includes(
        booking.status as (typeof ACTIVE_SEAT_BLOCKING_BOOKING_STATUSES)[number]
      )
    );

    const stationsWithSeatSummary = orderedStations.map((station, index) => {
      const nextStation = orderedStations[index + 1];

      if (!nextStation) {
        return {
          ...station,
          seatsSummary: {
            available: passengerSeats.length,
            reserved: 0,
            segmentToStationId: null,
            segmentToStationName: null,
            total: passengerSeats.length,
          },
        };
      }

      const summary = getSegmentSeatOccupancy({
        bookings: activeBookings,
        fromOrder: station.order,
        seats: passengerSeats,
        toOrder: nextStation.order,
      });

      return {
        ...station,
        seatsSummary: {
          available: summary.available,
          reserved: summary.reserved,
          segmentToStationId: nextStation.id,
          segmentToStationName: nextStation.name,
          total: summary.total,
        },
      };
    });

    return ctx.json(
      {
        ...trip,
        stations: stationsWithSeatSummary,
      },
      200
    );
  })
  .get(
    '/:identifier/seats',
    ...TripRoutes.getTripAvailableSeats,
    validator('query', tripSeatsQuerySchema),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.param();
      const { fromStationId, toStationId } = ctx.req.valid('query');

      const trip = await prisma.trip.findFirst({
        select: { id: true },
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
      });

      if (!trip) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'trip',
          message: t('trip.api.error.not_found'),
        });
      }

      const stations = await prisma.station.findMany({
        select: { id: true, order: true },
        where: {
          id: { in: [fromStationId, toStationId] },
          tripId: trip.id,
        },
      });

      const fromStation = stations.find((station) => station.id === fromStationId);
      const toStation = stations.find((station) => station.id === toStationId);

      if (!(fromStation && toStation)) {
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'station',
          message: t('booking.api.error.station_not_found'),
        });
      }

      const data = await SeatAvailabilityService.getAvailableSeats(trip.id, fromStation.order, toStation.order);
      return ctx.json({ data }, 200);
    }
  );

export default tripHandler;
