import { prisma } from '@repo/database';
import { TicketStatus } from '@repo/shared/constants';
import { Hono } from 'hono';
import type { HonoEnv } from '@/lib/hono/context';
import { RevenueRoutes } from './routes';

type RevenueRow = {
  period: string;
  tickets: number;
  revenue: number;
};

type TicketRow = {
  createdAt: Date;
  booking: {
    total: number;
  };
};

const formatUTCDate = (date: Date) => date.toISOString().slice(0, 10);

const formatUTCMonth = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const formatUTCYear = (date: Date) => `${date.getUTCFullYear()}`;

const aggregateRevenue = (rows: TicketRow[], formatPeriod: (date: Date) => string): RevenueRow[] => {
  const map = new Map<string, RevenueRow>();

  for (const row of rows) {
    const period = formatPeriod(row.createdAt);
    const current = map.get(period) ?? { period, tickets: 0, revenue: 0 };
    current.tickets += 1;
    current.revenue += row.booking.total ?? 0;
    map.set(period, current);
  }

  return Array.from(map.values()).sort((a, b) => b.period.localeCompare(a.period));
};

const revenueHandler = new Hono<HonoEnv>().get('/', ...RevenueRoutes.getRevenueStats, async (ctx) => {
  const now = new Date();
  const dailyStart = new Date(now);
  dailyStart.setUTCDate(dailyStart.getUTCDate() - 30);

  const monthlyStart = new Date(now);
  monthlyStart.setUTCMonth(monthlyStart.getUTCMonth() - 12);

  const [dailyRows, monthlyRows, yearlyRows] = await Promise.all([
    prisma.ticket.findMany({
      select: { createdAt: true, booking: { select: { total: true } } },
      where: { status: TicketStatus.ISSUED, createdAt: { gte: dailyStart } },
    }),
    prisma.ticket.findMany({
      select: { createdAt: true, booking: { select: { total: true } } },
      where: { status: TicketStatus.ISSUED, createdAt: { gte: monthlyStart } },
    }),
    prisma.ticket.findMany({
      select: { createdAt: true, booking: { select: { total: true } } },
      where: { status: TicketStatus.ISSUED },
    }),
  ]);

  const daily = aggregateRevenue(dailyRows, formatUTCDate);
  const monthly = aggregateRevenue(monthlyRows, formatUTCMonth);
  const yearly = aggregateRevenue(yearlyRows, formatUTCYear);

  return ctx.json(
    {
      data: {
        daily,
        monthly,
        yearly,
      },
    },
    200
  );
});

export default revenueHandler;
