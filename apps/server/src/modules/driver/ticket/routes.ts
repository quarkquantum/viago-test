import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isDriver } from '@/middlewares';

export const TicketRoutes = {
  getTicket: createRouteConfig({
    description: 'Get specific Ticket',
    guard: [isDriver],
    responses: {
      200: {
        description: 'Ticket retrieved successsfully',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  scan: createRouteConfig({
    description: 'Scan a Ticket',
    guard: [isDriver],
    responses: {
      200: {
        description: 'Ticket scanned successsfully',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
};
