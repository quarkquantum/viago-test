import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isCashier } from '@/middlewares';

export const AgencyRoutes = {
  listAgencies: createRouteConfig({
    description: 'List agencies',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully retrieved agencies.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
};
