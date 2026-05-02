import { z } from 'zod';
import { baseQuerySchema } from './common';

export const listCitiesSchema = baseQuerySchema.extend({
  country: z.string().optional(),
  limit: z.coerce.number().int().positive().max(500).optional().default(10),
});
