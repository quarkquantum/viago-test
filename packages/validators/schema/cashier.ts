import { CashierStatus } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema, cameroonPhoneNumberSchema } from './common';

export const cashierQuerySchema = baseQuerySchema.extend({
  status: z.enum(CashierStatus).optional(),
});

export const createCashierSchema = z.object({
  agencyId: z.string(),
  firstName: z.string().min(1).max(32).trim(),
  lastName: z.string().min(1).max(32).trim(),
  email: z.string().email(),
  phoneNumber: cameroonPhoneNumberSchema,
});

export const createAgencyCashierSchema = createCashierSchema.omit({ agencyId: true });

export const updateCashierSchema = z.object({
  agencyId: z.string().optional(),
  firstName: z.string().min(1).max(32).trim().optional(),
  lastName: z.string().min(1).max(32).trim().optional(),
  email: z.string().optional(),
  phoneNumber: cameroonPhoneNumberSchema.optional(),
});
