import { Prisma, prisma } from '@repo/database';
import { TripStatus } from '@repo/shared';
import { Hono } from 'hono';
import type { HonoEnv } from '@/lib/hono/context';
import { ACTIVE_SEAT_BLOCKING_BOOKING_STATUSES, getSegmentSeatOccupancy } from '@/modules/app/trip/services';
import { DashboardRoutes } from './routes';

const dashboardHandler = new Hono<HonoEnv>().get('/', ...DashboardRoutes.getDashboard, async (ctx) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const now = new Date();
  const beforeHour = new Date(now.getTime() - 60 * 60 * 1000);
  const afterHour = new Date(now.getTime() + 60 * 60 * 1000);

  const dashboardTripInclude = Prisma.validator<Prisma.TripInclude>()({
    bookings: {
      select: {
        seatId: true,
        fromStation: {
          select: { order: true },
        },
        toStation: {
          select: { order: true },
        },
      },
      where: {
        status: {
          in: [...ACTIVE_SEAT_BLOCKING_BOOKING_STATUSES],
        },
      },
    },
    bus: {
      include: {
        seats: {
          select: { id: true, type: true },
        },
      },
    },
    stations: {
      select: { id: true, name: true, order: true, departureTime: true },
      orderBy: { order: 'asc' },
    },
  });

  const [currentTrips, upcomingTrips, currentTripsCount, upcomingTripsCount, soldTicketsCount, soldTicketsData] =
    await Promise.all([
      prisma.trip.findMany({
        include: dashboardTripInclude,
        orderBy: {
          arrivalTime: 'asc',
        },
        take: 5,
        where: { status: TripStatus.ONGOING },
      }),
      prisma.trip.findMany({
        include: dashboardTripInclude,
        orderBy: {
          departureTime: 'asc',
        },
        take: 5,
        where: {
          departureTime: {
            gt: now,
            lte: afterHour,
          },
        },
      }),
      prisma.trip.count({
        where: {
          AND: [
            {
              departureTime: {
                lte: now,
              },
            },
            {
              arrivalTime: {
                gt: now,
              },
            },
          ],
        },
      }),
      prisma.trip.count({
        where: {
          departureTime: {
            gt: beforeHour,
            lte: afterHour,
          },
        },
      }),
      prisma.ticket.count({
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
      prisma.ticket.findMany({
        include: {
          booking: {
            include: {
              trip: true,
            },
          },
          passenger: true,
          seat: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 8,
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
    ]);

  type DashboardTripWithRelations = Prisma.TripGetPayload<{ include: typeof dashboardTripInclude }>;

  const withSeatSummary = (
    trips: DashboardTripWithRelations[]
  ): Array<DashboardTripWithRelations & { seatsSummary: { available: number; reserved: number; total: number } }> =>
    trips.map((trip) => {
      const firstStation = trip.stations[0];
      const lastStation = trip.stations.at(-1);

      if (!(firstStation && lastStation)) {
        return {
          ...trip,
          seatsSummary: { available: 0, reserved: 0, total: 0 },
        };
      }

      const summary = getSegmentSeatOccupancy({
        bookings: trip.bookings,
        fromOrder: firstStation.order,
        seats: trip.bus.seats,
        toOrder: lastStation.order,
      });

      return {
        ...trip,
        seatsSummary: {
          available: summary.available,
          reserved: summary.reserved,
          total: summary.total,
        },
      };
    });

  return ctx.json(
    {
      currentTrips: withSeatSummary(currentTrips),
      currentTripsCount,
      soldTickets: {
        count: soldTicketsCount,
        data: soldTicketsData,
      },
      upcomingTrips: withSeatSummary(upcomingTrips),
      upcomingTripsCount,
    },
    200
  );
});

export default dashboardHandler;
