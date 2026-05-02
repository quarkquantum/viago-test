import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isDriver } from '@/middlewares/guard/is-driver';

const MeRoutes = {
  listNotifications: createRouteConfig({
    description: "Get current user's notifications",
    guard: [isDriver],
    responses: {
      200: {
        description: "Successfully retrieved current user's notifications.",
      },
      ...errorResponses,
    },
    tags: ['notifications'],
  }),
};

export default MeRoutes;
