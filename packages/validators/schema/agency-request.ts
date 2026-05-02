import { AgencyRequestStatus } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema, cameroonPhoneNumberSchema } from './common';

export const createAgencyRequestSchema = z
  .object({
    agencyName: z.string().max(255).trim().min(1, 'Agency name is required'),
    legalForm: z
      .string()
      .min(1, 'validation.legalForm')
      .refine((val) => ['SARL', 'SA', 'GIE', 'ENTREPRISE_INDIVIDUELLE', 'OTHER'].includes(val), {
        message: 'validation.legalForm',
      }),
    customLegalForm: z.string().max(100).optional(),
    description: z
      .string()
      .max(1000)
      .optional()
      .nullable()
      .transform((val) => (!val || val.trim() === '' ? undefined : val.trim())),
    firstName: z.string().max(32).trim().min(1, 'First name is required'),
    lastName: z.string().max(32).trim().min(1, 'Last name is required'),
    email: z.string().email().min(1, 'Email is required'),
    phoneNumber: cameroonPhoneNumberSchema,
    countryCode: z.string().min(2).max(3).default('CM'),
    cityId: z.string().min(1, 'City is required'),
    citiesServed: z.array(z.string()).min(1, 'validation.citiesServedRequired'),
    address: z.string().max(255).optional(),
    officialPhone: cameroonPhoneNumberSchema,
    officialEmail: z.string().email().min(1, 'Official email is required'),
    position: z.string().min(1, 'Position is required').max(100),
    customPosition: z.string().max(100).optional(),
    directPhone: cameroonPhoneNumberSchema.optional(),
    directEmail: z.string().email().optional(),
    numberOfAgencies: z.number().int().positive().optional(),
    numberOfBuses: z.number().int().min(1, 'Number of buses is required'),
    busType: z.enum(['NUMBERED', 'NON_NUMBERED', 'MIXTE']).optional(),
    logo: z.string().min(1, 'Logo is required'),
    rccmDocument: z.string().min(1, 'RCCM document is required'),
    taxCardDocument: z.string().min(1, 'Tax card document is required'),
    accountEmail: z.string().email().min(1, 'validation.accountEmail'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  })
  .refine(
    (data) => {
      if (data.legalForm === 'OTHER' && data.customLegalForm) {
        return true;
      }
      return data.legalForm !== 'OTHER';
    },
    {
      message: 'Please specify your legal form',
      path: ['customLegalForm'],
    }
  )
  .refine(
    (data) => {
      if (data.position === 'AUTRE' && data.customPosition) {
        return true;
      }
      return data.position !== 'AUTRE';
    },
    {
      message: 'Please specify your position',
      path: ['customPosition'],
    }
  )
  .refine(
    (data) => {
      if (data.citiesServed && data.citiesServed.length > 0) {
        if (!data.numberOfAgencies) {
          return false;
        }
        return data.citiesServed.length <= data.numberOfAgencies;
      }
      return true;
    },
    {
      message: 'validation.citiesServedMax',
      path: ['citiesServed'],
    }
  );

export const listAgencyRequestsSchema = baseQuerySchema.extend({
  status: z.enum([AgencyRequestStatus.PENDING, AgencyRequestStatus.APPROVED, AgencyRequestStatus.REJECTED]).optional(),
});

export const updateAgencyRequestSchema = z.object({
  rejectionReason: z.string().max(1000).optional(),
});

export const agencyRequestIdSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
});
