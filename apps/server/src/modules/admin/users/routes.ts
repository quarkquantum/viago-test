import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAdmin } from '@/middlewares';

export const UserRoutes = {
  banUser: createRouteConfig({
    description: 'Ban user',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully banned user.',
      },
      ...errorResponses,
    },
    tags: ['users'],
  }),
  createUser: createRouteConfig({
    description: 'Create user',
    guard: [isAdmin],
    responses: {
      201: {
        description: 'Successfully created user.',
      },
      ...errorResponses,
    },
    tags: ['users'],
  }),
  deleteUser: createRouteConfig({
    description: 'Delete user',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully deleted user.',
      },
      ...errorResponses,
    },
    tags: ['users'],
  }),
  getUser: createRouteConfig({
    description: 'Get user',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully got user.',
      },
      ...errorResponses,
    },
    tags: ['users'],
  }),
  listUsers: createRouteConfig({
    description: 'List users',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully listed users.',
      },
      ...errorResponses,
    },
    tags: ['users'],
  }),
  sendResetPasswordEmail: createRouteConfig({
    description: 'Send reset password email',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully sent reset password email.',
      },
      ...errorResponses,
    },
    tags: ['users'],
  }),
  resetPassword: createRouteConfig({
    description: 'Reset user password',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully reset user password.',
      },
      ...errorResponses,
    },
    tags: ['users'],
  }),
  unbanUser: createRouteConfig({
    description: 'Unban user',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully unbanned user.',
      },
      ...errorResponses,
    },
    tags: ['users'],
  }),
  updateUser: createRouteConfig({
    description: 'Update user',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully updated user.',
      },
      ...errorResponses,
    },
    tags: ['users'],
  }),
  listUserSessions: createRouteConfig({
    description: 'List user sessions',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully listed user sessions.',
      },
      ...errorResponses,
    },
    tags: ['users'],
  }),
  revokeUserSession: createRouteConfig({
    description: 'Revoke user session',
    guard: [isAdmin],
    responses: {
      200: {
        description: 'Successfully revoked user session.',
      },
      ...errorResponses,
    },
    tags: ['users'],
  }),
};
