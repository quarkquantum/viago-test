import { prisma } from '@repo/database';
import { BookingStatus, TripStatus } from '@repo/shared';
import { Hono } from 'hono';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency } from '@/lib/hono/context';
import { DashboardRoutes } from './routes';

const dashboardHandler = new Hono<HonoEnv>().get('/', ...DashboardRoutes.getStats, async (ctx) => {
  const agencyUser = getContextAgency();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalBuses, activeTrips, completedTrips, todayBookings, todayRevenue, recentBookings, workingBuses] =
    await Promise.all([
      // Total buses
      prisma.bus.count({ where: { agencyId: agencyUser.id } }),

      // Active trips
      prisma.trip.count({
        where: { agencyId: agencyUser.id, status: TripStatus.ONGOING },
      }),

      // Completed trips
      prisma.trip.count({
        where: { agencyId: agencyUser.id, status: TripStatus.COMPLETED },
      }),

      // Today's bookings
      prisma.booking.count({
        where: {
          agencyId: agencyUser.id,
          createdAt: { gte: startOfToday },
        },
      }),

      // Today's revenue
      prisma.booking.aggregate({
        _sum: { total: true },
        where: {
          agencyId: agencyUser.id,
          createdAt: { gte: startOfToday },
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
        },
      }),

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

      // Working buses
      prisma.bus.findMany({
        include: {
          trips: {
            include: {
              stations: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { departureTime: 'asc' },
            where: {
              status: TripStatus.ONGOING,
            },
          },
        },
        take: 5,
        where: {
          agencyId: agencyUser.id,
          trips: { some: { status: TripStatus.ONGOING } },
        },
      }),
    ]);

  return ctx.json(
    {
      data: {
        recentBookings,
        stats: {
          bookings: {
            today: todayBookings,
            todayRevenue,
          },
          buses: {
            total: totalBuses,
          },
          trips: {
            active: activeTrips,
            completed: completedTrips,
          },
        },
        workingBuses,
      },
    },
    200
  );
});

export default dashboardHandler;
