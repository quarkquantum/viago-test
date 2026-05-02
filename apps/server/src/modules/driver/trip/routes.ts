import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isDriver } from '@/middlewares';

export const TripRoutes = {
  getRoutes: createRouteConfig({
    description: 'Get all trips routes',
    guard: [isDriver],
    responses: {
      200: {
        description: 'Trips routes retrieved successfully',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  getTrip: createRouteConfig({
    description: 'Get specific trip',
    guard: [isDriver],
    responses: {
      200: {
        description: 'Trip retrieved successsfully',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  getTrips: createRouteConfig({
    description: 'Get all trips',
    guard: [],
    responses: {
      200: {
        description: 'Trips retrieved successfully',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  updateTripStatus: createRouteConfig({
    description: 'Update trip status',
    guard: [],
    responses: {
      200: {
        description: 'Trip status updated successfully',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  updateStationStatus: createRouteConfig({
    description: 'Update station status',
    guard: [],
    responses: {
      200: {
        description: 'Station status updated successfully',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  startTrip: createRouteConfig({
    description: 'Start trip',
    guard: [],
    responses: {
      200: {
        description: 'Trip started successfully',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  startStation: createRouteConfig({
    description: 'Start station',
    guard: [],
    responses: {
      200: {
        description: 'Station started successfully',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  completeTrip: createRouteConfig({
    description: 'Complete trip',
    guard: [],
    responses: {
      200: {
        description: 'Trip completed successfully',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
};
