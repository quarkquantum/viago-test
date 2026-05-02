import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const PassengerRoutes = {
  createPassenger: createRouteConfig({
    description: 'Create a new passenger',
    guard: [isAdmin],
    responses: {
      201: {
        description: 'Successfully created passenger.',
      },
      ...errorResponses,
    },
    tags: ['passenger'],
  }),
  deletePassenger: createRouteConfig({
    description: 'Delete passenger by identifier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully deleted passenger.',
      },
      ...errorResponses,
    },
    tags: ['passenger'],
  }),
  getPassenger: createRouteConfig({
    description: 'Get passenger by identifier',
    guard: [isAdmin],
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
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved passengers.',
      },
      ...errorResponses,
    },
    tags: ['passenger'],
  }),
  updatePassenger: createRouteConfig({
    description: 'Update passenger by identifier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully updated passenger.',
      },
      ...errorResponses,
    },
    tags: ['passenger'],
  }),
};
