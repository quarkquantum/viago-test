import { auth } from '@repo/auth/agency/server';
import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { SystemRoles, UserStatus } from '@repo/shared';
import { createAgencyDriverSchema, listDriversSchema } from '@repo/validators';
import { hashPassword } from 'better-auth/crypto';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { nanoid } from 'nanoid';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency } from '@/lib/hono/context';
import { DriverRoutes } from '@/modules/agency/drivers/routes';

const driverHandler = new Hono<HonoEnv>()
  .post('/', ...DriverRoutes.createDriver, validator('json', createAgencyDriverSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const agency = getContextAgency();
    const { email, firstName, lastName, phoneNumber } = ctx.req.valid('json');
    const password = nanoid(12);
    const hashedPassword = await hashPassword(password);

    const userUpdate = await prisma.user.create({
      data: {
        email,
        emailVerified: true,
        fullName: `${firstName} ${lastName}`,
        role: SystemRoles.DRIVER,
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
            role: { connect: { name: SystemRoles.DRIVER } },
          },
        },
      },
      include: {
        agencyMemberships: {
          include: {
            user: {
              include: { profile: true },
            },
          },
          where: { agencyId: agency.id },
        },
      },
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
  .get('/', ...DriverRoutes.listDrivers, validator('query', listDriversSchema), async (ctx) => {
    const agency = getContextAgency();

    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const where: Prisma.AgencyMemberWhereInput = {
      agencyId: agency.id,
      role: { name: SystemRoles.DRIVER },
      ...(query.status && { status: query.status }),
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
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.agencyMember.findMany({
        include: {
          user: {
            include: {
              bookings: {
                include: {
                  trip: {
                    include: {
                      bus: true,
                    },
                  },
                },
              },
              profile: true,
            },
          },
          trips: true,
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
  .get('/:identifier', ...DriverRoutes.getDriver, async (ctx) => {
    const t = await useTranslation(ctx);
    const agencyUser = getContextAgency();

    const { identifier } = ctx.req.param();
    const driver = await prisma.agencyMember.findUnique({
      include: {
        user: {
          include: {
            bookings: {
              include: {
                trip: {
                  include: {
                    bus: true,
                  },
                },
              },
            },
            profile: true,
          },
        },
        trips: {
          include: {
            bus: true,
          },
        },
      },
      where: { agencyId: agencyUser.id, id: identifier, role: { name: SystemRoles.DRIVER } },
    });
    if (!driver) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('driver.api.error.not_found'),
      });
    }
    return ctx.json(driver, 200);
  })
  .delete('/:identifier', ...DriverRoutes.deleteDriver, async (ctx) => {
    const t = await useTranslation(ctx);
    const agencyUser = getContextAgency();

    const { identifier } = ctx.req.param();
    const driver = await prisma.agencyMember.findUnique({
      where: { agencyId: agencyUser.id, id: identifier, role: { name: SystemRoles.DRIVER } },
    });
    if (!driver) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'user',
        message: t('driver.api.error.not_found'),
      });
    }
    await prisma.agencyMember.update({
      data: { status: UserStatus.DELETED },
      where: { agencyId: agencyUser.id, id: identifier, role: { name: SystemRoles.DRIVER } },
    });

    return ctx.json({ success: true }, 200);
  });

export default driverHandler;
