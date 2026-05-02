import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAuthenticated } from '@/middlewares';
export const BusRoutes = {
  createBus: createRouteConfig({
    description: 'Create new bus',
    guard: [],
    responses: {
      200: {
        description: 'Bus created successfully.',
      },
      ...errorResponses,
    },
    tags: ['bus'],
  }),
  deleteBus: createRouteConfig({
    description: 'Delete existing bus',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Bus deleted successfully',
      },
      ...errorResponses,
    },
    tags: ['bus'],
  }),
  getBus: createRouteConfig({
    description: 'Get specific bus',
    guard: [],
    responses: {
      200: {
        description: 'Bus retrieved successsfully',
      },
      ...errorResponses,
    },
    tags: ['bus'],
  }),
  getBuses: createRouteConfig({
    description: 'Get all buses',
    guard: [],
    responses: {
      200: {
        description: 'Buses retrieved successfully',
      },
      ...errorResponses,
    },
    tags: ['bus'],
  }),
  updateBus: createRouteConfig({
    description: 'Update existing bus',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Bus updated successfully.',
      },
      ...errorResponses,
    },
    tags: ['bus'],
  }),
};
