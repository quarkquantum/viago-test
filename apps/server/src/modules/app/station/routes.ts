import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAuthenticated } from '@/middlewares';

export const StationRoutes = {
  createStation: createRouteConfig({
    description: 'Create new station',
    guard: [],
    responses: {
      200: {
        description: 'Station created successfully.',
      },
      ...errorResponses,
    },
    tags: ['station'],
  }),
  deleteStation: createRouteConfig({
    description: 'Delete existing station',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Station deleted successfully',
      },
      ...errorResponses,
    },
    tags: ['station'],
  }),
  getStation: createRouteConfig({
    description: 'Get specific Station',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Station retrieved successsfully',
      },
      ...errorResponses,
    },
    tags: ['station'],
  }),
  getStations: createRouteConfig({
    description: 'Get all stations',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Stations retrieved successfully',
      },
      ...errorResponses,
    },
    tags: ['station'],
  }),
  updateStation: createRouteConfig({
    description: 'Update existing Station',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Station updated successfully.',
      },
      ...errorResponses,
    },
    tags: ['station'],
  }),
};
