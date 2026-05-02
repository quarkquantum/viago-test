import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAgency } from '@/middlewares';

export const PassengerRoutes = {
  getPassenger: createRouteConfig({
    description: 'Get passenger by identifier',
    guard: [isAgency],
    responses: {
      200: {
        description: 'Successfully retrieved passenger.',
      },
      ...errorResponses,
    },
    tags: ['passenger'],
  }),
};
