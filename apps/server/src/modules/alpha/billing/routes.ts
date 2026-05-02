import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAlpha } from '@/middlewares';

export const AlphaBillingRoutes = {
  listSubscriptions: createRouteConfig({
    description: 'List all agency subscriptions with billing info.',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved subscriptions.',
      },
      ...errorResponses,
    },
    tags: ['alpha-billing'],
  }),
  suspendSubscription: createRouteConfig({
    description: 'Suspend an agency subscription.',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully suspended subscription.',
      },
      ...errorResponses,
    },
    tags: ['alpha-billing'],
  }),
  reactivateSubscription: createRouteConfig({
    description: 'Reactivate an agency subscription.',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully reactivated subscription.',
      },
      ...errorResponses,
    },
    tags: ['alpha-billing'],
  }),
  extendTrial: createRouteConfig({
    description: 'Extend trial period for a subscription.',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully extended trial period.',
      },
      ...errorResponses,
    },
    tags: ['alpha-billing'],
  }),
};