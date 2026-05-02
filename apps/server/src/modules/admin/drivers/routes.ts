import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const DriverRoutes = {
  createDriver: createRouteConfig({
    description: 'Create driver',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully created driver.',
      },
      ...errorResponses,
    },
    tags: ['driver'],
  }),
  deleteDriver: createRouteConfig({
    description: 'Delete driver by identifier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully deleted driver.',
      },
      ...errorResponses,
    },
    tags: ['driver'],
  }),
  getDriver: createRouteConfig({
    description: 'Get driver by identifier',
    guard: [isAdmin],
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
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved drivers.',
      },
      ...errorResponses,
    },
    tags: ['driver'],
  }),
  updateDriver: createRouteConfig({
    description: 'Update driver by identifier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully updated driver.',
      },
      ...errorResponses,
    },
    tags: ['driver'],
  }),
};
