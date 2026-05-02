import { auth } from '@repo/auth/alpha/server';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { SystemRoles } from '@repo/shared';
import { createAdminSchema, listAdminsSchema, updateAdminSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { nanoid } from 'nanoid';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { AdminRoutes } from '@/modules/alpha/admins/routes';

const AdminHandler = new Hono<HonoEnv>()
  .get('/', ...AdminRoutes.listAdmins, validator('query', listAdminsSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder, q, banned } = query;

    const where: Prisma.UserWhereInput = {
      role: SystemRoles.ADMIN,
      ...(banned && { banned: banned === 'true' }),
      ...(q && {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          {
            profile: {
              phoneNumber: { contains: q, mode: 'insensitive' },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        include: {
          profile: true,
        },
        orderBy: { [sortBy]: sortOrder },
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
  .post('/', ...AdminRoutes.createAdmin, validator('json', createAdminSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { email, fullName, phoneNumber } = ctx.req.valid('json');
    const password = nanoid(12);

    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ') || undefined;

    const admin = await prisma.$transaction(async (tx) => {
      // Create user via auth
      const response = await auth.api.createUser({
        body: {
          email,
          password,
          name: fullName,
        },
        headers: ctx.req.header(),
      });

      if (!response || 'error' in response) {
        throw new AppError({
          code: 'http:bad_request',
          entityType: 'user',
          message: t('admin.api.error.create_failed'),
        });
      }

      // response.user might be nested or direct depending on client return
      // Safe to assume response itself structure or access it safely
      const user = response.user || response; // fallback logic just in case

      // Update role and handle profile (profile is created by databaseHooks in auth)
      const updatedUser = await tx.user.update({
        data: {
          role: SystemRoles.ADMIN,
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
        where: { id: user.id },
      });

      return updatedUser;
    });

    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${ctx.req.header('origin')}/reset-password`,
      },
      headers: ctx.req.header(),
    });

    return ctx.json(admin, 201);
  })
  .get('/:identifier', ...AdminRoutes.getAdmin, async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const admin = await prisma.user.findFirst({
      include: {
        profile: true,
      },
      where: {
        id: identifier,
        role: { in: [SystemRoles.ADMIN, SystemRoles.SUPER_ADMIN] },
      },
    });

    if (!admin) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('admin.api.error.not_found'),
      });
    }

    return ctx.json(admin, 200);
  })
  .patch('/:identifier', ...AdminRoutes.updateAdmin, validator('json', updateAdminSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');
    const updateData = ctx.req.valid('json');

    const admin = await prisma.user.findFirst({
      where: {
        id: identifier,
        role: { in: [SystemRoles.ADMIN, SystemRoles.SUPER_ADMIN] },
      },
    });

    if (!admin) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('admin.api.error.not_found'),
      });
    }

    let firstName: string | undefined;
    let lastName: string | null | undefined;

    if (updateData.fullName) {
      const parts = updateData.fullName.split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || null;
    }

    const updated = await prisma.user.update({
      data: {
        email: updateData.email,
        fullName: updateData.fullName,
        role: updateData.role,
        profile: {
          update: {
            firstName,
            lastName,
            phoneNumber: updateData.phoneNumber,
          },
        },
      },
      include: {
        profile: true,
      },
      where: { id: identifier },
    });

    return ctx.json(updated, 200);
  })
  .delete('/:identifier', ...AdminRoutes.deleteAdmin, async (ctx) => {
    const t = await useTranslation(ctx);
    const identifier = ctx.req.param('identifier');

    const admin = await prisma.user.findFirst({
      where: {
        id: identifier,
        role: { in: [SystemRoles.ADMIN, SystemRoles.SUPER_ADMIN] },
      },
    });

    if (!admin) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('admin.api.error.not_found'),
      });
    }

    await prisma.user.delete({
      where: { id: identifier },
    });

    return ctx.json({ message: t('admin.api.success.deleted') }, 200);
  });

export default AdminHandler;
