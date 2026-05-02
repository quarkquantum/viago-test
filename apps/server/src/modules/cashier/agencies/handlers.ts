import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { listAgenciesSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { AgencyRoutes } from './routes';

const agencyHandler = new Hono<HonoEnv>().get(
  '/',
  ...AgencyRoutes.listAgencies,
  validator('query', listAgenciesSchema),
  async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { sortBy, sortOrder, q, status } = query;

    const where: Prisma.AgencyWhereInput = {
      ...(status && { status }),
      ...(q && {
        name: { contains: q, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.agency.findMany({
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
  }
);

export default agencyHandler;
