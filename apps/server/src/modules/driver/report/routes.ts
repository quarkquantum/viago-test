import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isDriver } from '@/middlewares';

export const ReportRoutes = {
  listReports: createRouteConfig({
    description: 'List driver reports',
    guard: [isDriver],
    responses: {
      200: {
        description: 'Reports retrieved successfully.',
      },
      ...errorResponses,
    },
    tags: ['driver-report'],
  }),
  createReport: createRouteConfig({
    description: 'Report an incident during a trip (driver)',
    guard: [isDriver],
    responses: {
      201: {
        description: 'Report created successfully.',
      },
      ...errorResponses,
    },
    tags: ['driver-report'],
  }),
};
