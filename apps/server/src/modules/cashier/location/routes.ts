import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAuthenticated } from '@/middlewares';

export const LocationRoutes = {
  getLocations: createRouteConfig({
    description: 'Get all locations',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Locations retrieved successfully',
      },
      ...errorResponses,
    },
    tags: ['location'],
  }),
};