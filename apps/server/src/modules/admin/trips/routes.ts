import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const TripRoutes = {
  createTrip: createRouteConfig({
    description: 'Create a new trip',
    guard: [isAdmin],
    responses: {
      201: {
        description: 'Successfully created trip.',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  deleteTrip: createRouteConfig({
    description: 'Delete specific trip with identifier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully deleted trip.',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  getTrip: createRouteConfig({
    description: 'Get specific trip with identifier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved trip.',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  listTrips: createRouteConfig({
    description: 'List all trips',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved trips.',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  updateTrip: createRouteConfig({
    description: 'Update specific trip with identifier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully updated trip.',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
};
