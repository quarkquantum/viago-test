import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const LocationRoutes = {
  listLocations: createRouteConfig({
    description: 'List all agency locations',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved locations.',
      },
      ...errorResponses,
    },
    tags: ['locations'],
  }),
  createLocation: createRouteConfig({
    description: 'Create a new agency location',
    guard: [isAdmin],
    responses: {
      201: {
        description: 'Successfully created location.',
      },
      ...errorResponses,
    },
    tags: ['locations'],
  }),
  getLocation: createRouteConfig({
    description: 'Get a location by ID',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved location.',
      },
      ...errorResponses,
    },
    tags: ['locations'],
  }),
  updateLocation: createRouteConfig({
    description: 'Update a location',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully updated location.',
      },
      ...errorResponses,
    },
    tags: ['locations'],
  }),
  deleteLocation: createRouteConfig({
    description: 'Delete a location',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully deleted location.',
      },
      ...errorResponses,
    },
    tags: ['locations'],
  }),
};
