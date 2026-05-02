import { auth } from '@repo/auth/agency/server';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { SystemRoles, UserStatus } from '@repo/shared';
import { agencyManagerQuerySchema, cameroonPhoneNumberSchema, createAgencyManagerSchemaWithoutAgencyId } from '@repo/validators';
import { hashPassword } from 'better-auth/crypto';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency } from '@/lib/hono/context';
import { ManagerRoutes } from '@/modules/agency/agency-managers/routes';

const updateManagerSchema = z.object({
  firstName: z.string().min(1).max(32).trim().optional(),
  lastName: z.string().min(1).max(32).trim().optional(),
  phoneNumber: cameroonPhoneNumberSchema.optional(),
  status: z.string().optional(),
});

const managerHandler = new Hono<HonoEnv>()
  .post('/', ...ManagerRoutes.createManager, validator('json', createAgencyManagerSchemaWithoutAgencyId), async (ctx) => {
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
        role: SystemRoles.AGENCY_MANAGER,
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
            role: { connect: { name: SystemRoles.AGENCY_MANAGER } },
          },
        },
      },
      include: {
        agencyMemberships: {
          include: { user: { include: { profile: true } } },
          where: { agencyId: agency.id },
        },
      },
    });

    const agencyManager = userCreate.agencyMemberships[0];

    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${ctx.req.header('origin')}/reset-password`,
      },
      headers: ctx.req.header(),
    });

    return ctx.json({ data: agencyManager, message: t('manager.api.success.created') }, 201);
  })
  .get('/', ...ManagerRoutes.listManagers, validator('query', agencyManagerQuerySchema), async (ctx) => {
    const agency = getContextAgency();
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const where: Prisma.AgencyMemberWhereInput = {
      agencyId: agency.id,
      role: { name: SystemRoles.AGENCY_MANAGER },
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      prisma.agencyMember.findMany({
        include: {
          user: { include: { profile: true } },
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
  .get('/:identifier', ...ManagerRoutes.getManager, async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();
    const { identifier } = ctx.req.param();

    const manager = await prisma.agencyMember.findUnique({
      include: { user: { include: { profile: true } } },
      where: { agencyId: agency.id, id: identifier, role: { name: SystemRoles.AGENCY_MANAGER } },
    });

    if (!manager) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('manager.api.error.not_found'),
      });
    }

    return ctx.json({ data: manager }, 200);
  })
  .patch('/:identifier', ...ManagerRoutes.updateManager, validator('json', updateManagerSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();
    const { identifier } = ctx.req.param();
    const body = ctx.req.valid('json');

    const manager = await prisma.agencyMember.findUnique({
      where: { agencyId: agency.id, id: identifier, role: { name: SystemRoles.AGENCY_MANAGER } },
    });

    if (!manager) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('manager.api.error.not_found'),
      });
    }

    const { status, ...profileData } = body;

    await prisma.$transaction([
      ...(Object.keys(profileData).length > 0
        ? [
            prisma.profile.update({
              data: profileData,
              where: { userId: manager.userId },
            }),
          ]
        : []),
      ...(status
        ? [
            prisma.agencyMember.update({
              data: { status },
              where: { id: identifier },
            }),
          ]
        : []),
    ]);

    const updated = await prisma.agencyMember.findUnique({
      include: { user: { include: { profile: true } } },
      where: { id: identifier },
    });

    return ctx.json({ data: updated }, 200);
  })
  .delete('/:identifier', ...ManagerRoutes.deleteManager, async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();
    const { identifier } = ctx.req.param();

    const manager = await prisma.agencyMember.findUnique({
      where: { agencyId: agency.id, id: identifier, role: { name: SystemRoles.AGENCY_MANAGER } },
    });

    if (!manager) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('manager.api.error.not_found'),
      });
    }

    await prisma.agencyMember.update({
      data: { status: UserStatus.DELETED },
      where: { id: identifier },
    });

    return ctx.json({ success: true }, 200);
  });

export default managerHandler;
