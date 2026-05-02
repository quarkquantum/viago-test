import { Hono } from 'hono';
import type { HonoEnv } from '@/lib/hono/context';

const pricingHandler = new Hono<HonoEnv>().get('/', (ctx) => {
  return ctx.json({ data: [], pagination: { limit: 10, page: 1, total: 0 } });
});

export default pricingHandler;
