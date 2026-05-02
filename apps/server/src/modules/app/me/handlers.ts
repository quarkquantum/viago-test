import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { listMyTicketsSchema, updateUserFcmTokenSchema, updateUserSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextUser } from '@/lib/hono/context';
import { UserRoutes } from './routes';

const userHandler = new Hono<HonoEnv>()
  .get('/', ...UserRoutes.user, async (ctx) => {
    const user = getContextUser();

    const data = await prisma.user.findUnique({
      select: {
        createdAt: true,
        email: true,
        emailVerified: true,
        fullName: true,
        profile: true,
        role: true,
        sessions: true,
      },
      where: {
        id: user.id,
      },
    });

    return ctx.json({ data }, 200);
  })
  .patch('/', ...UserRoutes.user, validator('json', updateUserSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const user = getContextUser();
    const updateData = ctx.req.valid('json');

    await prisma.profile.update({
      data: updateData,
      where: { userId: user.id },
    });

    return ctx.json(
      {
        message: t('me.api.success.updated'),
        success: true,
      },
      200
    );
  })
  .get('/tickets', ...UserRoutes.listTickets, validator('query', listMyTicketsSchema), async (ctx) => {
    const user = getContextUser();
    const query = ctx.req.valid('query');
    const { status, sortOrder, sortBy } = query;
    const { skip, take } = getPagination(query);

    const where: Prisma.TicketWhereInput = {
      passengerId: user.id,
      ...(status && {
        status,
      }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.ticket.findMany({
        include: {
          booking: {
            include: {
              fromStation: true,
              toStation: true,
            },
          },
          seat: {
            include: {
              bus: {
                include: {
                  agency: {
                    select: {
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take,
        where,
      }),
      prisma.ticket.count({ where }),
    ]);

    const pagination = getPaginationMeta({
      limit: query.limit,
      page: query.page,
      total,
    });

    return ctx.json({ data, pagination }, 200);
  })
  .patch('/fcm-token', ...UserRoutes.updateFcmToken, validator('json', updateUserFcmTokenSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const user = getContextUser();
    const { token } = ctx.req.valid('json');

    await prisma.user.update({
      data: { fcmToken: token },
      where: { id: user.id },
    });

    return ctx.json({ message: t('me.api.success.updated'), success: true }, 200);
  })
  .get('/tickets/:identifier', ...UserRoutes.getTicket, async (ctx) => {
    const user = getContextUser();
    const { identifier } = ctx.req.param();

    const ticket = await prisma.ticket.findFirst({
      include: {
        booking: {
          include: {
            fromStation: true,
            toStation: true,
          },
        },
        seat: {
          include: {
            bus: {
              include: {
                agency: {
                  select: {
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
        id: identifier,
        passengerId: user.id,
      },
    });

    if (!ticket) {
      throw new AppError({
        code: 'http:not_found',
      });
    }

    return ctx.json({ data: ticket }, 200);
  });

export default userHandler;
