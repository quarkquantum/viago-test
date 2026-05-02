import { useTranslation } from '@intlify/hono';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { StationStatus, TripStatus } from '@repo/shared';
import { tripQuerySchema, updateStationStatusSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { AppError } from '@/errors';
import { sendTripCompletedRateNotifications } from '@/helpers/notifications';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import { getStationActions, getTripActions, getTripDuration } from '@/helpers/trip';
import type { HonoEnv } from '@/lib/hono/context';
import { type GeoPoint, getDistanceInKm } from '@/utils/haversine';
import { TripRoutes } from './routes';

const tripHandler = new Hono<HonoEnv>()
  .get('/', ...TripRoutes.getTrips, validator('query', tripQuerySchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { endDate, fromStation, page, limit, sortBy, sortOrder, startDate, toStation, search, q } = query;
    const searchTerm = search || q;

    const where: Prisma.TripWhereInput = {
      // driverId: user?.id,
      status: {
        notIn: [TripStatus.CANCELLED, TripStatus.COMPLETED, TripStatus.DELETED],
      },
      departureTime: {
        gte: startDate,
        lte: endDate,
      },
      OR: searchTerm
        ? [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            {
              stations: {
                some: {
                  name: { contains: searchTerm, mode: 'insensitive' },
                },
              },
            },
          ]
        : undefined,
      stations: {
        some:
          fromStation || toStation
            ? {
                OR: [
                  fromStation ? { name: { contains: fromStation, mode: 'insensitive' } } : {},
                  toStation ? { name: { contains: toStation, mode: 'insensitive' } } : {},
                ],
              }
            : undefined,
      },
    };

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        include: {
          _count: {
            select: {
              bookings: true,
            },
          },
          agency: {
            select: {
              name: true,
            },
          },
          driver: {
            select: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      phoneNumber: true,
                    },
                  },
                },
              },
            },
          },
          bus: {
            include: {
              agency: {
                select: {
                  description: true,
                  id: true,
                  name: true,
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
              status: true,
              city: {
                select: {
                  name: true,
                  latitude: true,
                  longitude: true,
                },
              },
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

    const tripsWithActions = trips.map((trip) => {
      const screenState = getTripActions(trip);
      const distance = getDistanceInKm(trip.stations[0]?.city as GeoPoint, trip.stations.at(-1)?.city as GeoPoint);
      const duration = getTripDuration({ departureTime: trip.departureTime, arrivalTime: trip.arrivalTime });

      const isTripOngoing = screenState.screen === 'ongoing';

      return {
        ...trip,
        screenState,
        distance,
        duration,
        stations: trip.stations.map((station, index) => ({
          ...station,
          actions: getStationActions(station, trip.stations, index, isTripOngoing),
        })),
      };
    });

    return ctx.json({
      data: tripsWithActions,
      pagination: getPaginationMeta({ limit, page, total }),
    });
  })
  .get('/:identifier', ...TripRoutes.getTrip, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();

    const selectedData = {
      _count: {
        select: {
          bookings: true,
          stations: true,
        },
      },
      agency: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
      arrivalTime: true,
      startedAt: true,
      endedAt: true,
      bus: {
        select: {
          licensePlate: true,
          maxPlaces: true,
          seatReservationType: true,
          title: true,
        },
      },
      departureTime: true,
      driver: {
        select: {
          user: {
            select: {
              fullName: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
      },
      createdAt: true,
      description: true,
      id: true,
      slug: true,
      name: true,
      status: true,
      stations: {
        orderBy: {
          order: 'asc' as const,
        },
        select: {
          city: {
            select: {
              name: true,
              latitude: true,
              longitude: true,
            },
          },
          departureTime: true,
          id: true,
          name: true,
          order: true,
          startingPrice: true,
          status: true,
          bookingsFrom: {
            select: {
              id: true,
              passenger: {
                select: {
                  fullName: true,
                  profile: {
                    select: {
                      phoneNumber: true,
                    },
                  },
                },
              },
              seat: {
                select: {
                  number: true,
                },
              },
            },
          },
          bookingsTo: {
            select: {
              id: true,
              passenger: {
                select: {
                  fullName: true,
                  profile: {
                    select: {
                      phoneNumber: true,
                    },
                  },
                },
              },
              seat: {
                select: {
                  number: true,
                },
              },
            },
          },
        },
      },
    };

    let data = await prisma.trip.findFirst({
      where: { OR: [{ slug: identifier }, { id: identifier }] },
      select: selectedData,
    });

    if (!data) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    if (data.status === TripStatus.PENDING && data.departureTime.getTime() - 15 * 60 * 1000 <= Date.now()) {
      const updatedData = await prisma.$transaction([
        prisma.trip.update({
          where: { slug: data.slug },
          data: { status: TripStatus.ONGOING, startedAt: new Date() },
          select: selectedData,
        }),
        prisma.station.updateMany({
          where: { tripId: data.id, order: 0 },
          data: { status: StationStatus.BOARDING },
        }),
      ]);

      data = updatedData[0];
    }

    if (data.status === TripStatus.ONGOING) {
      const now = new Date();
      let updatesMade = false;

      const firstStation = data.stations[0];
      if (firstStation && firstStation.status === StationStatus.PENDING) {
        await prisma.station.update({
          where: { id: firstStation.id },
          data: { status: StationStatus.BOARDING },
        });
        updatesMade = true;
      }

      for (const [index, station] of data.stations.entries()) {
        if (station.status === StationStatus.COMPLETED) {
          continue;
        }

        if (station.departureTime > now) {
          break;
        }

        await prisma.station.update({
          where: { id: station.id },
          data: { status: StationStatus.COMPLETED },
        });
        updatesMade = true;

        const nextStation = data.stations[index + 1];
        if (nextStation) {
          await prisma.station.update({
            where: { id: nextStation.id },
            data: { status: StationStatus.BOARDING },
          });
        } else {
          await prisma.trip.update({
            where: { slug: data.slug },
            data: { status: TripStatus.COMPLETED, endedAt: new Date() },
          });
          break;
        }
      }

      if (updatesMade) {
        data = await prisma.trip.findFirstOrThrow({
          where: { slug: identifier },
          select: selectedData,
        });
      }
    }

    // if (data.driver.user.email !== driver.email) {
    //   throw new AppError({
    //     code: 'http:forbidden',
    //     entityType: 'trip',
    //     message: 'ticket.api.error.unauthorized',
    //   });
    // }

    const screenState = getTripActions(data);
    const distance = getDistanceInKm(data.stations[0]?.city as GeoPoint, data.stations.at(-1)?.city as GeoPoint);
    const duration = getTripDuration({ departureTime: data.departureTime, arrivalTime: data.arrivalTime });

    const isTripOngoing = screenState.screen === 'ongoing';

    const tripWithActions = {
      ...data,
      screenState,
      distance,
      duration,
      stations: data.stations.map((station, index) => ({
        ...station,
        actions: getStationActions(station, data.stations, index, isTripOngoing),
      })),
    };

    return ctx.json(tripWithActions);
  })
  .post('/:identifier/start', ...TripRoutes.startTrip, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();

    const trip = await prisma.trip.findFirst({
      where: { OR: [{ slug: identifier }, { id: identifier }] },
      include: {
        stations: {
          orderBy: { order: 'asc' },
          select: { id: true, status: true, departureTime: true },
        },
      },
    });

    if (!trip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    // Check if trip can be started
    const screenState = getTripActions(trip);
    if (screenState.screen !== 'boarding' || !screenState.canStartTrip) {
      throw new AppError({
        code: 'http:forbidden',
        entityType: 'trip',
        message: t('trip.api.error.cannot_start'),
      });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: trip.id },
      data: { status: TripStatus.ONGOING, startedAt: new Date() },
      include: {
        stations: true,
      },
    });

    // Auto-set first station to BOARDING if it is PENDING
    const firstStation = updatedTrip.stations[0];
    if (firstStation && firstStation.status === StationStatus.PENDING) {
      await prisma.station.update({
        where: { id: firstStation.id },
        data: { status: StationStatus.BOARDING },
      });
    }

    return ctx.json(updatedTrip);
  })
  .post('/:identifier/complete', ...TripRoutes.completeTrip, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();

    const trip = await prisma.trip.findFirst({
      where: { OR: [{ slug: identifier }, { id: identifier }] },
      include: {
        stations: {
          select: { status: true, departureTime: true, id: true },
        },
      },
    });

    if (!trip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('trip.api.error.not_found'),
      });
    }

    // Check if trip can be completed
    const screenState = getTripActions(trip);
    if (screenState.screen !== 'ongoing' || !screenState.canCompleteTrip) {
      throw new AppError({
        code: 'http:forbidden',
        entityType: 'trip',
        message: t('trip.api.error.cannot_complete'),
      });
    }

    await prisma.station.update({
      where: { id: trip.stations.at(-1)?.id },
      data: { status: StationStatus.COMPLETED },
    });

    const updatedTrip = await prisma.trip.update({
      where: { id: trip.id },
      data: { status: TripStatus.COMPLETED, endedAt: new Date() },
    });

    // Send rating notification to passengers
    sendTripCompletedRateNotifications(trip.id).catch(() => {
      // no-op
    });

    return ctx.json(updatedTrip);
  })
  .patch(
    '/:identifier/station/:stationId/status',
    ...TripRoutes.updateStationStatus,
    validator('json', updateStationStatusSchema),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { stationId, identifier } = ctx.req.param();
      const { status } = ctx.req.valid('json');

      const trip = await prisma.trip.findFirst({
        where: { OR: [{ slug: identifier }, { id: identifier }] },
        include: {
          stations: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!trip) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'trip',
          message: t('trip.api.error.not_found'),
        });
      }

      const stationIndex = trip.stations.findIndex((s) => s.id === stationId);
      if (stationIndex === -1) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'station',
          message: t('station.api.error.not_found'),
        });
      }

      const station = trip.stations[stationIndex];

      if (!station) {
        throw new AppError({
          code: 'system:unexpected',
          message: t('station.api.error.not_found'),
        });
      }
      const isTripOngoing = trip.status === TripStatus.ONGOING;

      // Validate the action using getStationActions
      const stationActions = getStationActions(station, trip.stations, stationIndex, isTripOngoing);

      // Check if the status change is allowed
      if (status === StationStatus.BOARDING && !stationActions.canMarkAsBoarding) {
        throw new AppError({
          code: 'http:forbidden',
          entityType: 'station',
          message: t('station.api.error.cannot_mark_as_boarding'),
        });
      }

      if (status === StationStatus.ACTIVE && !stationActions.canMarkAsActive) {
        // throw new AppError({
        //   code: 'http:forbidden',
        //   entityType: 'station',
        //   message: t('station.api.error.cannot_mark_as_active'),
        // });
      }

      if (status === StationStatus.COMPLETED && !stationActions.canMarkAsCompleted) {
        throw new AppError({
          code: 'http:forbidden',
          entityType: 'station',
          message: t('station.api.error.cannot_mark_as_completed'),
        });
      }

      const updatedStation = await prisma.station.update({
        data: { status },
        where: { id: stationId },
      });

      // Automation:
      // If completed -> Next station Boarding OR Trip Completed
      if (status === StationStatus.COMPLETED) {
        const nextStation = trip.stations[stationIndex + 1];

        if (nextStation) {
          // Move next station to BOARDING
          await prisma.station.update({
            data: { status: StationStatus.BOARDING },
            where: { id: nextStation.id },
          });
        } else {
          // No next station -> Trip is COMPLETED
          await prisma.trip.update({
            data: { status: TripStatus.COMPLETED, endedAt: new Date() },
            where: { id: trip.id },
          });

          // Send rating notification to passengers
          sendTripCompletedRateNotifications(trip.id).catch(() => {
            // no-op
          });
        }
      }

      // If Active -> Ensure Trip is ONGOING (idempotent usually)
      if (status === StationStatus.ACTIVE && trip.status !== TripStatus.ONGOING) {
        await prisma.trip.update({
          data: { status: TripStatus.ONGOING, startedAt: trip.startedAt ?? new Date() },
          where: { id: trip.id },
        });
      }

      return ctx.json(updatedStation);
    }
  );

export default tripHandler;
