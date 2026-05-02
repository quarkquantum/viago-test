import { auth } from '@repo/auth/admin/server';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { SystemRoles } from '@repo/shared';
import { baseQuerySchema, createPassengerSchema, listPassengersSchema, updateUserSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { PassengerRoutes } from './routes';

const passengerHandler = new Hono<HonoEnv>()
  .get(
    '/',
    ...PassengerRoutes.listPassengers,
    validator(
      'query',
      listPassengersSchema.extend({
        emailVerified: z.enum(['true', 'false']).optional(),
      })
    ),
    async (ctx) => {
      const query = ctx.req.valid('query');
      const { skip, take } = getPagination(query);

      const where: Prisma.UserWhereInput = {
        role: 'USER',
        ...(query.emailVerified && { emailVerified: query.emailVerified === 'true' }),
        ...(query.q && {
          OR: [
            {
              fullName: {
                contains: query.q,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: query.q,
                mode: 'insensitive',
              },
            },
            {
              profile: {
                phoneNumber: {
                  contains: query.q,
                },
              },
            },
          ],
        }),
      };

      const [data, total] = await Promise.all([
        prisma.user.findMany({
          include: {
            profile: true,
            tickets: {
              include: {
                booking: {
                  include: {
                    fromStation: true,
                    toStation: true,
                    trip: true,
                  },
                },
                seat: true,
              },
            },
          },
          orderBy: { [query.sortBy]: query.sortOrder },
          skip,
          take,
          where,
        }),
        prisma.user.count({ where }),
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
    }
  )
  .post('/', ...PassengerRoutes.createPassenger, validator('json', createPassengerSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { email, firstName, lastName, phoneNumber } = ctx.req.valid('json');
    const password = nanoid(12);

    const result = await auth.api.createUser({
      body: {
        email,
        name: `${firstName} ${lastName}`,
        password,
      },
    });

    const user = result?.user;

    if (!user) {
      throw new AppError({
        code: 'database:query_error',
        message: t('passenger.api.error.create_failed'),
      });
    }

    const passenger = await prisma.user.update({
      data: {
        emailVerified: true,
        role: SystemRoles.USER,
        profile: {
          update: {
            firstName,
            lastName,
            phoneNumber,
          },
        },
      },
      where: { id: user.id },
    });

    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${ctx.req.header('origin')}/reset-password`,
      },
      headers: ctx.req.header(),
    });

    return ctx.json({ data: passenger, message: t('passenger.api.success.created') }, 201);
  })

  .get('/:identifier', ...PassengerRoutes.getPassenger, validator('query', baseQuerySchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const query = ctx.req.valid('query');
    const { page, limit } = query;
    const { skip, take } = getPagination(query);

    const user = await prisma.user.findUnique({
      include: {
        _count: {
          select: {
            tickets: true,
          },
        },
        profile: true,
        tickets: {
          include: {
            booking: {
              include: {
                fromStation: true,
                toStation: true,
                trip: {
                  include: {
                    bus: true,
                  },
                },
              },
            },
            seat: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        },
      },
      where: { id: identifier },
    });
    if (!user) {
      throw new AppError({
        code: 'database:query_error',
        message: t('passenger.api.error.not_found'),
      });
    }
    return ctx.json({
      data: {
        user,
        tickets: user.tickets,
      },
      pagination: getPaginationMeta({
        limit,
        page,
        total: user._count.tickets,
      }),
    });
  })
  .patch('/:identifier', ...PassengerRoutes.updatePassenger, validator('json', updateUserSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const { firstName, lastName, phoneNumber, email } = ctx.req.valid('json');

    const user = await prisma.user.findUnique({
      include: { profile: true },
      where: { id: identifier },
    });

    if (!user) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'passenger',
        message: t('passenger.api.error.not_found'),
      });
    }

    const newFirstName = firstName ?? user.profile?.firstName ?? '';
    const newLastName = lastName ?? user.profile?.lastName ?? '';
    const fullName = `${newFirstName} ${newLastName}`.trim();

    const updated = await prisma.user.update({
      data: {
        email,
        fullName,
        profile: {
          update: {
            firstName,
            lastName,
            phoneNumber,
          },
        },
      },
      include: {
        profile: true,
      },
      where: { id: identifier },
    });

    return ctx.json(updated);
  })
  .delete('/:identifier', ...PassengerRoutes.deletePassenger, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const user = await prisma.user.findUnique({
      where: { id: identifier },
    });

    if (!user) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'passenger',
        message: t('passenger.api.error.not_found'),
      });
    }

    await prisma.user.delete({
      where: { id: identifier },
    });

    return ctx.json({ message: t('passenger.api.success.deleted') });
  });

export default passengerHandler;
