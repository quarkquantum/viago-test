import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isCashier } from '@/middlewares';

export const TicketRoutes = {
  updateTicket: createRouteConfig({
    description: 'Update a ticket',
    guard: [isCashier],
    responses: {
      200: { description: 'Successfully updated ticket.' },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  cancelTicket: createRouteConfig({
    description: 'Cancel a ticket (ISSUED or RESERVED)',
    guard: [isCashier],
    responses: {
      200: { description: 'Successfully cancelled ticket.' },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  refundTicket: createRouteConfig({
    description: 'Refund a ticket',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully refunded ticket.',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  createTicket: createRouteConfig({
    description: 'Create new ticket or reservation',
    guard: [isCashier],
    responses: {
      201: {
        description: 'Successfully created ticket.',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
  payTicket: createRouteConfig({
    description: 'Pay for a reserved ticket',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully paid for ticket.',
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
  payTicket: createRouteConfig({
    description: 'Pay for a reserved ticket',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully paid for ticket.',
      },
      ...errorResponses,
    },
    tags: ['ticket'],
  }),
};
