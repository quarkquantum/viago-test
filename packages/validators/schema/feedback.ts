import { z } from 'zod';

export const createFeedbackSchema = z.object({
  tripId: z.string().cuid('Invalid trip ID format'),
  driverId: z.string().cuid('Invalid driver ID format'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});
