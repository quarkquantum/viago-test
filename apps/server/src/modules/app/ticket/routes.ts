import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAuthenticated } from '@/middlewares';

export const TicketRoutes = {
  lookupTickets: createRouteConfig({
    description: 'Lookup tickets by email or phone number (guest access)',
    guard: [],
    responses: {
      200: {
        description: 'Tickets retrieved successfully',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  getTicket: createRouteConfig({
    description: 'Get specific Ticket',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Ticket retrieved successsfully',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  getTicketByIdentifier: createRouteConfig({
    description: 'Get ticket by identifier (id, bookingId, or seatId)',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Ticket retrieved successfully',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  refundTicket: createRouteConfig({
    description: 'Refund a ticket',
    guard: [isAuthenticated],
    responses: {
      200: {
        description: 'Ticket refunded successfully',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
};
