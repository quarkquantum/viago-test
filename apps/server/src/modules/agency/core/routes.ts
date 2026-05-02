import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAgency } from '@/middlewares';

export const MeRoutes = {
  getMyAgency: createRouteConfig({
    description: 'Get my agency profile with statistics',
    guard: [isAgency],
    responses: {
      200: {
        description: 'Successfully retrieved my agency.',
      },
      ...errorResponses,
    },
    tags: ['dashboard'],
  }),
  updateMyAgency: createRouteConfig({
    description: 'Update my agency profile',
    guard: [isAgency],
    responses: {
      200: {
        description: 'Successfully updated my agency.',
      },
      ...errorResponses,
    },
    tags: ['agency'],
  }),
};
