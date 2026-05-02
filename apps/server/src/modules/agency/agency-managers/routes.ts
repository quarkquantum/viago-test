import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAgency } from '@/middlewares';

export const ManagerRoutes = {
  createManager: createRouteConfig({
    description: 'Create an agency manager',
    guard: [isAgency],
    responses: {
      201: { description: 'Successfully created manager.' },
      ...errorResponses,
    },
    tags: ['manager'],
  }),
  listManagers: createRouteConfig({
    description: 'List agency managers',
    guard: [isAgency],
    responses: {
      200: { description: 'Successfully retrieved managers.' },
      ...errorResponses,
    },
    tags: ['manager'],
  }),
  getManager: createRouteConfig({
    description: 'Get manager by identifier',
    guard: [isAgency],
    responses: {
      200: { description: 'Successfully retrieved manager.' },
      ...errorResponses,
    },
    tags: ['manager'],
  }),
  updateManager: createRouteConfig({
    description: 'Update a manager',
    guard: [isAgency],
    responses: {
      200: { description: 'Successfully updated manager.' },
      ...errorResponses,
    },
    tags: ['manager'],
  }),
  deleteManager: createRouteConfig({
    description: 'Delete a manager',
    guard: [isAgency],
    responses: {
      200: { description: 'Successfully deleted manager.' },
      ...errorResponses,
    },
    tags: ['manager'],
  }),
};
