import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAlpha } from '@/middlewares';

export const StatsRoutes = {
  getStats: createRouteConfig({
    description: 'Get platform-wide statistics including revenues',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved platform stats.',
      },
      ...errorResponses,
    },
    tags: ['alpha-stats'],
  }),
};
