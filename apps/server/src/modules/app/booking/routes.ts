import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAuthenticated } from '@/middlewares';

export const BookingRoutes = {
  createBooking: createRouteConfig({
    description: 'Create new booking',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Successfully created new booking.',
      },
      ...errorResponses,
    },
    tags: ['booking'],
  }),
  deleteBooking: createRouteConfig({
    description: 'Delete existing booking',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Successfully deleted the booking.',
      },
      ...errorResponses,
    },
    tags: ['booking'],
  }),
  getBooking: createRouteConfig({
    description: 'Get specific booking',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Successfully integrated with openapi.',
      },
      ...errorResponses,
    },
    tags: ['booking'],
  }),
  getBookings: createRouteConfig({
    description: 'Get all my bookings',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Successfully integrated with openapi.',
      },
      ...errorResponses,
    },
    tags: ['booking'],
  }),
  updateBooking: createRouteConfig({
    description: 'Update existing booking',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Successfully updated the booking.',
      },
      ...errorResponses,
    },
    tags: ['booking'],
  }),
};
