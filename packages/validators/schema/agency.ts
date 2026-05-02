import { AgencyStatus } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema } from './common';

export const createAgencySchema = z.object({
  description: z
    .string()
    .min(2, 'Description must be at least 2 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .transform((val) => val.trim()),
  logo: z.string().min(1, 'Logo is required'),
  name: z.string().min(1, 'Agency name is required').max(255, 'Agency name must be less than 255 characters').trim(),
  status: z.enum([AgencyStatus.ACTIVE, AgencyStatus.INACTIVE]).default(AgencyStatus.ACTIVE),
  countryCode: z.string().min(1, 'Country is required').max(3),
  cityId: z.string().min(1, 'City is required'),
});

export const updateAgencySchema = z.object({
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable()
    .transform((val) => (!val || val.trim() === '' ? undefined : val.trim())),
  logo: z.string().optional(),
  name: z
    .string()
    .min(1, 'Agency name is required')
    .max(255, 'Agency name must be less than 255 characters')
    .trim()
    .optional(),
  status: z.enum([AgencyStatus.ACTIVE, AgencyStatus.SUSPENDED, AgencyStatus.INACTIVE]).optional(),
});

export const updateAgencyStatusSchema = z.object({
  status: z.enum([AgencyStatus.ACTIVE, AgencyStatus.SUSPENDED, AgencyStatus.INACTIVE]),
});

export const agencyIdSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
});

export const listAgenciesSchema = baseQuerySchema.extend({
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable()
    .transform((val) => (!val || val.trim() === '' ? undefined : val.trim())),
  name: z.string().optional(),
  status: z.enum([AgencyStatus.ACTIVE, AgencyStatus.INACTIVE]).optional(),
});
