import { useTranslation } from '@intlify/hono';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { BookingStatus, BusSeatPolicy, SeatType, TicketStatus, TripStatus } from '@repo/shared/constants';
import { createTicketSchema, getTicketsSchema, updateTicketSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextUser } from '@/lib/hono/context';
import { SeatAvailabilityService } from '@/modules/app/trip/services';
import { TicketRoutes } from './routes';

const ticketHandler = new Hono<HonoEnv>()
  .get('/', ...TicketRoutes.getTickets, validator('query', getTicketsSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    console.log(query.status);
    const where: Prisma.TicketWhereInput = {
      ...(query.q && {
        OR: [
          {
            booking: {
              trip: {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            passenger: {
              fullName: {
                contains: query.q,
                mode: 'insensitive',
              },
            },
          },
          {
            passenger: {
              email: {
                contains: query.q,
                mode: 'insensitive',
              },
            },
          },
          {
            passenger: {
              profile: {
                phoneNumber: {
                  contains: query.q,
                },
              },
            },
          },
          {
            booking: {
              trip: {
                bus: {
                  licensePlate: {
                    contains: query.q,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        ],
      }),
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      prisma.ticket.findMany({
        include: {
          booking: {
            include: {
              agency: true,
              fromStation: true,
              toStation: true,
              trip: true,
            },
          },
          passenger: {
            include: {
              profile: true,
            },
          },
          seat: true,
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take,
        where,
      }),
      prisma.ticket.count({ where }),
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
  .post('/', ...TicketRoutes.createTicket, validator('json', createTicketSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { passengerEmail, fromStationId, toStationId, tripId, seatId: requestedSeatId } = ctx.req.valid('json');

    const passenger = await prisma.user.findUnique({
      where: {
        email: passengerEmail,
      },
    });

    if (!passenger) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'passenger',
        message: t('ticket.api.error.passenger_not_found'),
        params: { resource: passengerEmail },
      });
    }

    const fromStation = await prisma.station.findUnique({
      where: {
        id: fromStationId,
      },
    });

    if (!fromStation) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'station',
        message: t('ticket.api.error.from_station_not_found', { resource: fromStationId }),
        params: { resource: fromStationId },
      });
    }

    const toStation = await prisma.station.findUnique({
      where: {
        id: toStationId,
      },
    });

    if (!toStation) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'station',
        message: t('ticket.api.error.to_station_not_found', { resource: toStationId }),
        params: { resource: toStationId },
      });
    }

    const trip = await prisma.trip.findUnique({
      include: {
        bus: {
          select: { seatReservationType: true },
        },
        stations: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('error.not_found', { resource: t('resource.trip') }),
        params: { resource: tripId },
      });
    }

    if (trip.status === TripStatus.DELETED || trip.status === TripStatus.COMPLETED) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'trip',
        message:
          trip.status === TripStatus.DELETED
            ? t('ticket.api.error.trip_deleted')
            : t('ticket.api.error.trip_completed'),
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
        code: 'http:bad_request',
        entityType: 'station',
        message: t('booking.api.error.stations_not_ordered'),
        params: { resource: tripId },
      });
    }

    const isNumbered = trip.bus.seatReservationType === BusSeatPolicy.NUMBERED;

    // NUMBERED: passenger must pick a specific seat
    // UNNUMBERED: always auto-assign, ignore any provided seatId
    let seatId: string;
    if (isNumbered && requestedSeatId) {
      const seat = await prisma.seat.findUnique({
        where: { id: requestedSeatId },
      });

      if (!seat) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'seat',
          message: t('ticket.api.error.seat_not_found'),
          params: { resource: requestedSeatId },
        });
      }

      if (seat.type === SeatType.DRIVER) {
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'seat',
          message: t('ticket.api.error.seat_not_available'),
          params: { resource: requestedSeatId },
        });
      }

      const available = await SeatAvailabilityService.isSeatAvailable(
        tripId,
        requestedSeatId,
        fromStation.order,
        toStation.order
      );
      if (!available) {
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'seat',
          message: t('ticket.api.error.seat_not_available'),
          params: { resource: requestedSeatId },
        });
      }

      seatId = requestedSeatId;
    } else if (isNumbered && !requestedSeatId) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'seat',
        message: t('ticket.api.error.seat_required_for_numbered_bus'),
      });
    } else {
      // UNNUMBERED: auto-assign first available seat
      const availableSeats = await SeatAvailabilityService.getAvailableSeats(
        tripId,
        fromStation.order,
        toStation.order
      );
      if (availableSeats.length === 0) {
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'seat',
          message: t('ticket.api.error.seat_not_available'),
        });
      }
      seatId = availableSeats[0]?.id ?? '';
    }

    const agency = await prisma.agency.findFirst({
      where: {
        trips: {
          some: {
            id: tripId,
          },
        },
      },
    });

    // Filter stations between fromStation and toStation
    const stationsInPath = trip.stations.filter((s) => s.order >= fromStation.order && s.order < toStation.order);

    // Calculate total
    const total = stationsInPath.reduce((sum, s) => sum + s.startingPrice, 0);

    const [booking, ticket] = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          agencyId: agency?.id || '',
          fromStationId,
          passengerId: passenger.id,
          seatId,
          status: BookingStatus.CONFIRMED,
          toStationId,
          total,
          tripId,
        },
      });

      const newTicket = await tx.ticket.create({
        data: {
          booking: {
            connect: { id: newBooking.id },
          },
          passenger: {
            connect: { id: passenger.id },
          },
          seat: {
            connect: { id: seatId },
          },
          status: TicketStatus.ISSUED,
          key: crypto.randomUUID(),
        },
      });

      return [newBooking, newTicket];
    });

    return ctx.json(
      {
        data: {
          booking,
          ticket,
        },
        message: t('ticket.api.success.created'),
      },
      201
    );
  })
  .get('/history', ...TicketRoutes.getTickets, validator('query', getTicketsSchema), async (ctx) => {
    const _user = getContextUser();
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const where: Prisma.TicketWhereInput = {
      ...(query.q && {
        OR: [
          {
            booking: {
              fromStation: {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            booking: {
              toStation: {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            passenger: {
              profile: {
                OR: [
                  { firstName: { contains: query.q, mode: 'insensitive' } },
                  { lastName: { contains: query.q, mode: 'insensitive' } },
                ],
              },
            },
          },
          {
            booking: {
              trip: {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      }),
      ...(query.tripId && { booking: { tripId: query.tripId } }),
      ...(query.status && { booking: { status: query.status } }),
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      prisma.ticket.findMany({
        include: {
          booking: {
            include: {
              agency: true,
              fromStation: true,
              toStation: true,
              trip: true,
            },
          },
          passenger: {
            include: {
              profile: true,
            },
          },
          seat: true,
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take,
        where,
      }),
      prisma.ticket.count({ where }),
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
  .get('/:identifier', ...TicketRoutes.getTicket, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();

    const ticket = await prisma.ticket.findUnique({
      include: {
        booking: {
          include: {
            agency: true,
            fromStation: true,
            toStation: true,
            trip: {
              include: {
                bus: true,
                stations: {
                  orderBy: {
                    order: 'asc',
                  },
                },
                driver: {
                  include: {
                    user: {
                      include: {
                        profile: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        passenger: {
          include: {
            profile: true,
          },
        },
        seat: true,
      },
      where: {
        id: identifier,
      },
    });

    if (!ticket) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'ticket',
        message: t('ticket.api.error.not_found'),
        params: { resource: identifier },
      });
    }

    return ctx.json(
      {
        data: ticket,
        message: t('ticket.api.success.fetched'),
      },
      200
    );
  })
  .patch('/:identifier', ...TicketRoutes.updateTicket, validator('json', updateTicketSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const { status, seatId, fromStationId, toStationId } = ctx.req.valid('json');

    const ticket = await prisma.ticket.findUnique({
      include: {
        booking: {
          include: {
            trip: {
              include: {
                stations: {
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
            },
          },
        },
      },
      where: {
        id: identifier,
      },
    });

    if (!ticket) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'ticket',
        message: t('ticket.api.error.not_found'),
        params: { resource: identifier },
      });
    }

    // Validate station changes if provided
    if (fromStationId || toStationId) {
      const newFromStationId = fromStationId || ticket.booking.fromStationId;
      const newToStationId = toStationId || ticket.booking.toStationId;

      const fromStation = await prisma.station.findUnique({
        where: { id: newFromStationId },
      });

      const toStation = await prisma.station.findUnique({
        where: { id: newToStationId },
      });

      if (!(fromStation && toStation)) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'station',
          message: t('ticket.api.error.station_not_found'),
        });
      }

      if (fromStation.tripId !== ticket.booking.tripId || toStation.tripId !== ticket.booking.tripId) {
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'station',
          message: t('booking.api.error.station_not_belong_to_trip'),
        });
      }

      if (fromStation.order >= toStation.order) {
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'station',
          message: t('booking.api.error.stations_not_ordered'),
        });
      }
    }

    // Validate seat change if provided
    if (seatId && seatId !== ticket.seatId) {
      const newSeat = await prisma.seat.findUnique({
        where: { id: seatId },
      });

      if (!newSeat) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'seat',
          message: t('ticket.api.error.seat_not_found'),
        });
      }

      if (newSeat.type === SeatType.DRIVER) {
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'seat',
          message: t('ticket.api.error.seat_not_available'),
        });
      }

      // Determine the segment to check availability against (use updated stations if provided)
      const checkFromStationId = fromStationId || ticket.booking.fromStationId;
      const checkToStationId = toStationId || ticket.booking.toStationId;
      const checkFromStation = ticket.booking.trip.stations.find((s) => s.id === checkFromStationId);
      const checkToStation = ticket.booking.trip.stations.find((s) => s.id === checkToStationId);

      if (checkFromStation && checkToStation) {
        const available = await SeatAvailabilityService.isSeatAvailable(
          ticket.booking.tripId,
          seatId,
          checkFromStation.order,
          checkToStation.order
        );
        if (!available) {
          throw new AppError({
            code: 'http:bad_request',
            entityType: 'seat',
            message: t('ticket.api.error.seat_not_available'),
          });
        }
      }
    }

    // Update ticket and booking in a transaction
    const updatedTicket = await prisma.$transaction(async (tx) => {
      // Calculate new total if stations changed
      let newTotal = ticket.booking.total;
      if (fromStationId || toStationId) {
        const newFromStationId = fromStationId || ticket.booking.fromStationId;
        const newToStationId = toStationId || ticket.booking.toStationId;

        const fromStation = await tx.station.findUnique({
          where: { id: newFromStationId },
        });

        const toStation = await tx.station.findUnique({
          where: { id: newToStationId },
        });

        if (fromStation && toStation) {
          const stationsInPath = ticket.booking.trip.stations.filter(
            (s) => s.order >= fromStation.order && s.order < toStation.order
          );
          newTotal = stationsInPath.reduce((sum, s) => sum + s.startingPrice, 0);
        }
      }

      // Update booking
      await tx.booking.update({
        data: {
          ...(fromStationId && { fromStationId }),
          ...(toStationId && { toStationId }),
          ...(seatId && { seatId }),
          ...(fromStationId || toStationId ? { total: newTotal } : {}),
        },
        where: {
          id: ticket.bookingId,
        },
      });

      // Update ticket
      return await tx.ticket.update({
        data: {
          ...(status && { status }),
          ...(seatId && { seatId }),
        },
        include: {
          booking: {
            include: {
              agency: true,
              fromStation: true,
              toStation: true,
              trip: true,
            },
          },
          passenger: {
            include: {
              profile: true,
            },
          },
          seat: true,
        },
        where: {
          id: identifier,
        },
      });
    });

    return ctx.json({
      data: updatedTicket,
    });
  })
  .delete('/:identifier', ...TicketRoutes.deleteTicket, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();

    const ticket = await prisma.ticket.findUnique({
      include: {
        booking: true,
        seat: true,
      },
      where: {
        id: identifier,
      },
    });

    if (!ticket) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'ticket',
        message: t('ticket.api.error.not_found'),
        params: { resource: identifier },
      });
    }

    // Delete booking (cascades to ticket) — seat availability is computed dynamically
    if (ticket.bookingId) {
      await prisma.booking.delete({
        where: { id: ticket.bookingId },
      });
    }

    return ctx.json({
      message: t('ticket.api.success.deleted'),
    });
  });

export default ticketHandler;
