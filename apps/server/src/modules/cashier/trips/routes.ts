import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isCashier } from '@/middlewares';

export const TripRoutes = {
  getTripAvailableSeats: createRouteConfig({
    description: 'Get available seats for a trip segment',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully retrieved available seats.',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  getTrip: createRouteConfig({
    description: 'Get specific trip with identifier',
    guard: [isCashier],
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
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully retrieved trips.',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
};
