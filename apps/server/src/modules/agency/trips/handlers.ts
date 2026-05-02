import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { BookingStatus, BusStatus, NotificationDomain, NotificationType, TicketStatus, TripStatus } from '@repo/shared';
import { createTripSchema, listTripsSchema, updateTripSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { notificationsQueue } from '@/bull/queues';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency, getContextUser } from '@/lib/hono/context';
import { TripRoutes } from './routes';

const tripHandler = new Hono<HonoEnv>()
  .get('/', ...TripRoutes.listTrips, validator('query', listTripsSchema), async (ctx) => {
    const agency = getContextAgency();

    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

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
      ...(query.seatReservationType && {
        bus: {
          seatReservationType: query.seatReservationType,
        },
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
    const agency = getContextAgency();
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
    return ctx.json(trip, 200);
  })
  .post('/', ...TripRoutes.createTrip, validator('json', createTripSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();

    const trip = ctx.req.valid('json');
    const { stations, ...TripData } = trip;

    // Check if trip name already exists within this agency
    const existingTrip = await prisma.trip.findFirst({
      include: {
        agency: true,
      },
      where: {
        agencyId: agency.id,
        name: trip.name,
      },
    });

    if (existingTrip) {
      throw new AppError({
        code: 'database:unique_constraint',
        entityType: 'trip',
        message: t('trip.api.error.existing'),
      });
    }

    // Check if driver is available during the trip time
    const tripDeparture = new Date(trip.departureTime);
    const tripArrival = new Date(trip.arrivalTime);

    // Check if bus already has an active trip within this agency
    const busActiveTrip = await prisma.trip.findFirst({
      where: {
        agencyId: agency.id,
        busId: trip.busId,
        status: TripStatus.ONGOING,
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

    const driverConflictingTrip = await prisma.trip.findFirst({
      where: {
        agencyId: agency.id,
        driverId: trip.driverId,
        status: TripStatus.ONGOING,
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

    const newTrip = await prisma.$transaction(async (tx) => {
      // Create trip
      const createdTrip = await tx.trip.create({
        data: {
          ...TripData,
          agencyId: agency.id,
          slug: `${slugify(TripData.name, { lower: true })}-${nanoid(4)}`,
          status: TripStatus.ONGOING,
        },
        include: {
          bookings: true,
          stations: true,
          driver: {
            select: {
              id: true,
            },
          },
        },
      });

      // Update trip
      await tx.trip.update({
        data: {
          stations: {
            create: stations,
          },
        },
        where: {
          id: createdTrip.id,
        },
      });

      // Update bus status
      await tx.bus.update({
        data: {
          status: BusStatus.ACTIVE,
        },
        where: {
          id: TripData.busId,
        },
      });

      return createdTrip;
    });

    await notificationsQueue.add(NotificationType.NEW_TRIP, {
      type: NotificationType.NEW_TRIP,
      domain: NotificationDomain.TRIP,

      recipientId: newTrip.driver.id,
      actorId: newTrip.driver.id,
      tripId: newTrip.id,
    });

    return ctx.json(
      {
        data: newTrip,
        message: t('trip.api.success.created'),
      },
      201
    );
  })
  .put('/:identifier', ...TripRoutes.updateTrip, validator('json', updateTripSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();

    const { identifier } = ctx.req.param();
    const updateData = ctx.req.valid('json');

    const existingTrip = await prisma.trip.findFirst({
      include: { bookings: true, stations: true },
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

    if (!existingTrip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    // Check for unique trip name within this agency
    if (updateData.name && updateData.name !== existingTrip.name) {
      const duplicate = await prisma.trip.findFirst({
        where: { agencyId: agency.id, slug: { not: identifier }, name: updateData.name },
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

    // Check bus availability (overlap) within this agency
    const busActiveTrip = await prisma.trip.findFirst({
      where: {
        agencyId: agency.id,
        busId: updateData.busId,
        status: TripStatus.ONGOING,
        id: { not: existingTrip.id },
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

    // Check if driver is being changed and is available during trip time within this agency
    if (updateData.driverId && updateData.driverId !== existingTrip.driverId) {
      const driverConflictingTrip = await prisma.trip.findFirst({
        where: {
          agencyId: agency.id,
          driverId: updateData.driverId,
          status: TripStatus.ONGOING,
          id: { not: existingTrip.id },
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
      const dataToUpdate: Prisma.TripUpdateInput = {
        updatedAt: new Date(),
      };

      if (busId && busId !== existingTrip.busId) {
        dataToUpdate.bus = { connect: { id: busId } };
      }
      if (description !== undefined && description !== existingTrip.description) {
        dataToUpdate.description = description;
      }
      if (driverId && driverId !== existingTrip.driverId) {
        dataToUpdate.driver = { connect: { id: driverId } };
      }
      if (name && name !== existingTrip.name) {
        dataToUpdate.name = name;
        dataToUpdate.slug = `${slugify(name, { lower: true })}-${nanoid(4)}`;
      }
      if (status && status !== existingTrip.status) {
        dataToUpdate.status = status;
      }

      // Update trip info if there are changes (updatedAt is always present, so > 1 check)
      if (Object.keys(dataToUpdate).length > 1) {
        await tx.trip.update({
          data: dataToUpdate,
          where: { id: existingTrip.id },
        });
      }

      // Update bus status if relevant changes occurred
      if ((status && status !== existingTrip.status) || (busId && busId !== existingTrip.busId)) {
        await tx.bus.update({
          data: { status: BusStatus.ACTIVE },
          where: { id: busId || existingTrip.busId },
        });
      }

      // If trip status is set to COMPLETED, update all bookings to COMPLETED and tickets to EXPIRED
      if (status === TripStatus.COMPLETED && existingTrip.status !== TripStatus.COMPLETED) {
        await tx.booking.updateMany({
          data: {
            status: BookingStatus.COMPLETED,
            updatedAt: new Date(),
          },
          where: {
            tripId: existingTrip.id,
            status: { not: BookingStatus.DELETED },
          },
        });

        await tx.ticket.updateMany({
          data: {
            status: TicketStatus.EXPIRED,
            updatedAt: new Date(),
          },
          where: {
            booking: {
              tripId: existingTrip.id,
            },
            status: { in: [TicketStatus.ISSUED, TicketStatus.CONSUMED] },
          },
        });
      }

      const existingStations = existingTrip.stations;
      const processedStationIds = new Set<string>();

      // Loop over new stations from request
      for (let i = 0; i < stations.length; i++) {
        const stationData = stations[i];
        const newOrder = i + 1;

        if (!stationData) {
          continue;
        }

        const existingStation =
          'id' in stationData && stationData.id ? existingStations.find((s) => s.id === stationData.id) : undefined;

        if (existingStation) {
          processedStationIds.add(existingStation.id);

          const stationUpdateData: Prisma.StationUpdateInput = {};

          if (new Date(stationData.departureTime).getTime() !== new Date(existingStation.departureTime).getTime()) {
            stationUpdateData.departureTime = stationData.departureTime;
          }
          if (stationData.name !== existingStation.name) {
            stationUpdateData.name = stationData.name;
          }
          if (stationData.startingPrice !== existingStation.startingPrice) {
            stationUpdateData.startingPrice = stationData.startingPrice;
          }
          if (existingStation.order !== newOrder) {
            stationUpdateData.order = newOrder;
          }

          if (Object.keys(stationUpdateData).length > 0) {
            stationUpdateData.updatedAt = new Date();
            await tx.station.update({
              data: stationUpdateData,
              where: { id: existingStation.id },
            });

            await tx.booking.updateMany({
              data: { updatedAt: new Date() },
              where: {
                OR: [{ fromStationId: existingStation.id }, { toStationId: existingStation.id }],
                tripId: existingTrip.id,
              },
            });
          }
        } else {
          // Create new station
          await tx.station.create({
            data: {
              ...stationData,
              order: newOrder,
              tripId: existingTrip.id,
            },
          });
        }
      }

      // Delete stations that were removed (not in processed IDs)
      const stationsToDelete = existingStations.filter((s) => !processedStationIds.has(s.id));
      for (const s of stationsToDelete) {
        await tx.station.delete({ where: { id: s.id } });
      }

      // Return updated trip
      return tx.trip.findUnique({
        include: { bookings: true, stations: true },
        where: { id: existingTrip.id },
      });
    });

    return ctx.json({ data: updatedTrip, message: t('trip.api.success.updated') }, 200);
  })

  .delete('/:identifier', ...TripRoutes.deleteTrip, async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();
    const { identifier } = ctx.req.param();
    const existingTrip = await prisma.trip.findFirst({
      include: {
        bookings: true,
        stations: true,
      },
      where: { slug: identifier, agencyId: agency.id },
    });

    if (!existingTrip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    const softDeletedTrip = await prisma.trip.update({
      data: {
        status: TripStatus.DELETED,
      },
      where: { id: existingTrip.id },
    });

    return ctx.json(
      {
        data: softDeletedTrip,
        message: t('trip.api.success.deleted'),
      },
      200
    );
  });

export default tripHandler;
