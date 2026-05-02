import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';

export const CitiesRoutes = {
  listCities: createRouteConfig({
    description: 'List cities',
    responses: {
      200: {
        description: 'Successfully retrieved cities list.',
      },
      ...errorResponses,
    },
    tags: ['cities'],
  }),
  getCity: createRouteConfig({
    description: 'Get a city',
    responses: {
      200: {
        description: 'Successfully retrieved city.',
      },
      ...errorResponses,
    },
    tags: ['cities'],
  }),
};
