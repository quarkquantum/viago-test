import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isCashier } from '@/middlewares';

export const TicketRoutes = {
  createTicket: createRouteConfig({
    description: 'Create new ticket',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully created new ticket.',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  deleteTicket: createRouteConfig({
    description: 'Delete ticket',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully deleted ticket.',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  getHistory: createRouteConfig({
    description: 'Get tickets history',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully retrieved history.',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  getTicket: createRouteConfig({
    description: 'Get specific ticket with identifier',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully retrieved ticket.',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  getTickets: createRouteConfig({
    description: 'Get all tickets',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully retrieved tickets.',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  updateTicket: createRouteConfig({
    description: 'Update ticket',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully updated ticket.',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
};
