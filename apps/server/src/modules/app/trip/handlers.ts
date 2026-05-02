import { useTranslation } from '@intlify/hono';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { BusSeatStatus, SeatType, TripStatus } from '@repo/shared/constants';
import { tripQuerySchema, tripSeatsQuerySchema, tripStationsSchema, tripsRoutesSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { redis } from '@/lib/redis';
import { TripRoutes } from './routes';
import { ACTIVE_SEAT_BLOCKING_BOOKING_STATUSES, getSegmentSeatOccupancy, SeatAvailabilityService } from './services';

const tripHandler = new Hono<HonoEnv>()
  .get('/', ...TripRoutes.getTrips, validator('query', tripQuerySchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder, q } = query;
    const where: Prisma.TripWhereInput = {};
    const stationsConditions: Prisma.StationWhereInput[] = [];

    if (query.q) {
      stationsConditions.push({
        OR: [
          {
            bookingsFrom: {
              some: {
                OR: [
                  {
                    fromStation: {
                      name: {
                        contains: q,
                      },
                    },
                  },
                  {
                    toStation: {
                      name: {
                        contains: q,
                      },
                    },
                  },
                ],
              },
            },
          },
          {
            bookingsTo: {
              some: {
                OR: [
                  {
                    fromStation: {
                      name: {
                        contains: q,
                      },
                    },
                  },
                  {
                    toStation: {
                      name: {
                        contains: q,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      });
    }
    if (query.fromStation) {
      stationsConditions.push({
        id: query.fromStation,
      });
    }

    if (query.fromStation) {
      stationsConditions.push({
        name: {
          contains: query.fromStation,
          mode: 'insensitive',
        },
        order: 0,
      });
    }

    if (query.toStation) {
      stationsConditions.push({
        name: {
          contains: query.toStation,
          mode: 'insensitive',
        },
      });
    }
    if (query.startDate || query.endDate) {
      const departureTimeCondition: Prisma.DateTimeFilter = {};

      if (query.startDate) {
        departureTimeCondition.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        departureTimeCondition.lte = new Date(query.endDate);
      }

      stationsConditions.push({
        departureTime: departureTimeCondition,
      });
    }
    if (query.endDate && query.startDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      stationsConditions.push({
        departureTime: {
          gte: startDate,
          lt: endDate,
        },
      });
    }
    if (stationsConditions.length > 0) {
      where.stations = {
        some: {
          AND: stationsConditions,
        },
      };
    }

    if (query.status) {
      where.status = {
        in: Array.isArray(query.status) ? query.status : [query.status],
      };
    }

    if (query.busId) {
      where.busId = query.busId;
    }
    if (query.agencyId) {
      where.bus = {
        agencyId: query.agencyId,
      };
    }
    // If (query.busType) {
    //   Where.bus = {
    //     ...where.bus,
    //     BusSeats: {
    //       Some: {
    //         Type: query.busType
    //       }
    //     }
    //   };
    // }
    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          bus: {
            agency: {
              name: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        include: {
          _count: {
            select: {
              bookings: true,
            },
          },
          bookings: {
            select: {
              id: true,
              seatId: true,
              status: true,
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
              agency: {
                select: {
                  description: true,
                  id: true,
                  logo: true,
                  name: true,
                },
              },
              seats: {
                select: {
                  id: true,
                  type: true,
                },
              },
            },
          },
          stations: {
            select: {
              departureTime: true,
              id: true,
              name: true,
              order: true,
              startingPrice: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
        where,
      }),
      prisma.trip.count({ where }),
    ]);

    // Transform the data to include computed fields like direction, duration, etc.
    const transformedData = trips.map((trip) => {
      const stations = trip.stations ?? [];

      // --- Guard: Trip must have at least 2 stations ---
      if (stations.length < 2) {
        // Optionally log or handle invalid trips
        console.warn(`Trip ${trip.id} has fewer than 2 stations. Skipping duration calc.`);

        // Return minimal safe shape or skip
        return {
          id: trip.id,
          name: trip.name,
          description: trip.description,
          status: trip.status,
          createdAt: trip.createdAt,
          updatedAt: trip.updatedAt,
          direction: {
            duration: {
              formatted: 'N/A',
              hours: 0,
              minutes: 0,
              totalMinutes: 0,
            },
            from: undefined,
            to: undefined,
            totalStations: stations.length,
          },
          bus: {
            agency: trip.bus.agency,
            busSeats: trip.bus.seats,
            id: trip.bus.id,
            maxPlaces: trip.bus.maxPlaces,
            summary: {
              availableSeats: 0,
              totalSeats: trip.bus.maxPlaces,
            },
          },
          stations: trip.stations,
          // AvailableSeats: trip.seat ?? [],
          seats: {
            available: 0,
            reserved: 0,
            total: 0,
          },
          priceRange: { max: 0, min: 0 },
          bookingInfo: { totalBookings: trip._count.bookings },
        };
      }

      // Biome-ignore lint/style/noNonNullAssertion: we sure that first station is not null
      const firstStation = stations[0]!;
      // Biome-ignore lint/style/noNonNullAssertion: we sure that last station is not null
      const lastStation = stations.at(-1)!;

      // --- Calculate trip duration ---
      const durationMs = lastStation.departureTime.getTime() - firstStation.departureTime.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      const seatSummary = getSegmentSeatOccupancy({
        bookings: trip.bookings,
        fromOrder: firstStation.order,
        seats: trip.bus.seats ?? [],
        toOrder: lastStation.order,
      });

      // --- Price range ---
      const prices = stations.map((s) => s.startingPrice);
      const priceRange = {
        max: prices.length > 0 ? Math.max(...prices) : 0,
        min: prices.length > 0 ? Math.min(...prices) : 0,
      };

      return {
        availableSeats: trip.bus.seats ?? [],
        bookingInfo: {
          totalBookings: trip._count.bookings,
        },
        bus: {
          agency: trip.bus.agency,
          busSeats: trip.bus.seats,
          id: trip.bus.id,
          maxPlaces: trip.bus.maxPlaces,
          summary: {
            availableSeats: seatSummary.available,
            reservedSeats: seatSummary.reserved,
            totalSeats: seatSummary.total,
          },
        },
        createdAt: trip.createdAt,
        description: trip.description,
        direction: {
          duration: {
            formatted: `${durationHours}h ${durationMinutes}m`,
            hours: durationHours,
            minutes: durationMinutes,
            totalMinutes: Math.floor(durationMs / (1000 * 60)),
          },
          from: {
            departureTime: firstStation.departureTime,
            price: firstStation.startingPrice,
            stationId: firstStation.id,
            stationName: firstStation.name,
          },
          to: {
            arrivalTime: lastStation.departureTime,
            price: lastStation.startingPrice,
            stationId: lastStation.id,
            stationName: lastStation.name,
          },
          totalStations: stations.length,
        },
        id: trip.id,
        name: trip.name,
        priceRange,
        seats: {
          available: seatSummary.available,
          reserved: seatSummary.reserved,
          total: seatSummary.total,
        },
        stations: trip.stations,
        status: trip.status,
        updatedAt: trip.updatedAt,
      };
    });

    return ctx.json(
      {
        data: transformedData,
        pagination: {
          skip,
          take,
          total,
        },
      },
      200
    );
  })
  .get('/routes', ...TripRoutes.getRoutes, validator('query', tripsRoutesSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const where: Prisma.TripWhereInput = { status: TripStatus.PENDING };
    const andConditions: Prisma.TripWhereInput[] = [];

    if (query.fromStation) {
      andConditions.push({
        stations: { some: { name: { contains: query.fromStation } } },
      });
    }
    if (query.toStation) {
      andConditions.push({
        stations: { some: { name: { contains: query.toStation } } },
      });
    }
    if (query.q) {
      andConditions.push({
        OR: [{ name: { contains: query.q } }, { description: { contains: query.q } }],
      });
    }
    if (query.startDate) {
      andConditions.push({
        stations: {
          some: {
            departureTime: {
              gte: query.startDate,
            },
          },
        },
      });
    }
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [trips, total] = await prisma.$transaction([
      prisma.trip.findMany({
        include: {
          bookings: {
            select: {
              fromStation: { select: { order: true } },
              seatId: true,
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
              _count: {
                select: {
                  seats: {
                    where: {
                      type: SeatType.PASSENGER,
                    },
                  },
                },
              },
              agency: { select: { id: true, logo: true, name: true, slug: true } },
              seats: { select: { id: true, type: true } },
            },
          },
          stations: {
            orderBy: { order: 'asc' },
            select: {
              departureTime: true,
              id: true,
              name: true,
              order: true,
              startingPrice: true,
            },
          },
        },
        skip,
        take,
        where,
      }),
      prisma.trip.count({ where }),
    ]);

    const routes = trips.flatMap((trip) => {
      const stations = trip.stations;
      if (stations.length < 2) {
        return [];
      }

      return stations
        .flatMap((from, i) =>
          stations.slice(i + 1).map((to) => {
            // Filter segments: use case-insensitive contains to match the DB query behaviour
            if (query.fromStation && !from.name.toLowerCase().includes(query.fromStation.toLowerCase())) {
              return;
            }
            if (query.toStation && !to.name.toLowerCase().includes(query.toStation.toLowerCase())) {
              return;
            }

            const routeStartOrder = from.order;
            const routeEndOrder = to.order;
            const seatSummary = getSegmentSeatOccupancy({
              bookings: trip.bookings,
              fromOrder: routeStartOrder,
              seats: trip.bus.seats,
              toOrder: routeEndOrder,
            });

            const dynamicSeats = trip.bus.seats.map((seat) => {
              if (seat.type !== SeatType.PASSENGER) {
                return { ...seat, status: BusSeatStatus.OCCUPIED };
              }

              if (seatSummary.occupiedPassengerSeatIds.has(seat.id)) {
                return { ...seat, status: BusSeatStatus.OCCUPIED };
              }

              return { ...seat, status: BusSeatStatus.AVAILABLE };
            });

            const durationMs = new Date(to.departureTime).getTime() - new Date(from.departureTime).getTime();
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

            return {
              agency: trip.bus.agency,
              bus: {
                id: trip.bus.id,
                licensePlate: trip.bus.licensePlate,
                maxPlaces: trip.bus.maxPlaces,
                seatReservationType: trip.bus.seatReservationType,
                seats: dynamicSeats,
              },
              duration: {
                hours,
                minutes,
                totalMinutes: Math.floor(durationMs / (1000 * 60)),
              },
              from,
              price: Math.max(1, to.startingPrice - from.startingPrice),
              seats: {
                available: seatSummary.available,
                reserved: seatSummary.reserved,
                total: seatSummary.total,
              },
              to,
              trip,
            };
          })
        )
        .filter(Boolean); // Remove nulls from filtered routes
    });

    const pagination = getPaginationMeta({
      limit: query.limit,
      page: query.page,
      total,
    });

    return ctx.json({ data: routes, pagination }, 200);
  })
  .get('/:id', ...TripRoutes.getTrip, validator('query', tripQuerySchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();
    const cacheKey = `trip:${id}`;
    const cachedTrip = await redis.get(cacheKey);

    if (cachedTrip) {
      return ctx.json({ data: JSON.parse(cachedTrip) }, 200);
    }

    const trip = await prisma.trip.findUnique({
      include: {
        _count: {
          select: {
            bookings: true,
            stations: true,
          },
        },
        bookings: {
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
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        stations: {
          orderBy: { departureTime: 'desc' },
          select: {
            _count: {
              select: {
                bookingsFrom: true,
                bookingsTo: true,
              },
            },
            id: true,
            name: true,
            order: true,
            startingPrice: true,
          },
        },
      },
      where: { slug: id },
    });

    if (!trip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    await redis.set(cacheKey, JSON.stringify(trip), 'EX', 60); // Cache for 1 minute

    return ctx.json(
      {
        data: trip,
      },
      200
    );
  })
  .get('/:id/stations', ...TripRoutes.getTripStations, validator('query', tripStationsSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { id: tripId } = ctx.req.param();
    const query = ctx.req.valid('query');
    const { fromStationId, toStationId, sortBy, sortOrder } = query;

    const trip = await prisma.trip.findUnique({
      include: {
        stations: {
          orderBy: { [sortBy]: sortOrder },
          select: {
            _count: {
              select: {
                bookingsFrom: true,
                bookingsTo: true,
              },
            },
            departureTime: true,
            id: true,
            name: true,
            order: true,
            startingPrice: true,
          },
        },
      },
      where: {
        slug: tripId,
      },
    });

    if (!trip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    const startStation = trip.stations.find((station) => station.id === fromStationId);
    const endStation = trip.stations.find((station) => station.id === toStationId);

    if (!startStation) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'station',
        message: t('trip.api.error.start_station_not_found'),
      });
    }

    if (!endStation) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'station',
        message: t('trip.api.error.end_station_not_found'),
      });
    }

    // Filter stations between start and end (inclusive)
    const stationsBetween = trip.stations.filter(
      (station) => station.order >= startStation.order && station.order <= endStation.order
    );

    // Biome-ignore lint/suspicious/noEvolvingTypes: we sure that stationPairs is not evolving
    const stationPairs = [];
    for (let i = 0; i < stationsBetween.length; i++) {
      for (let j = i + 1; j < stationsBetween.length; j++) {
        const fromStation = stationsBetween[i];
        const toStation = stationsBetween[j];

        if (fromStation && toStation) {
          stationPairs.push({
            fromStation,
            price: toStation?.startingPrice - fromStation?.startingPrice || 1,
            route: `${fromStation.name} → ${toStation.name}`,
            segment: `${fromStation.order}-${toStation.order}`,
            toStation,
          });
        }
      }
    }

    return ctx.json(
      {
        data: {
          endStation: {
            id: endStation.id,
            name: endStation.name,
            order: endStation.order,
          },
          startStation: {
            id: startStation.id,
            name: startStation.name,
            order: startStation.order,
          },
          stationPairs,
          summary: {
            priceRange:
              stationPairs.length > 0
                ? {
                    max: Math.max(...stationPairs.map((pair) => pair.price)),
                    min: Math.min(...stationPairs.map((pair) => pair.price)),
                  }
                : {
                    max: 0,
                    min: 0,
                  },
            totalPairs: stationPairs.length,
            totalStations: stationsBetween.length,
          },
          trip: {
            id: trip.id,
            name: trip.name,
          },
        },
      },
      200
    );
  })
  .get('/:id/seats', ...TripRoutes.getTripAvailableSeats, validator('query', tripSeatsQuerySchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { id: tripId } = ctx.req.param();
    const { fromStationId, toStationId } = ctx.req.valid('query');

    const stations = await prisma.station.findMany({
      select: { id: true, order: true },
      where: {
        id: { in: [fromStationId, toStationId] },
        tripId,
      },
    });

    const fromStation = stations.find((s) => s.id === fromStationId);
    const toStation = stations.find((s) => s.id === toStationId);

    if (!(fromStation && toStation)) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'station',
        message: t('booking.api.error.station_not_found'),
      });
    }

    const availableSeats = await SeatAvailabilityService.getAvailableSeats(tripId, fromStation.order, toStation.order);

    return ctx.json({ data: availableSeats }, 200);
  });

export default tripHandler;
