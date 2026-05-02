import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAuthenticated } from '@/middlewares';

export const ReportRoutes = {
  createReport: createRouteConfig({
    description: 'Report a trip the passenger is currently in',
    guard: [isAuthenticated],
    responses: {
      201: {
        description: 'Report created successfully.',
      },
      ...errorResponses,
    },
    tags: ['report'],
  }),
};
