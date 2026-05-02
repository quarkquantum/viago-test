import { auth } from '@repo/auth/admin/server';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { SystemRoles } from '@repo/shared';
import {
  banUserSchema,
  createUserSchema,
  getUserSchema,
  listUsersSchema,
  setPasswordSchema,
  updateUserSchema,
} from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { nanoid } from 'nanoid';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { UserRoutes } from '@/modules/admin/users/routes';

const userHandler = new Hono<HonoEnv>()
  .get('/', ...UserRoutes.listUsers, validator('query', listUsersSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const where: Prisma.UserWhereInput = {
      ...(query.banned && { banned: query.banned === 'true' }),
      role: query.role ?? {
        in: [SystemRoles.CASHIER, SystemRoles.DRIVER, SystemRoles.AGENCY, SystemRoles.USER],
      },
      ...(query.q && {
        OR: [
          {
            email: {
              contains: query.q,
              mode: 'insensitive',
            },
          },
          {
            fullName: {
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
          {
            profile: {
              OR: [
                { firstName: { contains: query.q, mode: 'insensitive' } },
                { lastName: { contains: query.q, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        include: {
          agencies: true,
          agencyMemberships: {
            include: {
              agency: true,
              role: true,
            },
          },
          bookings: true,
          profile: true,
          tickets: true,
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
  })

  .post('/', ...UserRoutes.createUser, validator('json', createUserSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { email, firstName, lastName, phoneNumber, role } = ctx.req.valid('json');

    const response = await auth.api.createUser({
      body: {
        email,
        name: `${firstName} ${lastName}`,
        password: nanoid(12),
      },
      headers: ctx.req.raw.headers,
    });

    if (!response || (typeof response === 'object' && 'error' in response)) {
      throw new AppError({
        code: 'database:query_error',
        message: t('user.api.error.create_failed'),
      });
    }

    const user = response.user;

    const updatedUser = await prisma.user.update({
      data: {
        emailVerified: true,
        profile: {
          update: {
            firstName,
            lastName,
            phoneNumber,
          },
        },
        role,
      },
      include: {
        profile: true,
      },
      where: { id: user.id },
    });

    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${ctx.req.header('origin')}/reset-password`,
      },
      headers: ctx.req.raw.headers,
    });

    return ctx.json({ data: updatedUser, message: t('user.api.success.created') }, 201);
  })
  .put('/:identifier/ban', ...UserRoutes.banUser, validator('json', banUserSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const { banExpires, banReason } = ctx.req.valid('json');
    const response = await auth.api.banUser({
      body: {
        userId: identifier,
        banReason: banReason || 'Banned by admin',
        banExpiresIn: banExpires,
      },
      headers: ctx.req.raw.headers,
    });

    if (!response || (typeof response === 'object' && 'error' in response)) {
      throw new AppError({
        code: 'database:query_error',
        message: t('user.api.error.ban_failed'),
      });
    }

    return ctx.json(response, 200);
  })
  .put('/:identifier/unban', ...UserRoutes.unbanUser, async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const response = await auth.api.unbanUser({
      body: {
        userId: identifier,
      },
      headers: ctx.req.raw.headers,
    });

    if (!response || (typeof response === 'object' && 'error' in response)) {
      throw new AppError({
        code: 'database:query_error',
        message: t('user.api.error.unban_failed'),
      });
    }

    return ctx.json(response, 200);
  })
  .post('/:identifier/send-reset-password', ...UserRoutes.sendResetPasswordEmail, async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const user = await prisma.user.findUnique({
      where: { id: identifier },
    });

    if (!user) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('user.api.error.not_found'),
      });
    }

    await auth.api.requestPasswordReset({
      body: {
        email: user.email,
        redirectTo: `${ctx.req.header('origin')}/reset-password`,
      },
      headers: ctx.req.raw.headers,
    });

    return ctx.json({ message: t('user.api.success.reset_password_sent') }, 200);
  })
  .put('/:identifier/resetpassword', ...UserRoutes.resetPassword, validator('json', setPasswordSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const { password } = ctx.req.valid('json');
    const response = await auth.api.setUserPassword({
      body: {
        newPassword: password,
        userId: identifier,
      },
      headers: ctx.req.raw.headers,
    });

    if (!response || (typeof response === 'object' && 'error' in response)) {
      throw new AppError({
        code: 'database:query_error',
        message: t('user.api.error.reset_password_failed'),
      });
    }

    return ctx.json(response, 200);
  })
  .get('/:identifier', ...UserRoutes.getUser, validator('query', getUserSchema), async (ctx) => {
    const identifier = ctx.req.param('identifier');
    const query = ctx.req.valid('query');
    const { page, limit } = query;
    const { skip, take } = getPagination(query);

    const user = await prisma.user.findUnique({
      include: {
        agencies: {
          include: {
            buses: true,
          },
        },
        agencyMemberships: {
          include: {
            agency: true,
            role: true,
            trips: {
              include: {
                agency: true,
                bus: true,
              },
            },
          },
        },
        bookings: {
          include: {
            trip: {
              include: {
                agency: true,
                bus: true,
              },
            },
          },
          skip,
          take,
        },
        profile: true,
        tickets: {
          include: {
            booking: {
              include: {
                trip: true,
              },
            },
            seat: true,
          },
        },
      },
      where: { id: identifier },
    });
    return ctx.json({
      data: user,
      pagination: getPaginationMeta({ limit, page, total: 1 }),
    });
  })
  .put('/:identifier', ...UserRoutes.updateUser, validator('json', updateUserSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const { firstName, lastName, phoneNumber, role, email } = ctx.req.valid('json');

    const response = await auth.api.adminUpdateUser({
      body: {
        data: {
          email,
          name: `${firstName} ${lastName}`,
          profile: {
            update: {
              firstName,
              lastName,
              phoneNumber,
            },
          },
          role,
        },
        userId: identifier,
      },
      headers: ctx.req.raw.headers,
    });

    if (!response || (typeof response === 'object' && 'error' in response)) {
      throw new AppError({
        code: 'database:query_error',
        message: t('user.api.error.update_failed'),
      });
    }

    return ctx.json(response, 200);
  })
  .get('/:identifier/sessions', ...UserRoutes.listUserSessions, async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const response = await auth.api.listUserSessions({
      body: { userId: identifier },
      headers: ctx.req.raw.headers,
    });

    if (!response || (typeof response === 'object' && 'error' in response)) {
      throw new AppError({
        code: 'database:query_error',
        message: t('user.api.error.list_sessions_failed'),
      });
    }

    return ctx.json(response, 200);
  })
  .delete('/:identifier/sessions/:sessionToken', ...UserRoutes.revokeUserSession, async (ctx) => {
    const t = await useTranslation(ctx);
    const sessionToken = ctx.req.param('sessionToken');
    const response = await auth.api.revokeUserSession({
      body: { sessionToken },
      headers: ctx.req.raw.headers,
    });

    if (!response || (typeof response === 'object' && 'error' in response)) {
      throw new AppError({
        code: 'database:query_error',
        message: t('user.api.error.revoke_session_failed'),
      });
    }

    return ctx.json(response, 200);
  })
  .delete('/:identifier', ...UserRoutes.deleteUser, async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const response = await auth.api.removeUser({
      body: {
        userId: identifier,
      },
      headers: ctx.req.raw.headers,
    });

    if (!response || (typeof response === 'object' && 'error' in response)) {
      throw new AppError({
        code: 'database:query_error',
        message: t('user.api.error.delete_failed'),
      });
    }

    return ctx.json(response, 200);
  });

export default userHandler;
