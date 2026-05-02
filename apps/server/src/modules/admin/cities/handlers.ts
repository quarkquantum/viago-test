import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { listCitiesSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { CityRoutes } from './routes';

const cityHandler = new Hono<HonoEnv>().get(
  '/',
  ...CityRoutes.listCities,
  validator('query', listCitiesSchema),
  async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { q, country } = query;

    const where: Prisma.CityWhereInput = {
      ...(country && { countryCode: country }),
      ...(q && {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.city.findMany({
        skip,
        take,
        where,
      }),
      prisma.city.count({ where }),
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
  }
);

export default cityHandler;
