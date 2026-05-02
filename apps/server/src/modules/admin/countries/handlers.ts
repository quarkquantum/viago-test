import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { listCountriesSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { CountryRoutes } from './routes';

const countryHandler = new Hono<HonoEnv>().get(
  '/',
  ...CountryRoutes.listCountries,
  validator('query', listCountriesSchema),
  async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { q } = query;

    const where: Prisma.CountryWhereInput = {
      isEnabled: true,
      ...(q && {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.country.findMany({
        skip,
        take,
        where,
        orderBy: { name: 'asc' },
      }),
      prisma.country.count({ where }),
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

export default countryHandler;
