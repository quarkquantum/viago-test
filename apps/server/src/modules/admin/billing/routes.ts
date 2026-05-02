import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const BillingRoutes = {
  listSubscriptions: createRouteConfig({
    description: 'List all agency subscriptions with billing info.',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved subscriptions.',
      },
      ...errorResponses,
    },
    tags: ['billing'],
  }),
  suspendSubscription: createRouteConfig({
    description: 'Suspend an agency subscription.',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully suspended subscription.',
      },
      ...errorResponses,
    },
    tags: ['billing'],
  }),
  reactivateSubscription: createRouteConfig({
    description: 'Reactivate an agency subscription.',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully reactivated subscription.',
      },
      ...errorResponses,
    },
    tags: ['billing'],
  }),
  extendTrial: createRouteConfig({
    description: 'Extend trial period for a subscription.',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully extended trial period.',
      },
      ...errorResponses,
    },
    tags: ['billing'],
  }),
};
