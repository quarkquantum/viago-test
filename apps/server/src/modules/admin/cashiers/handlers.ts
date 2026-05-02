import { auth } from '@repo/auth/admin/server';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { resend } from '@repo/email';
import { TemporaryCredentialsEmailTemplate } from '@repo/email/emails';
import { keys as emailKeys } from '@repo/email/keys';
import { SystemRoles } from '@repo/shared';
import { baseQuerySchema, cashierQuerySchema, createCashierSchema, updateCashierSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { nanoid } from 'nanoid';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { sendSMS } from '@/lib/twilio';
import { CashierRoutes } from '@/modules/admin/cashiers/routes';

const CashierHandler = new Hono<HonoEnv>()
  .get('/', ...CashierRoutes.listCashiers, validator('query', cashierQuerySchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder, q, status } = query;

    const where: Prisma.AgencyMemberWhereInput = {
      role: { name: SystemRoles.CASHIER },
      ...(status && { status }),
      ...(q && {
        OR: [
          { user: { fullName: { contains: q, mode: 'insensitive' } } },
          { user: { email: { contains: q, mode: 'insensitive' } } },
          {
            user: {
              profile: {
                phoneNumber: { contains: q, mode: 'insensitive' },
              },
            },
          },
          {
            agency: {
              name: { contains: q, mode: 'insensitive' },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.agencyMember.findMany({
        include: {
          agency: true,
          user: {
            include: {
              profile: {
                select: {
                  phoneNumber: true,
                  firstName: true,
                  lastName: true,
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
      prisma.agencyMember.count({ where }),
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
  .post('/', ...CashierRoutes.createCashier, validator('json', createCashierSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { agencyId, email, firstName, lastName, phoneNumber } = ctx.req.valid('json');
    const password = nanoid(12);

    const response = await auth.api.createUser({
      body: {
        email,
        name: `${firstName} ${lastName}`,
        password,
      },
      headers: ctx.req.header(),
    });

    if (!response || (typeof response === 'object' && 'error' in response)) {
      throw new AppError({
        code: 'database:query_error',
        message: t('cashier.api.error.create_failed'),
      });
    }

    const user = response.user;

    const cashier = await prisma.$transaction(async (tx) => {
      // Update user role and profile
      await tx.user.update({
        data: {
          emailVerified: true,
          mustChangePassword: true,
          role: SystemRoles.CASHIER,
          profile: {
            upsert: {
              create: {
                firstName,
                lastName,
                phoneNumber,
              },
              update: {
                firstName,
                lastName,
                phoneNumber,
              },
            },
          },
        },
        where: { id: user.id },
      });

      // Link to agency
      const cashierRole = await tx.agencyRole.findUnique({
        where: { name: SystemRoles.CASHIER },
      });

      if (!cashierRole) {
        throw new AppError({
          code: 'database:query_error',
          message: t('cashier.api.error.create_failed'),
        });
      }

      return await tx.agencyMember.create({
        data: {
          agencyId,
          userId: user.id,
          roleId: cashierRole.id,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });
    });

    const loginUrl = `${ctx.req.header('origin')}/login`;
    const username = `${firstName} ${lastName}`.trim() || email.split('@')[0] || 'User';

    await resend.emails.send({
      from: emailKeys().RESEND_FROM as string,
      react: TemporaryCredentialsEmailTemplate({
        email,
        loginUrl,
        temporaryPassword: password,
        username,
      }),
      subject: 'Your Viago cashier credentials',
      to: [email],
    });

    if (phoneNumber) {
      await sendSMS({
        body: `Viago - Login: ${email} | Temporary password: ${password}. You must set a new password at first login.`,
        to: phoneNumber,
      });
    }

    return ctx.json({ data: cashier, message: t('cashier.api.success.created') }, 201);
  })
  .get('/:identifier', ...CashierRoutes.getCashier, validator('query', baseQuerySchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const query = ctx.req.valid('query');
    const { page, limit } = query;
    const { skip, take } = getPagination(query);
    const cashier = await prisma.agencyMember.findUnique({
      where: { id: identifier, role: { name: SystemRoles.CASHIER } },
      include: {
        agency: true,
        user: {
          include: {
            _count: {
              select: {
                tickets: true,
                bookings: true,
              },
            },
            profile: true,
            tickets: {
              include: {
                booking: {
                  select: {
                    total: true,
                    trip: {
                      select: {
                        name: true,
                        departureTime: true,
                        bus: {
                          select: {
                            licensePlate: true,
                          },
                        },
                      },
                    },
                    seat: {
                      select: {
                        number: true,
                      },
                    },
                    passenger: {
                      select: {
                        fullName: true,
                        email: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              skip,
              take,
              where: {
                ...(query.q && {
                  OR: [
                    {
                      status: {
                        in: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
                      },
                    },
                  ],
                }),
              },
            },
          },
        },
      },
    });

    if (!cashier) {
      throw new AppError({
        code: 'auth:cashier_not_found',
        entityType: 'cashier',
        message: t('cashier.api.error.not_found'),
      });
    }

    return ctx.json(
      {
        cashier: {
          ...cashier,
          totalTickets: cashier.user._count.tickets,
          totalBookings: cashier.user._count.bookings,
        },
        pagination: getPaginationMeta({
          limit,
          page,
          total: cashier.user.tickets.length,
        }),
      },
      200
    );
  })
  .patch('/:identifier', ...CashierRoutes.updateCashier, validator('json', updateCashierSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const updateData = ctx.req.valid('json');

    const agencyCashier = await prisma.agencyMember.findUnique({
      include: { user: true },
      where: { id: identifier, role: { name: SystemRoles.CASHIER } },
    });

    if (!agencyCashier) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'cashier',
        message: t('cashier.api.error.not_found'),
      });
    }

    // 1. Update User and Profile
    await prisma.user.update({
      data: {
        email: updateData.email,
        fullName:
          updateData.firstName && updateData.lastName ? `${updateData.firstName} ${updateData.lastName}` : undefined,
        profile: {
          update: {
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            phoneNumber: updateData.phoneNumber,
          },
        },
      },
      where: { id: agencyCashier.userId },
    });

    // 3. Update Agency link if provided and changed
    if (updateData.agencyId && updateData.agencyId !== agencyCashier.agencyId) {
      await prisma.agencyMember.update({
        data: {
          agencyId: updateData.agencyId,
        },
        where: { id: identifier },
      });
    }

    // Fetch the updated entry to return
    const updated = await prisma.agencyMember.findUnique({
      include: {
        agency: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
      where: { id: identifier },
    });

    return ctx.json(
      {
        data: updated,
        message: t('cashier.api.success.updated'),
      },
      200
    );
  })

  .delete('/:identifier', ...CashierRoutes.deleteCashier, async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');

    const cashier = await prisma.agencyMember.findUnique({
      where: {
        id: identifier,
        role: { name: SystemRoles.CASHIER },
      },
    });

    if (!cashier) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'cashier',
        message: t('cashier.api.error.not_found'),
      });
    }

    await prisma.agencyMember.delete({
      where: { id: identifier },
    });

    return ctx.json(
      {
        message: t('cashier.api.success.deleted'),
      },
      200
    );
  });

export default CashierHandler;
