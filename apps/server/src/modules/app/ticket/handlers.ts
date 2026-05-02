import { prisma } from '@repo/database';
import { BookingStatus, TicketStatus } from '@repo/shared/constants';
import { guestTicketLookupSchema, refundTicketSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextUser } from '@/lib/hono/context';
import { TicketRoutes } from './routes';

const ticketHandler = new Hono<HonoEnv>()
  .get('/lookup', ...TicketRoutes.lookupTickets, validator('query', guestTicketLookupSchema), async (ctx) => {
    const { identifier } = ctx.req.valid('query');

    const tickets = await prisma.ticket.findMany({
      include: {
        booking: {
          include: {
            fromStation: {
              select: { departureTime: true, id: true, name: true },
            },
            toStation: {
              select: { departureTime: true, id: true, name: true },
            },
            trip: {
              select: { id: true, name: true, status: true },
            },
          },
        },
        seat: {
          include: {
            bus: {
              include: {
                agency: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      where: {
        passenger: {
          OR: [{ email: { equals: identifier, mode: 'insensitive' } }, { profile: { phoneNumber: identifier } }],
        },
      },
    });

    return ctx.json({ data: tickets }, 200);
  })
  .get('/:identifier', ...TicketRoutes.getTicketByIdentifier, async (ctx) => {
    try {
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
          OR: [{ id: identifier }, { bookingId: identifier }, { seatId: identifier }],
        },
      });

      if (!ticket) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'ticket',
          message: t('ticket.api.error.not_found'),
        });
      }

      return ctx.json(
        {
          data: ticket,
        },
        200
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const t2 = await useTranslation(ctx);
      throw new AppError({
        cause: error,
        code: 'http:internal_server_error',
        context: {
          method: ctx.req.method,
          path: ctx.req.path,
        },
        entityType: 'ticket',
        message: t2('ticket.api.error.retrieve_details_failed'),
      });
    }
  })
  .post('/:id/refund', ...TicketRoutes.refundTicket, validator('json', refundTicketSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { id } = ctx.req.param();
    const user = getContextUser();
    const _reason = ctx.req.valid('json').reason;

    // Find ticket with all necessary relations
    const ticket = await prisma.ticket.findUnique({
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
            trip: {
              select: {
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
          select: {
            id: true,
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

    // Check if ticket belongs to the user
    if (ticket.passengerId !== user.id) {
      throw new AppError({
        code: 'http:forbidden',
        entityType: 'ticket',
        message: t('ticket.api.error.unauthorized'),
      });
    }

    // Check if ticket can be refunded (status must be ISSUED)
    if (ticket.status !== TicketStatus.ISSUED) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'ticket',
        message: t('ticket.api.error.cannot_refund'),
      });
    }

    // Check timing: must be at least 2 hours before departure
    const departureTime = ticket.booking.fromStation.departureTime;
    const now = new Date();
    const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 2) {
      throw new AppError({
        code: 'http:bad_request',
        entityType: 'ticket',
        message: t('ticket.api.error.refund_too_late'),
      });
    }

    // Perform refund transaction
    const refundedTicket = await prisma.$transaction(async (tx) => {
      // Update ticket status to REFUNDED
      const updatedTicket = await tx.ticket.update({
        data: {
          status: TicketStatus.REFUNDED,
        },
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
        where: { id },
      });

      // Update booking status to DELETED — seat availability is computed dynamically
      await tx.booking.update({
        data: {
          status: BookingStatus.DELETED,
        },
        where: { id: ticket.bookingId },
      });

      return updatedTicket;
    });

    return ctx.json(
      {
        data: refundedTicket,
        message: t('ticket.api.success.refunded'),
      },
      200
    );
  });

export default ticketHandler;
