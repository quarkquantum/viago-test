import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAlpha } from '@/middlewares';

export const AlphaAgencyRequestRoutes = {
  listRequests: createRouteConfig({
    description: 'List agency registration requests',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved agency requests.',
      },
      ...errorResponses,
    },
    tags: ['agency-requests'],
  }),
  getRequest: createRouteConfig({
    description: 'Get agency request details',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved agency request.',
      },
      ...errorResponses,
    },
    tags: ['agency-requests'],
  }),
  approveRequest: createRouteConfig({
    description: 'Approve agency registration request',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully approved agency request.',
      },
      ...errorResponses,
    },
    tags: ['agency-requests'],
  }),
  rejectRequest: createRouteConfig({
    description: 'Reject agency registration request',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully rejected agency request.',
      },
      ...errorResponses,
    },
    tags: ['agency-requests'],
  }),
};
