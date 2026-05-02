import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const CashierRoutes = {
  createCashier: createRouteConfig({
    description: 'Create a cashier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully created a cashier.',
      },
      ...errorResponses,
    },
    tags: ['cashier'],
  }),
  deleteCashier: createRouteConfig({
    description: 'Delete a cashier',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully deleted a cashier.',
      },
      ...errorResponses,
    },
    tags: ['cashier'],
  }),
  getCashier: createRouteConfig({
    description: 'Get my agency profile with statistics',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved my agency.',
      },
      ...errorResponses,
    },
    tags: ['cashier'],
  }),
  listCashiers: createRouteConfig({
    description: 'List cashiers',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved cashiers.',
      },
      ...errorResponses,
    },
    tags: ['cashier'],
  }),
  updateCashier: createRouteConfig({
    description: 'Update my agency profile',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully updated my agency.',
      },
      ...errorResponses,
    },
    tags: ['cashier'],
  }),
};
