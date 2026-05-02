import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';

export const WebhookRoutes = {
  webhook: createRouteConfig({
    guard: [], // Webhooks should be public, but verified via signature
    tags: ['payment'],
    description: 'NotchPay webhook endpoint for payment status updates',
    responses: {
      200: {
        description: 'Webhook processed successfully.',
      },
      ...errorResponses,
    },
  }),
};
