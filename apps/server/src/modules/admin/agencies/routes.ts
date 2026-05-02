import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const AgencyRoutes = {
  ListAgencies: createRouteConfig({
    description: 'List agencies',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved agencies.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
  activateAgency: createRouteConfig({
    description: 'Activate agency',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully activated agency.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
  createAgency: createRouteConfig({
    description: 'Create agency',
    guard: [isAdmin],
    responses: {
      201: {
        description: 'Successfully created agency.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
  deactivateAgency: createRouteConfig({
    description: 'Deactivate agency',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully deactivated agency.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
  deleteAgency: createRouteConfig({
    description: 'Delete agency',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully deleted agency.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
  getAgency: createRouteConfig({
    description: 'Get agency profile with statistics',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved agency.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
  updateAgency: createRouteConfig({
    description: 'Update agency profile',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully updated agency.',
      },
      ...errorResponses,
    },
    tags: ['agencies'],
  }),
};
