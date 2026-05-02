import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAlpha } from '@/middlewares';

export const AdminRoutes = {
  createAdmin: createRouteConfig({
    description: 'Create admin',
    guard: [isAlpha],
    responses: {
      201: {
        description: 'Successfully created admin.',
      },
      ...errorResponses,
    },
    tags: ['alpha-admin'],
  }),
  getAdmin: createRouteConfig({
    description: 'Get admin',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved admin.',
      },
      ...errorResponses,
    },
    tags: ['alpha-admin'],
  }),
  listAdmins: createRouteConfig({
    description: 'List admins',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully retrieved admins.',
      },
      ...errorResponses,
    },
    tags: ['alpha-admin'],
  }),
  updateAdmin: createRouteConfig({
    description: 'Update admin',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully updated admin.',
      },
      ...errorResponses,
    },
    tags: ['alpha-admin'],
  }),
  deleteAdmin: createRouteConfig({
    description: 'Delete admin',
    guard: [isAlpha],
    responses: {
      200: {
        description: 'Successfully deleted admin.',
      },
      ...errorResponses,
    },
    tags: ['alpha-admin'],
  }),
};
