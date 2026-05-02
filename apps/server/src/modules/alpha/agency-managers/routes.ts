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
};