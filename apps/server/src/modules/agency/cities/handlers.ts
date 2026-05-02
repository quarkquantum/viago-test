import { type Prisma, prisma } from '@repo/database';
import { listCitiesSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getPagination, getPaginationMeta } from '@/helpers/pagination';
import type { HonoEnv } from '@/lib/hono/context';
import { CitiesRoutes } from './routes';

const citiesHandler = new Hono<HonoEnv>()
  .get('/', ...CitiesRoutes.listCities, validator('query', listCitiesSchema), async (ctx) => {
    const query = ctx.req.valid('query');
    const { skip, take } = getPagination(query);
    const { q, country } = query;

    const where: Prisma.CityWhereInput = {
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { country: { name: { contains: q, mode: 'insensitive' } } },
          { country: { code: { contains: q, mode: 'insensitive' } } },
          { country: { native: { contains: q, mode: 'insensitive' } } },
        ],
      }),
      ...(country && {
        country: {
          OR: [{ name: country }, { code: country }, { native: country }],
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.city.findMany({
        where,
        take,
        skip,
        orderBy: { name: 'asc' },
      }),
      prisma.city.count({ where }),
    ]);

    const pagination = getPaginationMeta({
      limit: query.limit,
      page: query.page,
      total,
    });

    return ctx.json({ data, pagination });
  })
  .get('/:identifier', ...CitiesRoutes.getCity, async (ctx) => {
    const t = await useTranslation(ctx);
    const { identifier } = ctx.req.param();

    const city = await prisma.city.findFirst({ where: { OR: [{ id: identifier }, { name: identifier }] } });

    if (!city) {
      throw new AppError({
        code: 'database:not_found',
        entityType: 'city',
        message: t('city.api.error.not_found'),
      });
    }

    return ctx.json(city);
  });

export default citiesHandler;
