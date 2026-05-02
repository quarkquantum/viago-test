import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const AgencyRequestRoutes = {
  listRequests: createRouteConfig({
    description: 'List agency registration requests',
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
    guard: [isAdmin],
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
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully rejected agency request.',
      },
      ...errorResponses,
    },
    tags: ['agency-requests'],
  }),
};
