import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isDriver } from '@/middlewares/guard/is-driver';

const MeRoutes = {
  getMe: createRouteConfig({
    description: 'Get current user',
    guard: [isDriver],
    responses: {
      200: {
        description: 'Successfully retrieved current user.',
      },
      ...errorResponses,
    },
    tags: ['user'],
  }),
  edit: createRouteConfig({
    description: 'Edit current user',
    guard: [isDriver],
    responses: {
      200: {
        description: 'Successfully edited current user.',
      },
      ...errorResponses,
    },
    tags: ['user'],
  }),
  dashboard: createRouteConfig({
    description: "Get driver's dashboard",
    guard: [isDriver],
    responses: {
      200: {
        description: "Successfully fetched driver's dashboard",
      },
      ...errorResponses,
    },
    tags: ['dashboard'],
  }),
  stats: createRouteConfig({
    description: "Get driver's statistics",
    guard: [isDriver],
    responses: {
      200: {
        description: "Successfully fetched driver's statistics",
      },
      ...errorResponses,
    },
    tags: ['stats'],
  }),
  updateFcmToken: createRouteConfig({
    description: 'Update the FCM token for push notifications',
    guard: [isDriver],
    responses: {
      200: {
        description: 'FCM token updated successfully.',
      },
      ...errorResponses,
    },
    tags: ['user'],
  }),
};

export default MeRoutes;
