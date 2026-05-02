import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAlpha } from '@/middlewares';

export const AgencyRoutes = {
  listAgencies: createRouteConfig({
    description: 'List agencies',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved agencies.',
      },
      ...errorResponses,
    },
    tags: ['agency'],
  }),
  getAgency: createRouteConfig({
    description: 'Get agency details',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved agency details.',
      },
      ...errorResponses,
    },
    tags: ['agency'],
  }),
  toggleStatus: createRouteConfig({
    description: 'Toggle agency status',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully updated agency status.',
      },
      ...errorResponses,
    },
    tags: ['agency'],
  }),
};
