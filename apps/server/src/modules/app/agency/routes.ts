import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';

export const AgencyRoutes = {
  activateAgency: createRouteConfig({
    description: 'Activate an agency',
    guard: [],
    responses: {
      200: {
        description: 'Agency activated successfully.',
      },
      ...errorResponses,
    },
    tags: ['agency'],
  }),
  agency: createRouteConfig({
    description: 'Endpoint to test hono integration',
    guard: [],
    responses: {
      200: {
        description: 'Successfully integrated with openapi.',
      },
      ...errorResponses,
    },
    tags: ['agency'],
  }),
  deactivateAgency: createRouteConfig({
    description: 'Deactivate an agency',
    guard: [],
    responses: {
      200: {
        description: 'Agency deactivated successfully.',
      },
      ...errorResponses,
    },
    tags: ['agency'],
  }),
};
