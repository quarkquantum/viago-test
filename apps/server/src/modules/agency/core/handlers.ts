import { prisma } from '@repo/database';
import { SystemRoles, TripStatus } from '@repo/shared';
import { updateAgencySchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency, getContextUser } from '@/lib/hono/context';
import { MeRoutes } from './routes';

const coreHandler = new Hono<HonoEnv>()
  .get('/', ...MeRoutes.getMyAgency, async (ctx) => {
    const agencyUser = getContextAgency();

    // Get current date for statistics
    const now = new Date();

    // Fetch statistics
    const [totalBuses, totalDrivers, recentBookings, upcomingTrips, agency, buses, drivers] = await Promise.all([
      // Total buses
      prisma.bus.count({ where: { agencyId: agencyUser.id } }),
      // Total drivers
      prisma.agencyMember.count({ where: { agencyId: agencyUser.id, role: { name: SystemRoles.DRIVER } } }),
      // Recent bookings
      prisma.booking.findMany({
        include: {
          fromStation: {
            select: {
              id: true,
              name: true,
            },
          },
          passenger: {
            select: {
              email: true,
              fullName: true,
              id: true,
            },
          },
          toStation: {
            select: {
              id: true,
              name: true,
            },
          },
          trip: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        where: { agencyId: agencyUser.id },
      }),
      // Upcoming trips
      prisma.trip.findMany({
        include: {
          _count: {
            select: {
              bookings: true,
            },
          },
          bus: {
            select: {
              id: true,
              licensePlate: true,
              maxPlaces: true,
            },
          },
          stations: {
            orderBy: { order: 'asc' },
            take: 2,
          },
        },
        orderBy: { departureTime: 'asc' },
        take: 5,
        where: {
          agencyId: agencyUser.id,
          departureTime: { gte: now },
          status: TripStatus.ONGOING,
        },
      }),
      // Agency
      prisma.agency.findUnique({
        include: {
          owner: {
            select: {
              email: true,
              fullName: true,

              id: true,
            },
          },
        },
        where: { id: agencyUser.id },
      }),
      // Active buses with trips
      prisma.bus.findMany({
        include: {
          seats: {
            select: {
              id: true,
              type: true,
            },
          },
          trips: {
            include: {
              stations: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { departureTime: 'asc' },
            take: 1,
            where: {
              departureTime: { gte: now },
              status: TripStatus.ONGOING,
            },
          },
        },
        take: 4,
        where: { agencyId: agencyUser.id },
      }),
      // Drivers
      prisma.agencyMember.findMany({
        include: {
          user: {
            select: {
              fullName: true,
              id: true,
              profile: {
                select: {
                  phoneNumber: true,
                },
              },
            },
          },
        },
        take: 5,
        where: { agencyId: agencyUser.id, role: { name: SystemRoles.DRIVER } },
      }),
    ]);

    return ctx.json(
      {
        data: {
          _count: {
            totalBuses,
            totalDrivers,
          },
          agency,
          agencyUser,
          buses,
          drivers,
          recentBookings,
          upcomingTrips,
        },
      },
      200
    );
  })
  .patch('/', ...MeRoutes.updateMyAgency, validator('json', updateAgencySchema), async (ctx) => {
    try {
      const t = await useTranslation(ctx);
      const user = getContextUser();
      const updateData = ctx.req.valid('json');

      // Find the agency owned by the current user
      const agency = await prisma.agency.findFirst({
        where: {
          ownerId: user.id,
        },
      });

      if (!agency) {
        throw new AppError({
          code: 'database:not_found',
          entityType: 'agency',
          message: t('agency.api.error.not_found'),
        });
      }

      const updatedAgency = await prisma.agency.update({
        data: {
          description: updateData.description,
          logo: updateData.logo,
          name: updateData.name,
        },
        include: {
          owner: {
            select: {
              email: true,
              fullName: true,
              id: true,
            },
          },
        },
        where: { id: agency.id },
      });

      return ctx.json(
        {
          data: updatedAgency,
          message: t('agency.api.success.updated'),
        },
        200
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        cause: error,
        code: 'http:internal_server_error',
        context: {
          method: ctx.req.method,
          path: ctx.req.path,
        },
        entityType: 'agency',
        message: t('agency.api.error.update_failed'),
      });
    }
  });

export default coreHandler;
