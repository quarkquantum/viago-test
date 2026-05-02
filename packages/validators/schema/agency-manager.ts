import { AgencyManagerStatus } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema, cameroonPhoneNumberSchema } from './common';

export const agencyManagerQuerySchema = baseQuerySchema.extend({
  status: z.enum(AgencyManagerStatus).optional(),
});

export const createAgencyManagerSchema = z.object({
  agencyId: z.string().min(1),
  firstName: z.string().min(1).max(32).trim(),
  lastName: z.string().min(1).max(32).trim(),
  email: z.string().email(),
  phoneNumber: cameroonPhoneNumberSchema,
});

export const createAgencyManagerSchemaWithoutAgencyId = createAgencyManagerSchema.omit({ agencyId: true });

export const agencyManagerIdSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
});

export const updateAgencyManagerSchema = z.object({
  firstName: z.string().min(1).max(32).trim().optional(),
  lastName: z.string().min(1).max(32).trim().optional(),
  phoneNumber: cameroonPhoneNumberSchema.optional(),
  status: z.enum(AgencyManagerStatus).optional(),
  agencyId: z.string().min(1).optional(),
});
