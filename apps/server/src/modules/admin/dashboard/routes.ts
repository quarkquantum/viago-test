import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';
import { z } from 'zod';

export const DashboardRoutes = {
  getStats: createRouteConfig({
    description: 'Get dashboard logic',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved dashboard stats.',
      },
      ...errorResponses,
    },
    tags: ['dashboard'],
  }),
};
