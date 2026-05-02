import { auth } from '@repo/auth/admin/server';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { SystemRoles } from '@repo/shared';
import { createDriverSchema, getDriverSchema, listDriversSchema, updateDriverSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { nanoid } from 'nanoid';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { DriverRoutes } from '@/modules/admin/drivers/routes';

const driverHandler = new Hono<HonoEnv>()
  .get('/', ...DriverRoutes.listDrivers, validator('query', listDriversSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const where: Prisma.AgencyMemberWhereInput = {
      role: { name: SystemRoles.DRIVER },
      ...(query.agencyId && { agencyId: query.agencyId }),
      ...(query.q && {
        OR: [
          {
            user: {
              OR: [
                { email: { contains: query.q, mode: 'insensitive' } },
                { fullName: { contains: query.q, mode: 'insensitive' } },
                {
                  profile: {
                    OR: [
                      { firstName: { contains: query.q, mode: 'insensitive' } },
                      { lastName: { contains: query.q, mode: 'insensitive' } },
                      { phoneNumber: { contains: query.q, mode: 'insensitive' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            agency: {
              name: { contains: query.q, mode: 'insensitive' },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.agencyMember.findMany({
        include: {
          trips: true,
          user: {
            include: {
              profile: true,
            },
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
        pagination: getPaginationMeta({
          limit: query.limit,
          page: query.page,
          total,
        }),
      },
      200
    );
  })
  .post('/', ...DriverRoutes.createDriver, validator('json', createDriverSchema), async (ctx) => {
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
        message: t('driver.api.error.create_failed'),
      });
    }

    const user = response.user;

    const userUpdate = await prisma.user.update({
      data: {
        emailVerified: true,
        role: SystemRoles.DRIVER,
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
        agencyMemberships: {
          create: {
            agencyId,
            role: { connect: { name: SystemRoles.DRIVER } },
          },
        },
      },
      include: {
        agencyMemberships: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
          where: { agencyId },
        },
      },
      where: { id: user.id },
    });

    const agencyDriver = userUpdate.agencyMemberships[0];

    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${ctx.req.header('origin')}/reset-password`,
      },
      headers: ctx.req.header(),
    });

    return ctx.json({ data: agencyDriver, message: t('driver.api.success.created') }, 201);
  })

  .get('/:identifier', ...DriverRoutes.getDriver, validator('query', getDriverSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const [driver, totalTrips] = await Promise.all([
      prisma.agencyMember.findUnique({
        include: {
          agency: true,
          trips: {
            where: {
              ...(query.q && {
                OR: [
                  {
                    name: {
                      contains: query.q,
                      mode: 'insensitive',
                    },
                  },
                ],
              }),
            },
            include: {
              bus: true,
              agency: true,
            },
            orderBy: {
              departureTime: 'desc',
            },
            skip,
            take,
          },
          user: {
            include: {
              profile: true,
            },
          },
        },
        where: { id: identifier, role: { name: SystemRoles.DRIVER } },
      }),
      prisma.trip.count({
        where: {
          driverId: identifier,
          ...(query.q && {
            OR: [
              {
                name: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
            ],
          }),
        },
      }),
    ]);

    if (!driver) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'driver',
        message: t('driver.api.error.not_found'),
      });
    }

    return ctx.json(
      {
        data: driver,
        pagination: getPaginationMeta({
          limit: query.limit,
          page: query.page,
          total: totalTrips,
        }),
      },
      200
    );
  })
  .patch('/:identifier', ...DriverRoutes.updateDriver, validator('json', updateDriverSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const body = ctx.req.valid('json');

    const agencyDriver = await prisma.agencyMember.findUnique({
      where: {
        id: identifier,
        role: { name: SystemRoles.DRIVER },
      },
    });

    if (!agencyDriver) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'driver',
        message: t('driver.api.error.not_found'),
      });
    }

    const updated = await prisma.agencyMember.update({
      data: {
        ...(body.agencyId && { agency: { connect: { id: body.agencyId } } }),
        user: {
          update: {
            ...(body.email && { email: body.email }),
            profile: {
              update: {
                ...(body.firstName && { firstName: body.firstName }),
                ...(body.lastName && { lastName: body.lastName }),
                ...(body.phoneNumber && { phoneNumber: body.phoneNumber }),
              },
            },
          },
        },
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      where: { id: identifier },
    });

    return ctx.json(updated, 200);
  })
  .delete('/:identifier', ...DriverRoutes.deleteDriver, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const agencyDriver = await prisma.agencyMember.findUnique({
      where: {
        id: identifier,
        role: { name: SystemRoles.DRIVER },
      },
    });

    if (!agencyDriver) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'driver',
        message: t('driver.api.error.not_found'),
      });
    }

    await prisma.agencyMember.delete({
      where: { id: identifier },
    });

    return ctx.json({ message: t('driver.api.success.deleted') }, 200);
  });

export default driverHandler;
