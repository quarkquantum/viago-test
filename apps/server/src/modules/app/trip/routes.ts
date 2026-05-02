import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAuthenticated } from '@/middlewares';
export const TripRoutes = {
  createTrip: createRouteConfig({
    guard: [],
    description: 'Create new trip',
    responses: {
      200: {
        description: 'Trip created successfully.',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  getRoutes: createRouteConfig({
    guard: [],
    description: 'Get all trips routes',
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
    guard: [],
    responses: {
      200: {
        description: 'Trip retrieved successsfully',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  getTripAvailableSeats: createRouteConfig({
    description: 'Get Trip Available Seats',
    guard: [],
    responses: {
      200: {
        description: 'Available seats retrieved successfully',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
  getTripStations: createRouteConfig({
    description: 'Get Trip Stations',
    guard: [],
    responses: {
      200: {
        description: 'Trip stations retrieved successfully',
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
  updateTrip: createRouteConfig({
    description: 'Update existing trip',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Trip updated successfully.',
      },
      ...errorResponses,
    },
    tags: ['trip'],
  }),
};
