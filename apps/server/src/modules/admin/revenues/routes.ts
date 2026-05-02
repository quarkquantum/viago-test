import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const RevenueRoutes = {
  getRevenueStats: createRouteConfig({
    description: 'Get revenue statistics.',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved revenue stats.',
      },
      ...errorResponses,
    },
    tags: ['revenues'],
  }),
};
