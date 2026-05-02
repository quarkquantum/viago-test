import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { stationQuerySchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { getPagination } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { StationRoutes } from './routes';

const stationHandler = new Hono<HonoEnv>().get(
  '/',
  ...StationRoutes.getStations,
  validator('query', stationQuerySchema),
  async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder, minPrice, maxPrice, exactPrice, departureFrom, departureTo } = query;

    const where: Prisma.StationWhereInput = {
      ...(minPrice && { startingPrice: { gte: minPrice } }),
      ...(maxPrice && { startingPrice: { lte: maxPrice } }),
      ...(exactPrice && { startingPrice: { equals: exactPrice } }),
      ...(departureFrom && { departureTime: { gte: departureFrom } }),
      ...(departureTo && { departureTime: { lte: departureTo } }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { city: { name: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      prisma.station.findMany({
        include: {
          city: true,
          trip: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
        where,
      }),
      prisma.station.count({ where }),
    ]);

    return ctx.json(
      {
        data,
        pagination: {
          skip,
          take,
          total,
        },
      },
      200
    );
  }
);

export default stationHandler;
