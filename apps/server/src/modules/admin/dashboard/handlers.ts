import { prisma } from '@repo/database';
import { AgencyStatus, BookingStatus, TripStatus } from '@repo/shared';
import { Hono } from 'hono';
import type { HonoEnv } from '@/lib/hono/context';
import { DashboardRoutes } from './routes';

const dashboardHandler = new Hono<HonoEnv>().get('/', ...DashboardRoutes.getStats, async (ctx) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalBuses,
    activeTrips,
    completedTrips,
    todayBookings,
    todayRevenue,
    recentBookings,
    workingBuses,
    totalAgencies,
    activeAgencies,
    pendingAgencies,
    suspendedAgencies,
  ] = await Promise.all([
    // Total buses
    prisma.bus.count(),

    // Active trips
    prisma.trip.count({
      where: { status: TripStatus.ONGOING },
    }),

    // Completed trips
    prisma.trip.count({
      where: { status: TripStatus.COMPLETED },
    }),

    // Today's bookings
    prisma.booking.count({
      where: {
        createdAt: { gte: startOfToday },
      },
    }),

    // Today's revenue
    prisma.booking.aggregate({
      _sum: { total: true },
      where: {
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
    }),

    // Working buses
    prisma.bus.findMany({
      include: {
        seats: true,
        trips: {
          include: {
            stations: true,
          },
          orderBy: { departureTime: 'asc' },
          where: {
            status: TripStatus.ONGOING,
          },
        },
      },
      take: 5,
      where: {
        trips: { some: { status: TripStatus.ONGOING } },
      },
    }),

    // Total Agencies
    prisma.agency.count(),

    // Active Agencies
    prisma.agency.count({
      where: { status: AgencyStatus.ACTIVE },
    }),

    // Pending Agencies
    prisma.agency.count({
      where: { status: AgencyStatus.PENDING },
    }),

    // Suspended Agencies
    prisma.agency.count({
      where: { status: AgencyStatus.SUSPENDED },
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
          agencies: {
            total: totalAgencies,
            active: activeAgencies,
            pending: pendingAgencies,
            suspended: suspendedAgencies,
          },
        },
        workingBuses,
      },
    },
    200
  );
});

export default dashboardHandler;
