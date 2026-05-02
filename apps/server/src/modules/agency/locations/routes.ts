import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAgency } from '@/middlewares';

export const LocationRoutes = {
  listLocations: createRouteConfig({
    description: 'List all locations for the agency',
    guard: [isAgency],
    responses: {
      200: {
        description: 'Successfully retrieved locations.',
      },
      ...errorResponses,
    },
    tags: ['locations'],
  }),
  createLocation: createRouteConfig({
    description: 'Create a new location',
    guard: [isAgency],
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
    guard: [isAgency],
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
    guard: [isAgency],
    responses: {
      200: {
        description: 'Successfully updated location.',
      },
      ...errorResponses,
    },
    tags: ['locations'],
  }),
};
