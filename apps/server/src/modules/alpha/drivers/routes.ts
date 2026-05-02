import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAlpha } from '@/middlewares';

export const DriverRoutes = {
  createDriver: createRouteConfig({
    description: 'Create driver',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully created driver.',
      },
      ...errorResponses,
    },
    tags: ['alpha-driver'],
  }),
  deleteDriver: createRouteConfig({
    description: 'Delete driver by identifier',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully deleted driver.',
      },
      ...errorResponses,
    },
    tags: ['alpha-driver'],
  }),
  getDriver: createRouteConfig({
    description: 'Get driver by identifier',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved driver.',
      },
      ...errorResponses,
    },
    tags: ['alpha-driver'],
  }),
  listDrivers: createRouteConfig({
    description: 'List drivers',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved drivers.',
      },
      ...errorResponses,
    },
    tags: ['alpha-driver'],
  }),
  updateDriver: createRouteConfig({
    description: 'Update driver by identifier',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully updated driver.',
      },
      ...errorResponses,
    },
    tags: ['alpha-driver'],
  }),
};
