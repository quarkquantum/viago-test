import { BusSeatPolicy, BusSeatType, BusStatus } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema } from './common';

export const createBusSchema = z.object({
  agencyId: z.string().optional(),
  licensePlate: z.string(),
  maxPlaces: z
    .number()
    .int('Max places must be an integer')
    .min(1, 'Bus must have at least 1 seat')
    .max(100, 'Bus cannot have more than 100 seats'),
  seatReservationType: z.enum(BusSeatPolicy).optional(),
  title: z.string(),
});

export const updateBusSchema = z.object({
  licensePlate: z.string(),
  maxPlaces: z
    .number()
    .int('Max places must be an integer')
    .min(1, 'Bus must have at least 1 seat')
    .max(100, 'Bus cannot have more than 100 seats'),
  seatReservationType: z.enum(BusSeatPolicy).optional(),
  status: z.enum(BusStatus).optional(),
  title: z.string(),
});

export const busIdSchema = z.object({
  id: z.cuid('Invalid bus ID format'),
});

export const baseBusQuerySchema = baseQuerySchema.extend({
  agencyId: z.string().optional(),
  maxPlaces: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().int().min(1))
    .optional(),
  minPlaces: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().int().min(1))
    .optional(),
  seatReservationType: z.enum(BusSeatPolicy).optional(),
  status: z.enum(BusStatus).optional(),
});

// Bus Seat Schemas
export const createBusSeatSchema = z.object({
  busId: z.cuid('Invalid bus ID format'),
  type: z.enum(BusSeatType).default(BusSeatType.PASSENGER),
});

export const updateBusSeatSchema = z.object({
  type: z.enum(BusSeatType).optional(),
});

export const busSeatIdSchema = z.object({
  id: z.cuid('Invalid bus seat ID format'),
});

export const ListBusesSchema = baseBusQuerySchema.extend({
  licensePlate: z.string().optional(),
});
