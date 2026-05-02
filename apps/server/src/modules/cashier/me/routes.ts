import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isCashier } from '@/middlewares';

export const MeRoutes = {
  getMe: createRouteConfig({
    description: 'Get my profile',
    guard: [isCashier],
    responses: {
      200: {
        description: 'Successfully retrieved my profile.',
      },
      ...errorResponses,
    },
    tags: ['me'],
  }),
};
