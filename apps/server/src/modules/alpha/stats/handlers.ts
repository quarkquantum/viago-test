import { prisma } from '@repo/database';
import { AgencyStatus, SystemRoles, TicketStatus, TransactionStatus } from '@repo/shared';
import { baseQuerySchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import type { HonoEnv } from '@/lib/hono/context';
import { StatsRoutes } from '@/modules/alpha/stats/routes';

const statsHandler = new Hono<HonoEnv>().get(
  '/',
  ...StatsRoutes.getStats,
  validator('query', baseQuerySchema),
  async (ctx) => {
    const { limit, q } = ctx.req.valid('query');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total revenue (sum of all completed transactions)
    const [totalRevenueResult, todayRevenueResult] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: TransactionStatus.COMPLETE,
        },
      }),
      prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: TransactionStatus.COMPLETE,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    // If search query is present, find matching agency IDs first, using robust filtering pattern
    let agencyIdFilter: string[] | undefined;
    if (q) {
      const matchingAgencies = await prisma.agency.findMany({
        where: {
          OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }],
        },
        select: {
          id: true,
        },
      });
      agencyIdFilter = matchingAgencies.map((a) => a.id);
    }

    // Get revenue by agency
    const agencyRevenues = await prisma.transaction.groupBy({
      by: ['agencyId'],
      _sum: {
        amount: true,
      },
      where: {
        status: TransactionStatus.COMPLETE,
        ...(agencyIdFilter && {
          agencyId: {
            in: agencyIdFilter,
          },
        }),
      },
    });

    // Get agency details for the revenues
    // If we have agencyIdFilter and it was empty (no matches), agencyRevenues will be empty anyway.

    const agencyIds = agencyRevenues.map((r) => r.agencyId);

    // We fetch agency details again to ensure we have the names.
    // Optimization: If we searched, we might already have names, but easy to just refetch for the specific result set.
    const agencies = await prisma.agency.findMany({
      where: {
        id: { in: agencyIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    let agencyRevenuesWithDetails = agencyRevenues.map((r) => {
      const agency = agencies.find((a) => a.id === r.agencyId);
      return {
        agencyId: r.agencyId,
        agencyName: agency?.name || 'Unknown',
        agencySlug: agency?.slug || '',
        revenue: r._sum.amount || 0,
      };
    });

    // Sort by revenue descending
    agencyRevenuesWithDetails.sort((a, b) => b.revenue - a.revenue);

    // Apply limit if provided
    if (limit) {
      agencyRevenuesWithDetails = agencyRevenuesWithDetails.slice(0, limit);
    }

    // Get total drivers count
    const totalDrivers = await prisma.agencyMember.count({ where: { role: { name: SystemRoles.DRIVER } } });

    // Get total agencies (accepted/active only)
    const totalAgencies = await prisma.agency.count({ where: { status: AgencyStatus.ACTIVE } });

    // Get total tickets bought
    const totalTickets = await prisma.ticket.count();

    // Get total passengers (unique users who have booked tickets)
    const totalPassengers = await prisma.user.count({
      where: {
        bookings: { some: {} },
      },
    });

    // Get tickets by status
    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ['status'],
      _count: true,
    });

    const ticketsByStatusMap = ticketsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get admin counts
    const [totalAdmins, totalSuperAdmins] = await Promise.all([
      prisma.user.count({ where: { role: SystemRoles.ADMIN } }),
      prisma.user.count({ where: { role: SystemRoles.SUPER_ADMIN } }),
    ]);

    return ctx.json(
      {
        data: {
          totalRevenue: totalRevenueResult._sum.amount || 0,
          todayRevenue: todayRevenueResult._sum.amount || 0,
          agencyRevenues: agencyRevenuesWithDetails,
          totalDrivers,
          totalAdmins,
          totalSuperAdmins,
          totalAgencies,
          totalTickets,
          totalPassengers,
          ticketsByStatus: {
            issued: ticketsByStatusMap[TicketStatus.ISSUED] || 0,
            consumed: ticketsByStatusMap[TicketStatus.CONSUMED] || 0,
            cancelled: ticketsByStatusMap[TicketStatus.CANCELLED] || 0,
            refunded: ticketsByStatusMap[TicketStatus.REFUNDED] || 0,
            expired: ticketsByStatusMap[TicketStatus.EXPIRED] || 0,
            reserved: ticketsByStatusMap[TicketStatus.RESERVED] || 0,
          },
        },
      },
      200
    );
  }
);

export default statsHandler;
