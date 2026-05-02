import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAlpha } from '@/middlewares';

export const AlphaAgencyManagementRoutes = {
  listAgencies: createRouteConfig({
    description: 'List all agencies',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved agencies.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
  getAgency: createRouteConfig({
    description: 'Get agency details',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved agency.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
  suspendAgency: createRouteConfig({
    description: 'Suspend an agency',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully suspended agency.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
  reactivateAgency: createRouteConfig({
    description: 'Reactivate a suspended agency',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully reactivated agency.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
  deleteAgency: createRouteConfig({
    description: 'Delete an agency (soft delete)',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully deleted agency.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
};
