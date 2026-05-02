import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { BookingStatus, TicketStatus } from '@repo/shared/constants';
import { calculateRefund } from '@repo/shared/helpers';
import { createTicketSchema, getTicketsSchema, updateTicketSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency } from '@/lib/hono/context';
import { SeatAvailabilityService } from '@/modules/app/trip/services';
import { TicketRoutes } from './routes';

const ticketHandler = new Hono<HonoEnv>()
  .get('/', ...TicketRoutes.getTickets, validator('query', getTicketsSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const agency = getContextAgency();

    const where: Prisma.TicketWhereInput = {
      booking: {
        agencyId: agency.id,
        ...(query.q && {
          OR: [
            {
              fromStation: {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
            },
            {
              toStation: {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
            },
            {
              trip: {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
            },
            {
              trip: {
                bus: {
                  licensePlate: {
                    contains: query.q,
                    mode: 'insensitive',
                  },
                },
              },
            },
          ],
        }),
        ...(query.tripId && { tripId: query.tripId }),
      },
      passenger: {
        profile: {
          ...(query.q && {
            OR: [
              { firstName: { contains: query.q, mode: 'insensitive' } },
              { lastName: { contains: query.q, mode: 'insensitive' } },
            ],
          }),
        },
      },
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
    const { tripId, fromStationId, toStationId, seatId, passengerEmail, isPaid, passengerPhone, passengerFirstName, passengerLastName, locationId, passengerIdentityDocumentType, passengerIdentityDocumentNumber } = ctx.req.valid('json');

    const trip = await prisma.trip.findUnique({
      include: {
        bus: { select: { seatReservationType: true } },
        stations: { orderBy: { order: 'asc' } },
        agency: { select: { id: true } },
      },
      where: { id: tripId, status: { in: ['PENDING', 'ONGOING'] } },
    });

    if (!trip) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'trip',
        message: t('booking.api.error.not_found'),
        params: { resource: tripId },
      });
    }

    const agency = getContextAgency();
    if (trip.agency.id !== agency.id) {
      throw new AppError({
        code: 'http:forbidden',
        entityType: 'trip',
        message: t('booking.api.error.trip_not_in_agency'),
      });
    }

    const [fromStation, toStation] = await Promise.all([
      prisma.station.findUnique({ where: { id: fromStationId } }),
      prisma.station.findUnique({ where: { id: toStationId } }),
    ]);

    if (!fromStation || !toStation) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'station',
        message: t('booking.api.error.station_not_found'),
      });
    }

    if (fromStation.order >= toStation.order) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'station',
        message: t('booking.api.error.stations_not_ordered'),
      });
    }

    const availableSeats = await SeatAvailabilityService.getAvailableSeats(tripId, fromStation.order, toStation.order);
    let selectedSeat = seatId ? availableSeats.find((s) => s.id === seatId) : availableSeats[0];

    if (!selectedSeat) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'seat',
        message: t('booking.api.error.no_available_seats'),
      });
    }

    const stationsInPath = trip.stations.filter((s) => s.order >= fromStation.order && s.order < toStation.order);
    const total = stationsInPath.reduce((sum, s) => sum + s.startingPrice, 0);

    let passenger: { id: string; profile: { firstName: string | null; lastName: string | null } } | null = null;

    if (passengerEmail) {
      passenger = await prisma.user.findUnique({
        where: { email: passengerEmail },
        include: { profile: true },
      });
    }

    const fullName = `${passengerFirstName || ''} ${passengerLastName || ''}`.trim() || 'Unknown Passenger';
    const userEmail = passengerEmail || `${fullName.toLowerCase().replace(/\s+/g, '.')}-${Date.now()}@viago.com`;

    if (!passenger) {
      passenger = await prisma.user.create({
        data: {
          email: userEmail,
          fullName,
          role: 'PASSENGER',
          profile: {
            create: {
              firstName: passengerFirstName || '',
              lastName: passengerLastName || '',
              phoneNumber: passengerPhone || '',
              identityDocumentType: passengerIdentityDocumentType || null,
              identityDocumentNumber: passengerIdentityDocumentNumber || null,
            },
          },
        },
        include: { profile: true },
      });
    } else if (passengerFirstName || passengerLastName || passengerPhone || passengerIdentityDocumentType || passengerIdentityDocumentNumber) {
      await prisma.profile.update({
        where: { userId: passenger.id },
        data: {
          ...(passengerFirstName && { firstName: passengerFirstName }),
          ...(passengerLastName && { lastName: passengerLastName }),
          ...(passengerPhone && { phoneNumber: passengerPhone }),
          ...(passengerIdentityDocumentType && { identityDocumentType: passengerIdentityDocumentType }),
          ...(passengerIdentityDocumentNumber && { identityDocumentNumber: passengerIdentityDocumentNumber }),
        },
      });
    }

    const ticketStatus = isPaid ? TicketStatus.ISSUED : TicketStatus.RESERVED;
    const bookingStatus = isPaid ? BookingStatus.CONFIRMED : BookingStatus.PENDING;

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          agencyId: agency.id,
          fromStationId,
          toStationId,
          seatId: selectedSeat!.id,
          passengerId: passenger!.id,
          tripId,
          status: bookingStatus,
          total,
          ...(locationId && { locationId }),
        },
      });

      const ticket = await tx.ticket.create({
        data: {
          bookingId: booking.id,
          passengerId: passenger!.id,
          seatId: selectedSeat!.id,
          status: ticketStatus,
          key: crypto.randomUUID(),
        },
        include: {
          booking: { include: { fromStation: true, toStation: true, trip: true } },
          passenger: { include: { profile: true } },
          seat: true,
        },
      });

      return ticket;
    });

    return ctx.json({
      data: result,
      message: isPaid ? t('ticket.api.success.sold') : t('ticket.api.success.reserved'),
    }, 201);
  })
  .post('/:id/pay', ...TicketRoutes.payTicket, async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!ticket) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'ticket',
        message: t('ticket.api.error.not_found'),
        params: { resource: id },
      });
    }

    if (ticket.status !== TicketStatus.RESERVED) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'ticket',
        message: t('ticket.api.error.not_reserved'),
      });
    }

    const updatedTicket = await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        data: { status: BookingStatus.CONFIRMED },
        where: { id: ticket.bookingId },
      });

      return await tx.ticket.update({
        data: { status: TicketStatus.ISSUED },
        where: { id },
        include: {
          booking: { include: { fromStation: true, toStation: true, trip: true } },
          passenger: { include: { profile: true } },
          seat: true,
        },
      });
    });

    return ctx.json({
      data: updatedTicket,
      message: t('ticket.api.success.paid'),
    }, 200);
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
  .patch('/:id', ...TicketRoutes.updateTicket, validator('json', updateTicketSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();
    const body = ctx.req.valid('json');

    const ticket = await prisma.ticket.findUnique({
      include: {
        booking: {
          include: {
            fromStation: { select: { order: true } },
            toStation: { select: { order: true } },
            trip: { select: { id: true, stations: { select: { id: true, name: true, order: true, startingPrice: true } } } },
          },
        },
      },
      where: { id },
    });

    if (!ticket) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'ticket',
        message: t('ticket.api.error.not_found'),
        params: { resource: id },
      });
    }

    if (ticket.status !== TicketStatus.ISSUED) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'ticket',
        message: t('ticket.api.error.update_failed'),
      });
    }

    const tripId = ticket.booking.trip.id;
    const allStations = ticket.booking.trip.stations;

    const fromStationId = body.fromStationId ?? ticket.booking.fromStationId;
    const toStationId = body.toStationId ?? ticket.booking.toStationId;
    const seatId = body.seatId ?? ticket.booking.seatId;

    const fromStation = allStations.find((s) => s.id === fromStationId);
    const toStation = allStations.find((s) => s.id === toStationId);

    if (!fromStation || !toStation) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'station',
        message: t('ticket.api.error.from_station_not_found'),
      });
    }

    if (fromStation.order >= toStation.order) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'station',
        message: t('booking.api.error.stations_not_ordered'),
      });
    }

    // Check new seat availability by temporarily freeing the current booking
    if (seatId !== ticket.booking.seatId || fromStationId !== ticket.booking.fromStationId || toStationId !== ticket.booking.toStationId) {
      const available = await prisma.$transaction(async (tx) => {
        await tx.booking.update({ data: { status: BookingStatus.DELETED }, where: { id: ticket.bookingId } });
        return SeatAvailabilityService.isSeatAvailable(tripId, seatId, fromStation.order, toStation.order);
      });

      if (!available) {
        // Restore booking status
        await prisma.booking.update({ data: { status: BookingStatus.CONFIRMED }, where: { id: ticket.bookingId } });
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'seat',
          message: t('ticket.api.error.seat_not_available'),
        });
      }
    }

    // Recalculate total
    const stationsInPath = allStations.filter((s) => s.order >= fromStation.order && s.order < toStation.order);
    const total = stationsInPath.reduce((sum, s) => sum + s.startingPrice, 0);

    // Resolve new passenger if email provided
    let passengerId = ticket.passengerId;
    if (body.passengerEmail) {
      const passenger = await prisma.user.findUnique({ where: { email: body.passengerEmail } });
      if (!passenger) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'passenger',
          message: t('ticket.api.error.passenger_not_found'),
          params: { resource: body.passengerEmail },
        });
      }
      passengerId = passenger.id;
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        data: { fromStationId, toStationId, seatId, total, status: BookingStatus.CONFIRMED },
        where: { id: ticket.bookingId },
      });
      await tx.ticket.update({
        data: { passengerId, seatId },
        where: { id },
      });
    });

    return ctx.json({ message: t('ticket.api.success.updated') }, 200);
  })
  .post('/:id/cancel', ...TicketRoutes.cancelTicket, async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();

    const ticket = await prisma.ticket.findUnique({
      select: { bookingId: true, id: true, status: true },
      where: { id },
    });

    if (!ticket) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'ticket',
        message: t('ticket.api.error.not_found'),
        params: { resource: id },
      });
    }

    if (ticket.status !== TicketStatus.ISSUED && ticket.status !== TicketStatus.RESERVED) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'ticket',
        message: t('ticket.api.error.cannot_cancel'),
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        data: { status: TicketStatus.CANCELLED },
        where: { id },
      });
      await tx.booking.update({
        data: { status: BookingStatus.DELETED },
        where: { id: ticket.bookingId },
      });
    });

    return ctx.json({ message: t('ticket.api.success.cancelled') }, 200);
  })
  .post('/:id/refund', ...TicketRoutes.refundTicket, async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();

    const ticket = await prisma.ticket.findUnique({
      include: {
        booking: {
          include: {
            fromStation: {
              select: { departureTime: true },
            },
          },
        },
      },
      where: { id },
    });

    if (!ticket) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'ticket',
        message: t('ticket.api.error.not_found'),
        params: { resource: id },
      });
    }

    if (ticket.status !== TicketStatus.ISSUED) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'ticket',
        message: t('ticket.api.error.cannot_refund'),
      });
    }

    const { refundable, refundableAmount, percentage } = calculateRefund({
      amount: ticket.booking.total,
      departureTime: ticket.booking.fromStation.departureTime,
    });

    if (!refundable) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'ticket',
        message: t('ticket.api.error.refund_too_late'),
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        data: { status: TicketStatus.REFUNDED },
        where: { id },
      });
      await tx.booking.update({
        data: { status: BookingStatus.DELETED },
        where: { id: ticket.bookingId },
      });
    });

    return ctx.json(
      {
        data: { percentage, refundableAmount },
        message: t('ticket.api.success.refunded'),
      },
      200
    );
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

    return ctx.json(
      {
        message: t('ticket.api.success.deleted'),
      },
      200
    );
  });

export default ticketHandler;
