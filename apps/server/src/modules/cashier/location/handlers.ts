import type { Prisma } from '@repo/database';
import { prisma } from '@repo/database';
import { baseQuerySchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { getPagination } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';

const locationHandler = new Hono<HonoEnv>().get(
  '/',
  validator('query', baseQuerySchema),
  async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);

    const [data, total] = await Promise.all([
      prisma.agencyLocation.findMany({
        include: {
          city: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      prisma.agencyLocation.count(),
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

export default locationHandler;