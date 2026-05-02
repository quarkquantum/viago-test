import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAlpha } from '@/middlewares';

export const AlphaAgencyManagerRoutes = {
  listAgencyManagers: createRouteConfig({
    description: 'List agency managers',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved agency managers.',
      },
      ...errorResponses,
    },
    tags: ['agency-manager'],
  }),
  getAgencyManager: createRouteConfig({
    description: 'Get a single agency manager',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved agency manager.',
      },
      ...errorResponses,
    },
    tags: ['agency-manager'],
  }),
  updateAgencyManager: createRouteConfig({
    description: 'Update an agency manager',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully updated agency manager.',
      },
      ...errorResponses,
    },
    tags: ['agency-manager'],
  }),
};