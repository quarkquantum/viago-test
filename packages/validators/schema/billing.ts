import { z } from 'zod';
import { baseQuerySchema } from './common';

export const billingQuerySchema = baseQuerySchema.extend({
  status: z.string().optional(),
});

export const extendTrialSchema = z.object({
  months: z.number().int().positive().default(1),
});
