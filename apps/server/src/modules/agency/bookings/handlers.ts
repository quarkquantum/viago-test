import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { listBookingsSchema, updateBookingSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency } from '@/lib/hono/context';
import { BookingsRoutes } from './routes';

const bookingHandler = new Hono<HonoEnv>()
  .get('/', ...BookingsRoutes.listBookings, validator('query', listBookingsSchema), async (ctx) => {
    const agency = getContextAgency();
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder } = query;

    const where: Prisma.BookingWhereInput = {
      agencyId: agency.id,
      ...(query.status && {
        status: query.status,
      }),
      ...(query.q && {
        OR: [
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
            trip: {
              name: {
                contains: query.q,
                mode: 'insensitive',
              },
            },
          },
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
            agency: {
              name: {
                contains: query.q,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        include: {
          agency: {
            select: {
              id: true,
              name: true,
            },
          },
          fromStation: {
            select: {
              departureTime: true,
              id: true,
              name: true,
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
              number: true,
            },
          },
          ticket: {
            select: {
              id: true,
              status: true,
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
              arrivalTime: true,
              departureTime: true,
              id: true,
              name: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
        where,
      }),
      prisma.booking.count({ where }),
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
  .get('/:identifier', ...BookingsRoutes.getBooking, async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();
    const { identifier } = ctx.req.param();
    const booking = await prisma.booking.findUnique({
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
        fromStation: true,
        passenger: {
          select: {
            email: true,
            fullName: true,
            id: true,
            profile: {
              select: {
                phoneNumber: true,
              },
            },
          },
        },
        seat: true,
        ticket: true,
        toStation: true,
        trip: {
          include: {
            bus: true,
            stations: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      where: { agencyId: agency.id, id: identifier },
    });

    if (!booking) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'booking',
        message: t('booking.api.error.not_found'),
      });
    }

    return ctx.json(
      {
        data: booking,
      },
      200
    );
  })
  .patch('/:identifier', ...BookingsRoutes.updateBooking, validator('json', updateBookingSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();

    const { identifier } = ctx.req.param();
    const updateData = ctx.req.valid('json');

    const existingBooking = await prisma.booking.findUnique({
      where: { agencyId: agency.id, id: identifier },
    });

    if (!existingBooking) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'booking',
        message: t('booking.api.error.not_found'),
      });
    }

    const updatedBooking = await prisma.booking.update({
      data: updateData,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
        fromStation: true,
        passenger: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
        seat: true,
        ticket: true,
        toStation: true,
        trip: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: { agencyId: agency.id, id: identifier },
    });

    return ctx.json(
      {
        data: updatedBooking,
        message: t('booking.api.success.updated'),
      },
      200
    );
  });

export default bookingHandler;
