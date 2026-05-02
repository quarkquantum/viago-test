import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';

export const CountriesRoutes = {
  listCountries: createRouteConfig({
    description: 'List all countries',
    responses: {
      200: {
        description: 'Successfully retrieved countries.',
      },
      ...errorResponses,
    },
    tags: ['countries'],
  }),
};
