import { errorResponses } from '@/errors/utils';
import { createRouteConfig } from '@/lib/hono/route-config';
import { isAuthenticated } from '@/middlewares';

export const FeedbackRoutes = {
  createFeedback: createRouteConfig({
    description: 'Submit feedback and rating for a completed trip',
    guard: [isAuthenticated],
    responses: {
      201: {
        description: 'Feedback submitted successfully.',
      },
      ...errorResponses,
    },
    tags: ['feedback'],
  }),
};
