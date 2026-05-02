import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';

export const CountryRoutes = {
  listCountries: createRouteConfig({
    description: 'List countries.',
    responses: {
      200: {
        description: 'Successfully retrieved countries.',
      },
      ...errorResponses,
    },
    tags: ['countries'],
  }),
};
