import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { TripStatus } from '@repo/shared';
import { createTripAdminSchema, listTripsSchema, updateTripSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { TripRoutes } from './routes';

const tripHandler = new Hono<HonoEnv>()
  .get('/', ...TripRoutes.listTrips, validator('query', listTripsSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const where: Prisma.TripWhereInput = {
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
              driver: {
                OR: [
                  { fullName: { contains: query.q, mode: 'insensitive' } },
                  { email: { contains: query.q, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      }),
      ...(query.seatReservationType && {
        bus: {
          seatReservationType: query.seatReservationType,
        },
      }),
      ...(query.status && {
        status: query.status,
      }),
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
        fromStation: query.fromStation,
      }),
      ...(query.toStation && {
        toStation: query.toStation,
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
      // ...(query.arrivalTime && {
      //   Stations: {
      //     Some: {
      //       DepartureTime: {
      //         Lte: query.arrivalTime,
      //       },
      //     },
      //   },
      // }),
    };

    const [data, total] = await Promise.all([
      prisma.trip.findMany({
        include: {
          agency: true,
          bookings: { include: { trip: true } },
          bus: {
            include: {
              seats: true,
            },
          },
          stations: { orderBy: { [query.sortBy]: query.sortOrder } },
        },
        skip,
        take,
        where,
      }),
      prisma.trip.count({ where }),
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
  .get('/:identifier', ...TripRoutes.getTrip, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
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
        stations: {
          include: {
            city: true,
          },
        },
      },
      where: {
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
    return ctx.json(trip, 200);
  })
  .put('/:identifier', ...TripRoutes.updateTrip, validator('json', updateTripSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const updateData = ctx.req.valid('json');

    const existingTrip = await prisma.trip.findUnique({
      include: { bookings: true, stations: true },
      where: { id: identifier },
    });

    if (!existingTrip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    // Check for unique trip name
    if (updateData.name && updateData.name !== existingTrip.name) {
      const duplicate = await prisma.trip.findFirst({
        where: { id: { not: identifier }, name: updateData.name },
      });
      if (duplicate) {
        throw new AppError({
          code: 'database:unique_constraint',
          entityType: 'trip',
          message: t('trip.api.error.existing'),
        });
      }
    }

    const tripDeparture = new Date(updateData.departureTime);
    const tripArrival = new Date(updateData.arrivalTime);

    // Check bus availability (overlap)
    // Check if bus is being changed OR if we are just checking validity of the current bus with new times
    // Since updateData contains all fields, we can just check.
    const busActiveTrip = await prisma.trip.findFirst({
      where: {
        busId: updateData.busId,
        status: TripStatus.ONGOING,
        id: { not: identifier }, // Exclude current trip
        OR: [
          {
            AND: [{ departureTime: { lte: tripDeparture } }, { arrivalTime: { gte: tripDeparture } }],
          },
          {
            AND: [{ departureTime: { lte: tripArrival } }, { arrivalTime: { gte: tripArrival } }],
          },
          {
            AND: [{ departureTime: { gte: tripDeparture } }, { arrivalTime: { lte: tripArrival } }],
          },
        ],
      },
    });
    if (busActiveTrip) {
      throw new AppError({
        code: 'database:query_error',
        entityType: 'trip',
        message: t('trip.api.error.bus_busy'),
      });
    }

    // Check if driver is being changed and is available during trip time
    if (updateData.driverId && updateData.driverId !== existingTrip.driverId) {
      const driverConflictingTrip = await prisma.trip.findFirst({
        where: {
          driverId: updateData.driverId,
          status: TripStatus.ONGOING,
          id: { not: identifier }, // Exclude current trip
          OR: [
            {
              AND: [{ departureTime: { lte: tripDeparture } }, { arrivalTime: { gte: tripDeparture } }],
            },
            {
              AND: [{ departureTime: { lte: tripArrival } }, { arrivalTime: { gte: tripArrival } }],
            },
            {
              AND: [{ departureTime: { gte: tripDeparture } }, { arrivalTime: { lte: tripArrival } }],
            },
          ],
        },
      });
      if (driverConflictingTrip) {
        throw new AppError({
          code: 'database:query_error',
          entityType: 'trip',
          message: t('trip.api.error.driver_busy'),
        });
      }
    }

    const { name, description, busId, driverId, status, stations } = updateData;

    const updatedTrip = await prisma.$transaction(async (tx) => {
      // Update trip info
      await tx.trip.update({
        data: {
          busId,
          description,
          driverId,
          name,
          slug: `${slugify(name, { lower: true })}-${nanoid(4)}`,
          status,
          updatedAt: new Date(),
        },
        where: { id: identifier },
      });

      const existingStations = existingTrip.stations;

      // Loop over new stations from request
      for (let i = 0; i < stations.length; i++) {
        const stationData = stations[i];

        if (!stationData) {
          continue;
        }

        // Try to find a matching existing station by order
        const existingStation = existingStations.find((s) => s.order === i + 1);

        if (existingStation) {
          // Update existing station
          await tx.station.update({
            data: {
              departureTime: stationData.departureTime,
              name: stationData.name,
              startingPrice: stationData.startingPrice,
              updatedAt: new Date(),
            },
            where: { id: existingStation.id },
          });

          // Update related bookings (if any)
          await tx.booking.updateMany({
            data: { updatedAt: new Date() },
            where: {
              OR: [{ fromStationId: existingStation.id }, { toStationId: existingStation.id }],
              tripId: identifier,
            },
          });
        } else {
          // Create new station
          await tx.station.create({
            data: {
              departureTime: stationData.departureTime,
              name: stationData.name,
              order: i + 1,
              startingPrice: stationData.startingPrice,
              tripId: identifier,
              cityId: stationData.cityId,
            },
          });
        }
      }

      // Delete stations that were removed from request
      const stationsToDelete = existingStations.filter((s) => s.order > stations.length);
      for (const s of stationsToDelete) {
        await tx.station.delete({ where: { id: s.id } });

        // Optionally, handle bookings referencing deleted stations
        await tx.booking.updateMany({
          data: {
            updatedAt: new Date(),
          },
          where: {
            OR: [{ fromStationId: s.id }, { toStationId: s.id }],
            tripId: identifier,
          },
        });
      }

      // Return updated trip
      return tx.trip.findUnique({
        include: { bookings: true, stations: true },
        where: { id: identifier },
      });
    });

    return ctx.json({ data: updatedTrip, message: t('trip.api.success.updated') });
  })
  .post('/', ...TripRoutes.createTrip, validator('json', createTripAdminSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { agencyId, departureCityId, arrivalCityId, description } = ctx.req.valid('json');

    // Fetch city names to auto-generate trip name
    const [departureCity, arrivalCity] = await Promise.all([
      prisma.city.findUnique({ where: { id: departureCityId } }),
      prisma.city.findUnique({ where: { id: arrivalCityId } }),
    ]);

    if (!departureCity || !arrivalCity) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'city',
        message: t('trip.api.error.city_not_found'),
      });
    }

    const name = `${departureCity.name} → ${arrivalCity.name}`;

    const newTrip = await prisma.trip.create({
      data: {
        agencyId,
        departureCityId,
        arrivalCityId,
        description,
        name,
        slug: `${slugify(name, { lower: true })}-${nanoid(4)}`,
        status: TripStatus.PENDING,
      },
      include: {
        agency: true,
        departureCity: true,
        arrivalCity: true,
      },
    });

    return ctx.json(
      {
        data: newTrip,
        message: t('trip.api.success.created'),
      },
      201
    );
  })
  .delete('/:identifier', ...TripRoutes.deleteTrip, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const existingTrip = await prisma.trip.findUnique({
      include: {
        bookings: true,
        stations: true,
      },
      where: { id: identifier },
    });

    if (!existingTrip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Find all bookings for this trip
      const bookings = await tx.booking.findMany({
        where: { tripId: identifier },
        select: { id: true },
      });
      const bookingIds = bookings.map((b) => b.id);

      // 2. Unlink or delete transactions associated with these bookings
      if (bookingIds.length > 0) {
        await tx.transaction.deleteMany({
          where: { bookingId: { in: bookingIds } },
        });
      }

      // 3. Delete bookings (this will cascade to Ticket if schema permits,
      // otherwise we add explicit deletion if needed. Based on schema, Ticket cascades from Booking)
      await tx.booking.deleteMany({
        where: { tripId: identifier },
      });

      // 4. Delete stations
      await tx.station.deleteMany({
        where: { tripId: identifier },
      });

      // 5. Delete the trip itself
      return await tx.trip.delete({
        where: { id: identifier },
      });
    });

    return ctx.json(
      {
        message: t('trip.api.success.deleted'),
      },
      200
    );
  });

export default tripHandler;
