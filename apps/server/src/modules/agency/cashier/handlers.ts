import { auth } from '@repo/auth/agency/server';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { SystemRoles, UserStatus } from '@repo/shared';
import { cameroonPhoneNumberSchema, cashierQuerySchema, createAgencyCashierSchema } from '@repo/validators';
import { hashPassword } from 'better-auth/crypto';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { useTranslation } from '@intlify/hono';

const updateCashierSchema = z.object({
  firstName: z.string().min(1).max(32).trim().optional(),
  lastName: z.string().min(1).max(32).trim().optional(),
  phoneNumber: cameroonPhoneNumberSchema.optional(),
  status: z.string().optional(),
});
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency } from '@/lib/hono/context';
import { CashierRoutes } from '@/modules/agency/cashier/routes';

const cashierHandler = new Hono<HonoEnv>()
  .post('/', ...CashierRoutes.createCashier, validator('json', createAgencyCashierSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();
    const { email, firstName, lastName, phoneNumber } = ctx.req.valid('json');
    const password = nanoid(12);
    const hashedPassword = await hashPassword(password);

    const userCreate = await prisma.user.create({
      data: {
        email,
        emailVerified: true,
        fullName: `${firstName} ${lastName}`,
        role: SystemRoles.CASHIER,
        accounts: {
          create: {
            accountId: email,
            providerId: 'credential',
            password: hashedPassword,
          },
        },
        profile: {
          create: { firstName, lastName, phoneNumber },
        },
        agencyMemberships: {
          create: {
            agency: { connect: { id: agency.id } },
            role: { connect: { name: SystemRoles.CASHIER } },
          },
        },
      },
      include: {
        agencyMemberships: {
          include: {
            user: { include: { profile: true } },
          },
          where: { agencyId: agency.id },
        },
      },
    });

    const agencyCashier = userCreate.agencyMemberships[0];

    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${ctx.req.header('origin')}/reset-password`,
      },
      headers: ctx.req.header(),
    });

    return ctx.json({ data: agencyCashier, message: t('cashier.api.success.created') }, 201);
  })
  .get('/', ...CashierRoutes.listCashiers, validator('query', cashierQuerySchema), async (ctx) => {
    const agency = getContextAgency();
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const where: Prisma.AgencyMemberWhereInput = {
      agencyId: agency.id,
      role: { name: SystemRoles.CASHIER },
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      prisma.agencyMember.findMany({
        include: {
          user: {
            include: { profile: true },
          },
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take,
        where,
      }),
      prisma.agencyMember.count({ where }),
    ]);

    return ctx.json(
      {
        data,
        pagination: getPaginationMeta({ limit: query.limit, page: query.page, total }),
      },
      200
    );
  })
  .get('/:identifier', ...CashierRoutes.getCashier, async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();
    const { identifier } = ctx.req.param();

    const cashier = await prisma.agencyMember.findUnique({
      include: {
        user: { include: { profile: true } },
      },
      where: { agencyId: agency.id, id: identifier, role: { name: SystemRoles.CASHIER } },
    });

    if (!cashier) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('cashier.api.error.not_found'),
      });
    }

    return ctx.json(cashier, 200);
  })
  .patch('/:identifier', ...CashierRoutes.updateCashier, validator('json', updateCashierSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();
    const { identifier } = ctx.req.param();
    const body = ctx.req.valid('json');

    const cashier = await prisma.agencyMember.findUnique({
      where: { agencyId: agency.id, id: identifier, role: { name: SystemRoles.CASHIER } },
    });

    if (!cashier) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('cashier.api.error.not_found'),
      });
    }

    const { status, ...profileData } = body;

    await prisma.$transaction([
      ...(Object.keys(profileData).length > 0
        ? [prisma.profile.update({ data: profileData, where: { userId: cashier.userId } })]
        : []),
      ...(status
        ? [prisma.agencyMember.update({ data: { status }, where: { id: identifier } })]
        : []),
    ]);

    const updated = await prisma.agencyMember.findUnique({
      include: { user: { include: { profile: true } } },
      where: { id: identifier },
    });

    return ctx.json({ data: updated }, 200);
  })
  .delete('/:identifier', ...CashierRoutes.deleteCashier, async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();
    const { identifier } = ctx.req.param();

    const cashier = await prisma.agencyMember.findUnique({
      where: { agencyId: agency.id, id: identifier, role: { name: SystemRoles.CASHIER } },
    });

    if (!cashier) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('cashier.api.error.not_found'),
      });
    }

    await prisma.agencyMember.update({
      data: { status: UserStatus.DELETED },
      where: { agencyId: agency.id, id: identifier, role: { name: SystemRoles.CASHIER } },
    });

    return ctx.json({ success: true }, 200);
  });

export default cashierHandler;
