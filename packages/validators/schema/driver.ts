import { z } from 'zod';
import { baseQuerySchema, cameroonPhoneNumberSchema } from './common';

export const listDriversSchema = baseQuerySchema.extend({
  agencyId: z.string().optional(),
  q: z.string().optional(),
  status: z.string().optional(),
});

export const getDriverSchema = baseQuerySchema.extend({
  q: z.string().optional(),
});

export const createDriverSchema = z.object({
  agencyId: z.string(),
  email: z.string().email(),
  firstName: z.string().min(1).max(32).trim(),
  lastName: z.string().min(1).max(32).trim(),
  phoneNumber: cameroonPhoneNumberSchema,
});

export const createAgencyDriverSchema = createDriverSchema.omit({ agencyId: true });

export const updateDriverSchema = z.object({
  agencyId: z.string().optional(),
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(32).trim().optional(),
  lastName: z.string().min(1).max(32).trim().optional(),
  phoneNumber: cameroonPhoneNumberSchema.optional(),
});
