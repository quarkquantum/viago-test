import { TicketStatus } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema, cameroonPhoneNumberSchema } from './common';

export const ticketQuerySchema = baseQuerySchema.extend({
  status: z.enum(TicketStatus).optional(),
});

export const listMyTicketsSchema = baseQuerySchema.extend({
  status: z.enum(TicketStatus).optional(),
});

export const refundTicketSchema = z.object({
  reason: z.string().optional(),
});

export const createTicketSchema = z.object({
  fromStationId: z.string(),
  passengerEmail: z.string().email().optional(),
  passengerFirstName: z.string().optional(),
  passengerLastName: z.string().optional(),
  passengerPhone: cameroonPhoneNumberSchema.optional(),
  passengerIdentityDocumentType: z.string().min(1, 'Identity document type is required'),
  passengerIdentityDocumentNumber: z.string().min(1, 'Identity document number is required'),
  seatId: z.string().optional(),
  toStationId: z.string(),
  tripId: z.string(),
  isPaid: z.boolean().default(true),
  locationId: z.string().optional(),
});

export const getTicketsSchema = baseQuerySchema.extend({
  agencyId: z.string().optional(),
  status: z.enum(TicketStatus).optional(),
  tripId: z.string().optional(),
});

export const updateTicketSchema = z.object({
  fromStationId: z.string().optional(),
  passengerEmail: z.email().optional(),
  seatId: z.string().optional(),
  toStationId: z.string().optional(),
});

export const guestTicketLookupSchema = z.object({
  identifier: z.string().min(1),
});
