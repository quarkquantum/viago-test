import { z } from 'zod';
import { baseQuerySchema } from './common';

export const listCountriesSchema = baseQuerySchema.extend({
  q: z.string().optional(),
});
