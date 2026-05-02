import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const CityRoutes = {
  listCities: createRouteConfig({
    description: 'List cities',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved cities.',
      },
      ...errorResponses,
    },
    tags: ['cities'],
  }),
};
