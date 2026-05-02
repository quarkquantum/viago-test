import { useTranslation } from '@intlify/hono';
import { prisma } from '@repo/database';
import { TicketStatus } from '@repo/shared';
import { Hono } from 'hono';
import { AppError } from '@/errors';
import { getContextUser, type HonoEnv } from '@/lib/hono/context';
import { TicketRoutes } from './routes';

const ticketHandler = new Hono<HonoEnv>()
  .get('/:identifier', ...TicketRoutes.getTicket, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();

    // Try to find ticket by id, bookingId, or seatId
    const ticket = await prisma.ticket.findFirst({
      include: {
        booking: {
          include: {
            fromStation: {
              select: {
                departureTime: true,
                id: true,
                name: true,
                order: true,
                startingPrice: true,
              },
            },
            toStation: {
              select: {
                departureTime: true,
                id: true,
                name: true,
                order: true,
                startingPrice: true,
              },
            },
            trip: {
              select: {
                bus: {
                  include: {
                    agency: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
                description: true,
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        passenger: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
        seat: {
          include: {
            bus: {
              include: {
                agency: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        OR: [{ id: identifier }, { bookingId: identifier }, { seatId: identifier }, { key: identifier }],
      },
    });

    if (!ticket) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'ticket',
        message: t('ticket.api.error.not_found'),
      });
    }

    return ctx.json(ticket);
  })
  .post('/:key/scan', ...TicketRoutes.scan, async (ctx) => {
    const t = await useTranslation(ctx);
    const { key } = ctx.req.param();
    const tripId = ctx.req.query('tripId');
    const driver = getContextUser();

    const ticket = await prisma.ticket.findFirst({
      where: {
        key,
      },
      select: {
        id: true,
        bookingId: true,
        seatId: true,
        status: true,
        createdAt: true,
        booking: {
          select: {
            tripId: true,
            trip: {
              select: {
                driverId: true,
              },
            },
            fromStation: {
              select: {
                departureTime: true,
              },
            },
            createdAt: true,
            total: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'ticket',
        details: { reason: 'not_found' },
        message: t('ticket.api.error.not_found'),
      });
    }

    if (ticket.status === TicketStatus.EXPIRED) {
      throw new AppError({
        code: 'http:unprocessable_entity',
        entityType: 'ticket',
        details: { reason: 'expired' },
        message: t('ticket.api.error.invalid_ticket'),
      });
    }

    if (ticket.status !== TicketStatus.ISSUED) {
      throw new AppError({
        code: 'http:conflict',
        entityType: 'ticket',
        details: { reason: 'invalid_status', status: ticket.status },
        message: t('ticket.api.error.invalid_ticket'),
      });
    }

    if (ticket.booking.trip.driverId !== driver.id) {
      throw new AppError({
        code: 'http:forbidden',
        entityType: 'ticket',
        details: { reason: 'driver_mismatch' },
        message: t('ticket.api.error.forbidden'),
      });
    }

    if (tripId && ticket.booking.tripId !== tripId) {
      throw new AppError({
        code: 'http:forbidden',
        entityType: 'ticket',
        details: {
          reason: 'unassociated_trip',
          ticketTripId: ticket.booking.tripId,
          tripId,
        },
        message: t('ticket.api.error.forbidden'),
      });
    }

    if (new Date(ticket.booking.fromStation.departureTime) < new Date()) {
      await prisma.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          status: TicketStatus.EXPIRED,
        },
      });

      throw new AppError({
        code: 'http:unprocessable_entity',
        entityType: 'ticket',
        details: { reason: 'expired' },
        message: t('ticket.api.error.invalid_ticket'),
      });
    }

    await prisma.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        status: TicketStatus.CONSUMED,
      },
    });

    return ctx.json({
      message: t('ticket.api.success.scanned'),
    });
  });

export default ticketHandler;
