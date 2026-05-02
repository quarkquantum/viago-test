import { SystemRoles } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema, cameroonPhoneNumberSchema } from './common';

export const createAdminSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(64).trim(),
  phoneNumber: cameroonPhoneNumberSchema.optional(),
  role: z.enum([SystemRoles.ADMIN, SystemRoles.SUPER_ADMIN]),
});

export const updateAdminSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().min(1).max(64).trim().optional(),
  phoneNumber: cameroonPhoneNumberSchema.optional(),
  role: z.enum([SystemRoles.ADMIN, SystemRoles.SUPER_ADMIN]).optional(),
});

export const listAdminsSchema = baseQuerySchema.extend({
  banned: z.string().optional(),
  role: z.enum([SystemRoles.ADMIN, SystemRoles.SUPER_ADMIN]).optional(),
});
