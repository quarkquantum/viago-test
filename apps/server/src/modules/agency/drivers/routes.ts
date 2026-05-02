import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAgency } from '@/middlewares';

export const DriverRoutes = {
  createDriver: createRouteConfig({
    description: 'Create a driver',
    guard: [isAgency],
    responses: {
      201: {
        description: 'Successfully created driver.',
      },
      ...errorResponses,
    },
    tags: ['driver'],
  }),
  getDriver: createRouteConfig({
    description: 'Get driver by identifier',
    guard: [isAgency],
    responses: {
      200: {
        description: 'Successfully retrieved driver.',
      },
      ...errorResponses,
    },
    tags: ['driver'],
  }),
  listDrivers: createRouteConfig({
    description: 'List drivers',
    guard: [isAgency],
    responses: {
      200: {
        description: 'Successfully retrieved drivers.',
      },
      ...errorResponses,
    },
    tags: ['driver'],
  }),
  deleteDriver: createRouteConfig({
    description: 'Delete a driver',
    guard: [isAgency],
    responses: {
      200: {
        description: 'Successfully deleted driver.',
      },
      ...errorResponses,
    },
    tags: ['driver'],
  }),
};
