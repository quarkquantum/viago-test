import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const AgencyManagerRoutes = {
  createAgencyManager: createRouteConfig({
    description: 'Create an agency manager',
    guard: [isAdmin],
    responses: {
      201: {
        description: 'Successfully created an agency manager.',
      },
      ...errorResponses,
    },
    tags: ['agency-manager'],
  }),
  listAgencyManagers: createRouteConfig({
    description: 'List agency managers',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved agency managers.',
      },
      ...errorResponses,
    },
    tags: ['agency-manager'],
  }),
  getAgencyManager: createRouteConfig({
    description: 'Get an agency manager',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully retrieved an agency manager.',
      },
      ...errorResponses,
    },
    tags: ['agency-manager'],
  }),
  updateAgencyManager: createRouteConfig({
    description: 'Update an agency manager',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully updated an agency manager.',
      },
      ...errorResponses,
    },
    tags: ['agency-manager'],
  }),
  deleteAgencyManager: createRouteConfig({
    description: 'Delete an agency manager',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully deleted an agency manager.',
      },
      ...errorResponses,
    },
    tags: ['agency-manager'],
  }),
};
