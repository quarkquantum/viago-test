import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAgency } from '@/middlewares';

export const DashboardRoutes = {
  getStats: createRouteConfig({
    description: 'Get dashboard stats',
    guard: [isAgency],
    responses: {
      200: {
        description: 'Successfully retrieved dashboard stats.',
      },
      ...errorResponses,
    },
    tags: ['dashboard'],
  }),
};
