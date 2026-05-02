import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const BusesRoutes = {
  createBus: createRouteConfig({
    description: 'Create bus',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully created bus.',
      },
      ...errorResponses,
    },
    tags: ['buses'],
  }),
  deleteBus: createRouteConfig({
    description: 'Delete bus by identifier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully deleted bus.',
      },
      ...errorResponses,
    },
    tags: ['buses'],
  }),
  getBus: createRouteConfig({
    description: 'Get bus by identifier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved bus.',
      },
      ...errorResponses,
    },
    tags: ['buses'],
  }),
  getListBuses: createRouteConfig({
    description: 'Get all buses',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved all buses.',
      },
      ...errorResponses,
    },
    tags: ['buses'],
  }),
};
