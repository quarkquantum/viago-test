import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const BookingsRoutes = {
  getBooking: createRouteConfig({
    description: 'Get booking by identifier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved booking.',
      },
      ...errorResponses,
    },
    tags: ['bookings'],
  }),
  listBookings: createRouteConfig({
    description: 'List all bookings for the admin',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved bookings.',
      },
      ...errorResponses,
    },
    tags: ['bookings'],
  }),
  updateBooking: createRouteConfig({
    description: 'Update booking status',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully updated booking.',
      },
      ...errorResponses,
    },
    tags: ['bookings'],
  }),
};
