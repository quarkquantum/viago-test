import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAuthenticated } from '@/middlewares/guard';

export const InitPaymentRoutes = {
  getPaymentStatus: createRouteConfig({
    description: 'Get status of a specific payment/transaction',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Payment status retrieved successfully.',
      },
      ...errorResponses,
    },
    tags: ['payment'],
  }),
  initPayment: createRouteConfig({
    description: 'Initialize a new payment for a booking',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Payment initialized successfully. Returns authorization URL.',
      },
      ...errorResponses,
    },
    tags: ['payment'],
  }),
};
