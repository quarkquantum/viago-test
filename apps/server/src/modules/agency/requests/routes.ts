import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';

const noGuard = async (_: unknown, next: () => Promise<void>) => next();

export const AgencyRequestRoutes = {
  createRequest: createRouteConfig({
    description: 'Submit an agency registration request',
    guard: noGuard,
    responses: {
      201: {
        description: 'Successfully submitted agency request.',
      },
      ...errorResponses,
    },
    tags: ['agency-requests'],
  }),
};
