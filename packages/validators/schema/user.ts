import { SystemRoles } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema, cameroonPhoneNumberSchema } from './common';

export const usernameSchema = z
  .string()
  .min(2, 'username_short')
  .max(32, 'username_long')
  .regex(/^[a-z0-9._]+$/, 'username_invalid_chars');

export const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(32).trim(),
  lastName: z.string().min(1).max(32).trim(),
  phoneNumber: cameroonPhoneNumberSchema,
  role: z.enum([SystemRoles.USER, SystemRoles.CASHIER, SystemRoles.DRIVER, SystemRoles.AGENCY]),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(32).trim().optional(),
  lastName: z.string().min(1).max(32).trim().optional(),
  phoneNumber: cameroonPhoneNumberSchema.optional(),
  role: z.enum([SystemRoles.USER, SystemRoles.CASHIER, SystemRoles.DRIVER, SystemRoles.AGENCY]).optional(),
});

export const updateUserFcmTokenSchema = z.object({
  token: z.string().min(1),
});

export const listUsersSchema = baseQuerySchema.extend({
  banned: z.string().optional(),
  role: z.enum([SystemRoles.USER, SystemRoles.CASHIER, SystemRoles.DRIVER, SystemRoles.AGENCY]).optional(),
});
export const setPasswordSchema = z.object({
  password: z.string().min(8, 'password_short').max(128, 'password_long'),
});
export const getUserSchema = baseQuerySchema.extend({
  role: z.enum([SystemRoles.USER, SystemRoles.CASHIER, SystemRoles.DRIVER, SystemRoles.AGENCY]).optional(),
});

export const banUserSchema = z.object({
  banExpires: z.number().optional(),
  banReason: z.string().optional(),
});
