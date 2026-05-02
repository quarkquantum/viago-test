import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isCashier } from '@/middlewares';

export const PassengerRoutes = {
  getPassenger: createRouteConfig({
    description: 'Get passenger by identifier',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully retrieved passenger.',
      },
      ...errorResponses,
    },
    tags: ['passenger'],
  }),
  listPassengers: createRouteConfig({
    description: 'List passengers',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully retrieved passengers.',
      },
      ...errorResponses,
    },
    tags: ['passenger'],
  }),
};
