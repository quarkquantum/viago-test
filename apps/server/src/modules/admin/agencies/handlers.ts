import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { SystemRoles } from '@repo/shared';
import { AgencyStatus } from '@repo/shared/constants';
import { agencyIdSchema, createAgencySchema, listAgenciesSchema, updateAgencySchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import slugify from 'slugify';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { getPublicR2Url, uploadR2File } from '@/lib/cloudflare/r2';
import { AgencyRoutes } from './routes';

const isDataUrl = (value: string) => value.startsWith('data:') && value.includes('base64,');

const uploadAgencyLogo = async (logo: string) => {
  if (!logo) {
    return undefined;
  }
  if (!isDataUrl(logo)) {
    return logo;
  }
  const base64 = logo.split('base64,')[1];
  if (!base64) {
    return undefined;
  }
  const buffer = Buffer.from(base64, 'base64');
  const key = await uploadR2File(buffer, `agencies/${Date.now()}`);
  return getPublicR2Url(key);
};

const agencyHandler = new Hono<HonoEnv>()
  .get('/', ...AgencyRoutes.ListAgencies, validator('query', listAgenciesSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder, q, status } = query;

    const where: Prisma.AgencyWhereInput = {
      ...(status && { status }),
      ...(q && {
        OR: [
          {
            name: { contains: q, mode: 'insensitive' },
          },
          {
            description: {
              contains: q,
              mode: 'insensitive',
            },
          },
          {
            owner: {
              email: { contains: q, mode: 'insensitive' },
            },
          },
          {
            owner: {
              fullName: { contains: q, mode: 'insensitive' },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.agency.findMany({
        include: {
          _count: {
            select: {
              buses: true,
              members: true,
              trips: true,
            },
          },
          city: true,
          country: true,
          owner: {
            select: {
              email: true,
              fullName: true,
              id: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
        where,
      }),
      prisma.agency.count({ where }),
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

  .get('/:identifier', ...AgencyRoutes.getAgency, validator('param', agencyIdSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.valid('param');

    const agency = await prisma.agency.findUnique({
      include: {
        _count: {
          select: {
            bookings: true,
            buses: true,
            trips: true,
          },
        },
        buses: {
          include: {
            seats: true,
            trips: {
              include: {
                stations: true,
              },
            },
          },
          take: 4,
        },
        members: {
          where: { role: { name: SystemRoles.DRIVER } },
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    phoneNumber: true,
                  },
                },
              },
            },
          },
          take: 5,
        },
        city: true,
        country: true,
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
      },
      where: { slug: identifier },
    });

    if (!agency) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'agency',
        message: t('agency.api.error.not_found'),
      });
    }

    const [driverCount, cashierCount] = await Promise.all([
      prisma.agencyMember.count({ where: { agencyId: agency.id, role: { name: SystemRoles.DRIVER } } }),
      prisma.agencyMember.count({ where: { agencyId: agency.id, role: { name: SystemRoles.CASHIER } } }),
    ]);

    return ctx.json(
      {
        data: {
          ...agency,
          totalBookings: agency._count.bookings,
          totalBuses: agency._count.buses,
          totalCashiers: cashierCount,
          totalDrivers: driverCount,
          totalTrips: agency._count.trips,
        },
      },
      200
    );
  })

  .post('/', ...AgencyRoutes.createAgency, validator('json', createAgencySchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { description, logo, name, status, countryCode, cityId } = ctx.req.valid('json');

    const uploadedLogo = await uploadAgencyLogo(logo);

    const newAgency = await prisma.agency.create({
      data: {
        description,
        logo: uploadedLogo,
        name,
        slug: slugify(name),
        status: status ?? AgencyStatus.ACTIVE,
        countryCode,
        cityId,
      },
      include: {
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
        city: true,
        country: true,
      },
    });

    return ctx.json(
      {
        data: newAgency,
        message: t('agency.api.success.created'),
      },
      201
    );
  })
  .put('/:identifier', ...AgencyRoutes.updateAgency, validator('json', updateAgencySchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();
    const updateData = ctx.req.valid('json');

    const existingAgency = await prisma.agency.findUnique({
      include: {
        owner: true,
      },
      where: { slug: identifier },
    });

    if (!existingAgency) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'agency',
        message: t('agency.api.error.not_found'),
      });
    }
    const updatedAgency = await prisma.agency.update({
      data: {
        ...updateData,
        ...(updateData.logo ? { logo: await uploadAgencyLogo(updateData.logo) } : {}),
      },
      include: {
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
        city: true,
        country: true,
      },
      where: { slug: identifier },
    });

    return ctx.json(
      {
        data: updatedAgency,
        message: t('agency.api.success.updated'),
        status: 200,
      },
      200
    );
  })
  .patch('/:identifier/activate', ...AgencyRoutes.activateAgency, validator('param', agencyIdSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.valid('param');

    const existingAgency = await prisma.agency.findUnique({
      include: {
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
        city: true,
        country: true,
      },
      where: { slug: identifier },
    });

    if (!existingAgency) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'agency',
        message: t('agency.api.error.not_found'),
      });
    }

    if (existingAgency.status === AgencyStatus.ACTIVE) {
      return ctx.json(
        {
          data: existingAgency,
          message: t('agency.api.success.already_active'),
        },
        200
      );
    }

    const updatedAgency = await prisma.agency.update({
      data: {
        status: AgencyStatus.ACTIVE,
      },
      include: {
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
        city: true,
        country: true,
      },
      where: { slug: identifier },
    });

    return ctx.json(
      {
        data: updatedAgency,
        message: t('agency.api.success.activated'),
      },
      200
    );
  })
  .patch(
    '/:identifier/deactivate',
    ...AgencyRoutes.deactivateAgency,
    validator('param', agencyIdSchema),
    async (ctx) => {
      const t = await useTranslation(ctx);
      const { identifier } = ctx.req.valid('param');

      const existingAgency = await prisma.agency.findUnique({
        include: {
          owner: {
            select: {
              email: true,
              fullName: true,
              id: true,
            },
          },
          city: true,
          country: true,
        },
        where: { slug: identifier },
      });

      if (!existingAgency) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'agency',
          message: t('agency.api.error.not_found'),
        });
      }

      if (existingAgency.status === AgencyStatus.INACTIVE) {
        return ctx.json(
          {
            data: existingAgency,
            message: t('agency.api.success.already_inactive'),
          },
          200
        );
      }

      const updatedAgency = await prisma.agency.update({
        data: {
          status: AgencyStatus.INACTIVE,
        },
        include: {
          owner: {
            select: {
              email: true,
              fullName: true,
              id: true,
            },
          },
          city: true,
          country: true,
        },
        where: { slug: identifier },
      });

      return ctx.json(
        {
          data: updatedAgency,
          message: t('agency.api.success.deactivated'),
        },
        200
      );
    }
  )
  .delete('/:identifier', ...AgencyRoutes.deleteAgency, validator('param', agencyIdSchema), async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.valid('param');

    // Check if station exists and has related bookings
    const existingAgency = await prisma.agency.findUnique({
      include: {
        owner: {
          select: {
            email: true,
            fullName: true,
            id: true,
          },
        },
        city: true,
        country: true,
      },
      where: { slug: identifier },
    });

    if (!existingAgency) {
      throw new AppError({
        code: 'http:not_found',
        context: {
          method: ctx.req.method,
          path: ctx.req.path,
        },
        entityType: 'agency',
        message: t('agency.api.error.not_found'),
      });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Get all trips for this agency
      const trips = await tx.trip.findMany({
        where: { agencyId: existingAgency.id },
        select: { id: true },
      });
      const tripIds = trips.map((t) => t.id);

      // 2. Get all bookings for this agency
      const bookings = await tx.booking.findMany({
        where: {
          OR: [{ agencyId: existingAgency.id }, { tripId: { in: tripIds } }],
        },
        select: { id: true },
      });
      const bookingIds = bookings.map((b) => b.id);

      // 3. Delete transactions associated with the agency or its bookings
      await tx.transaction.deleteMany({
        where: {
          OR: [{ agencyId: existingAgency.id }, { bookingId: { in: bookingIds } }],
        },
      });

      // 4. Delete tickets associated with these bookings
      await tx.ticket.deleteMany({
        where: { bookingId: { in: bookingIds } },
      });

      // 5. Delete bookings
      await tx.booking.deleteMany({
        where: { id: { in: bookingIds } },
      });

      // 6. Delete stations associated with these trips
      await tx.station.deleteMany({
        where: { tripId: { in: tripIds } },
      });

      // 7. Delete trips
      await tx.trip.deleteMany({
        where: { id: { in: tripIds } },
      });

      // 8. Delete seats for buses of this agency
      const buses = await tx.bus.findMany({
        where: { agencyId: existingAgency.id },
        select: { id: true },
      });
      const busIds = buses.map((b) => b.id);

      await tx.seat.deleteMany({
        where: { busId: { in: busIds } },
      });

      // 9. Delete buses
      await tx.bus.deleteMany({
        where: { agencyId: existingAgency.id },
      });

      // 10. Delete agency members (drivers, cashiers, owner, etc.)
      await tx.agencyMember.deleteMany({
        where: { agencyId: existingAgency.id },
      });

      // 11. Delete the agency itself
      return await tx.agency.delete({
        where: { id: existingAgency.id },
      });
    });

    return ctx.json(
      {
        message: t('agency.api.success.deleted'),
      },
      200
    );
  });

export default agencyHandler;
