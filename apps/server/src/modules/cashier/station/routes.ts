import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAuthenticated } from '@/middlewares';

export const StationRoutes = {
  getStations: createRouteConfig({
    description: 'Get all stations',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Stations retrieved successfully',
      },
      ...errorResponses,
    },
    tags: ['station'],
  }),
};
