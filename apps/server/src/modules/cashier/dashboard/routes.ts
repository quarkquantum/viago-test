import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isCashier } from '@/middlewares';

export const DashboardRoutes = {
  getDashboard: createRouteConfig({
    description: 'Get cashier dashboard',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully retrieved cashier dashboard.',
      },
      ...errorResponses,
    },
    tags: ['cashier', 'dashboard'],
  }),
};
