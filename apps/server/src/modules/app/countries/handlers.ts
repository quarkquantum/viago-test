import { prisma } from '@repo/database';
import { Hono } from 'hono';
import type { HonoEnv } from '@/lib/hono/context';
import { CountriesRoutes } from './routes';

const countriesHandler = new Hono<HonoEnv>().get('/', ...CountriesRoutes.listCountries, async (ctx) => {
  const countries = await prisma.country.findMany({
    orderBy: { name: 'asc' },
    where: { isEnabled: true },
  });

  return ctx.json({ data: countries }, 200);
});

export default countriesHandler;
