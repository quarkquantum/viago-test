import { StationStatus } from '@repo/shared/constants';
import { z } from 'zod';
import { baseQuerySchema } from './common';

export const createStationSchema = z.object({
  departureTime: z.string().trim(),
  name: z.string().min(1, 'Station name is required').max(255, 'Station name too long').trim(),
  order: z.number().int('Order must be an integer').min(0, 'Order must be non-negative'),
  startingPrice: z.number().min(0, 'Cumulative price must be non-negative'),
  tripId: z.cuid('Invalid trip ID format'),
  cityId: z.cuid('Invalid city ID format'),
});

export const updateStationSchema = z.object({
  departureTime: z.string().trim().optional(),
  name: z.string().min(1, 'Station name is required').max(255, 'Station name too long').trim().optional(),
  order: z.number().int('Order must be an integer').min(0, 'Order must be non-negative').optional(),
  startingPrice: z.number().min(0, 'Cumulative price must be non-negative').optional(),
});

export const listStationsSchema = baseQuerySchema.extend({
  name: z.string().optional(),
  tripId: z.string().optional(),
});

export const updateStationStatusSchema = z.object({
  status: z.enum(StationStatus),
});
