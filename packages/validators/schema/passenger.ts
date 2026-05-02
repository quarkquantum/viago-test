import { z } from 'zod';
import { baseQuerySchema, cameroonPhoneNumberSchema } from './common';

export const listPassengersSchema = baseQuerySchema.extend({
  email: z.string().email().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export const createPassengerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).trim(),
  lastName: z.string().min(1).trim(),
  phoneNumber: cameroonPhoneNumberSchema,
});
