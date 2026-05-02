import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAuthenticated } from '@/middlewares';

export const UserRoutes = {
  getTicket: createRouteConfig({
    description: 'Get a single ticket by ID',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Successfully retrieved ticket.',
      },
      ...errorResponses,
    },
    tags: ['user'],
  }),
  listTickets: createRouteConfig({
    description: "Get current user's tickets",
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Successfully retrieved my tickets.',
      },
      ...errorResponses,
    },
    tags: ['user'],
  }),
  updateFcmToken: createRouteConfig({
    description: 'Update the FCM token for push notifications',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'FCM token updated successfully.',
      },
      ...errorResponses,
    },
    tags: ['user'],
  }),
  user: createRouteConfig({
    description: 'Endpoint to test hono integration',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Successfully integrated with openapi.',
      },
      ...errorResponses,
    },
    tags: ['user'],
  }),
};
