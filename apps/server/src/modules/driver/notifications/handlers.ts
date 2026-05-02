import { type Prisma, prisma } from '@repo/database';
import { NotificationStatus } from '@repo/shared';
import { baseQuerySchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextUser } from '@/lib/hono/context';
import NotificationsRoutes from './routes';

const notificationsHandler = new Hono<HonoEnv>().get(
  '/',
  ...NotificationsRoutes.listNotifications,
  validator('query', baseQuerySchema),
  async (ctx) => {
    const user = getContextUser();
    const { limit, page, sortBy, sortOrder } = ctx.req.valid('query');

    const { skip, take } = getPagination({ limit, page });

    const where: Prisma.NotificationWhereInput = {
      recipientId: user.id,
    };

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        select: {
          createdAt: true,
          domain: true,
          entityId: true,
          entityType: true,
          id: true,
          payload: true,
          readAt: true,
          status: true,
          type: true,
          actorAgency: {
            select: {
              name: true,
              logo: true,
            },
          },
        },
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.notification.count({ where }),
    ]);

    const pagination = getPaginationMeta({ limit, page, total });

    // Mark notifications as read
    await prisma.notification.updateMany({
      where: {
        recipientId: user.id,
        status: NotificationStatus.UNREAD,
        id: {
          in: data.map((n) => n.id),
        },
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    return ctx.json({ data, pagination });
  }
);

export default notificationsHandler;
