import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAgency } from '@/middlewares';

export const CashierRoutes = {
  createCashier: createRouteConfig({
    description: 'Create a cashier',
    guard: [isAgency],
    responses: {
      201: { description: 'Successfully created cashier.' },
      ...errorResponses,
    },
    tags: ['cashier'],
  }),
  listCashiers: createRouteConfig({
    description: 'List cashiers',
    guard: [isAgency],
    responses: {
      200: { description: 'Successfully retrieved cashiers.' },
      ...errorResponses,
    },
    tags: ['cashier'],
  }),
  getCashier: createRouteConfig({
    description: 'Get cashier by identifier',
    guard: [isAgency],
    responses: {
      200: { description: 'Successfully retrieved cashier.' },
      ...errorResponses,
    },
    tags: ['cashier'],
  }),
  updateCashier: createRouteConfig({
    description: 'Update a cashier',
    guard: [isAgency],
    responses: {
      200: { description: 'Successfully updated cashier.' },
      ...errorResponses,
    },
    tags: ['cashier'],
  }),
  deleteCashier: createRouteConfig({
    description: 'Delete a cashier',
    guard: [isAgency],
    responses: {
      200: { description: 'Successfully deleted cashier.' },
      ...errorResponses,
    },
    tags: ['cashier'],
  }),
};
